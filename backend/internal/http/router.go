package http

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/andre/vector/backend/internal/config"
	"github.com/andre/vector/backend/internal/models"
	"github.com/andre/vector/backend/internal/store"
	"github.com/andre/vector/backend/internal/util"
)

const defaultLevelID = "level-001"

// handler bundles the dependencies shared by the HTTP handlers.
type handler struct {
	store *store.Store
}

// NewRouter builds the Gin engine with all routes, middleware and an in-memory
// store wired in.
func NewRouter(cfg config.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(CORS(cfg.CORSOriginsList()))

	h := &handler{store: store.New()}

	router.GET("/health", health)

	v1 := router.Group("/api/v1")
	{
		v1.POST("/runs", h.createRun)
		v1.GET("/leaderboard", h.getLeaderboard)
		v1.POST("/players", h.createPlayer)
		v1.GET("/players/:id/progress", h.getProgress)
		v1.PUT("/players/:id/progress", h.putProgress)
	}

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, errorEnvelope("not_found", "resource not found"))
	})

	return router
}

func health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "vector-api",
		"version": "0.1.0",
	})
}

func (h *handler) createRun(c *gin.Context) {
	var req RunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorEnvelope("invalid_request", validationMessage(err)))
		return
	}

	now := time.Now().UTC()
	run := models.Run{
		ID:               util.NewUUID(),
		PlayerID:         req.PlayerID,
		LevelID:          req.LevelID,
		LevelVersion:     req.LevelVersion,
		Score:            req.Score,
		DurationMs:       req.DurationMs,
		RescuedSurvivors: req.RescuedSurvivors,
		TotalSurvivors:   req.TotalSurvivors,
		EnergyRemaining:  req.EnergyRemaining,
		Result:           req.Result,
		DeathCause:       req.DeathCause,
		ClientVersion:    req.ClientVersion,
		CreatedAt:        now,
	}
	h.store.CreateRun(run)

	// Only victories enter the standard ranking. Death/abandoned runs are
	// recorded but get no rank position ("Morte: pontuacao nao entra no
	// ranking padrao").
	var rankPosition *int
	if run.Result == "victory" {
		pos := h.store.AddLeaderboardEntry(models.LeaderboardEntry{
			ID:         util.NewUUID(),
			RunID:      run.ID,
			PlayerID:   run.PlayerID,
			LevelID:    run.LevelID,
			Score:      run.Score,
			DurationMs: run.DurationMs,
			CreatedAt:  now,
		})
		rankPosition = &pos
	}

	c.JSON(http.StatusCreated, RunResponse{
		ID:           run.ID,
		Accepted:     true,
		RankPosition: rankPosition,
		CreatedAt:    now.Format(time.RFC3339),
	})
}

func (h *handler) getLeaderboard(c *gin.Context) {
	levelID := c.DefaultQuery("levelId", defaultLevelID)
	period := normalizePeriod(c.DefaultQuery("period", "all"))
	limit := parseLimit(c.DefaultQuery("limit", "50"))

	entries := h.store.Leaderboard(levelID, period, limit, time.Now().UTC())

	out := make([]LeaderboardEntryResponse, 0, len(entries))
	for i, e := range entries {
		out = append(out, LeaderboardEntryResponse{
			Position:    i + 1,
			PlayerID:    e.PlayerID,
			DisplayName: h.displayName(e.PlayerID),
			Score:       e.Score,
			DurationMs:  e.DurationMs,
			CreatedAt:   e.CreatedAt.Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, LeaderboardResponse{
		LevelID: levelID,
		Period:  period,
		Entries: out,
	})
}

func (h *handler) createPlayer(c *gin.Context) {
	var req PlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorEnvelope("invalid_request", validationMessage(err)))
		return
	}

	name := strings.TrimSpace(req.DisplayName)
	if name == "" {
		// 100..9999 -> three or four digits, matching "VECTOR-742".
		name = fmt.Sprintf("VECTOR-%d", 100+util.RandInt(9900))
	}

	now := time.Now().UTC()
	player := models.Player{
		ID:          util.NewUUID(),
		DisplayName: name,
		Email:       strings.TrimSpace(req.Email),
		Anonymous:   req.Anonymous,
		CreatedAt:   now,
	}
	h.store.CreatePlayer(player)

	c.JSON(http.StatusCreated, PlayerResponse{
		ID:          player.ID,
		DisplayName: player.DisplayName,
		Anonymous:   player.Anonymous,
		CreatedAt:   now.Format(time.RFC3339),
	})
}

func (h *handler) getProgress(c *gin.Context) {
	id := c.Param("id")

	p, ok := h.store.GetProgress(id)
	if !ok {
		p = defaultProgress()
	}
	p = normalizeProgress(p)

	c.JSON(http.StatusOK, ProgressResponse{
		PlayerID:       id,
		UnlockedLevels: p.UnlockedLevels,
		Upgrades:       p.Upgrades,
		BestRuns:       p.BestRuns,
		Achievements:   p.Achievements,
	})
}

func (h *handler) putProgress(c *gin.Context) {
	id := c.Param("id")

	var req ProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorEnvelope("invalid_request", validationMessage(err)))
		return
	}

	now := time.Now().UTC()
	h.store.SetProgress(id, normalizeProgress(models.Progress{
		UnlockedLevels: req.UnlockedLevels,
		Upgrades:       req.Upgrades,
		BestRuns:       req.BestRuns,
		Achievements:   req.Achievements,
		UpdatedAt:      now,
	}))

	c.JSON(http.StatusOK, gin.H{
		"playerId":  id,
		"updated":   true,
		"updatedAt": now.Format(time.RFC3339),
	})
}

// displayName resolves a player's display name, falling back to a stable
// derived name for unknown players.
func (h *handler) displayName(playerID string) string {
	if p, ok := h.store.GetPlayer(playerID); ok {
		if name := strings.TrimSpace(p.DisplayName); name != "" {
			return name
		}
	}
	return fallbackName(playerID)
}

func fallbackName(playerID string) string {
	hexOnly := strings.ReplaceAll(playerID, "-", "")
	n := 4
	if len(hexOnly) < n {
		n = len(hexOnly)
	}
	return "VECTOR-" + strings.ToUpper(hexOnly[:n])
}

func defaultProgress() models.Progress {
	return models.Progress{
		UnlockedLevels: []string{defaultLevelID},
		Upgrades:       models.Upgrades{},
		BestRuns:       []models.BestRun{},
		Achievements:   []string{},
	}
}

// normalizeProgress guarantees slices marshal as [] rather than null.
func normalizeProgress(p models.Progress) models.Progress {
	if p.UnlockedLevels == nil {
		p.UnlockedLevels = []string{}
	}
	if p.BestRuns == nil {
		p.BestRuns = []models.BestRun{}
	}
	if p.Achievements == nil {
		p.Achievements = []string{}
	}
	return p
}

func normalizePeriod(period string) string {
	switch period {
	case "all", "daily", "weekly", "monthly":
		return period
	default:
		return "all"
	}
}

func parseLimit(raw string) int {
	limit, err := strconv.Atoi(raw)
	if err != nil {
		limit = 50
	}
	if limit < 1 {
		limit = 1
	}
	if limit > 200 {
		limit = 200
	}
	return limit
}

func errorEnvelope(code, message string) gin.H {
	return gin.H{
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	}
}

// validationMessage turns a binding error into a human-friendly message,
// using the documented wording for a negative score.
func validationMessage(err error) string {
	var verrs validator.ValidationErrors
	if errors.As(err, &verrs) {
		for _, fe := range verrs {
			if fe.Field() == "Score" && fe.Tag() == "min" {
				return "score must be greater than or equal to zero"
			}
		}
		if len(verrs) > 0 {
			fe := verrs[0]
			return fmt.Sprintf("field %q failed validation on the %q rule", fe.Field(), fe.Tag())
		}
	}
	return err.Error()
}
