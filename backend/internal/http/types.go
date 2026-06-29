package http

import "github.com/andre/vector/backend/internal/models"

// RunRequest is the body for POST /api/v1/runs.
type RunRequest struct {
	PlayerID         string  `json:"playerId" binding:"required"`
	LevelID          string  `json:"levelId" binding:"required"`
	LevelVersion     string  `json:"levelVersion" binding:"required"`
	Score            int     `json:"score" binding:"min=0"`
	DurationMs       int     `json:"durationMs" binding:"min=0"`
	RescuedSurvivors int     `json:"rescuedSurvivors" binding:"min=0"`
	TotalSurvivors   int     `json:"totalSurvivors" binding:"min=0"`
	EnergyRemaining  int     `json:"energyRemaining" binding:"min=0"`
	Result           string  `json:"result" binding:"required,oneof=victory death abandoned"`
	DeathCause       *string `json:"deathCause"`
	ClientVersion    string  `json:"clientVersion" binding:"required"`
}

// RunResponse is the body returned by POST /api/v1/runs.
type RunResponse struct {
	ID           string `json:"id"`
	Accepted     bool   `json:"accepted"`
	RankPosition *int   `json:"rankPosition"`
	CreatedAt    string `json:"createdAt"`
}

// LeaderboardEntryResponse is a single ranking row.
type LeaderboardEntryResponse struct {
	Position    int    `json:"position"`
	PlayerID    string `json:"playerId"`
	DisplayName string `json:"displayName"`
	Score       int    `json:"score"`
	DurationMs  int    `json:"durationMs"`
	CreatedAt   string `json:"createdAt"`
}

// LeaderboardResponse is the body returned by GET /api/v1/leaderboard.
type LeaderboardResponse struct {
	LevelID string                     `json:"levelId"`
	Period  string                     `json:"period"`
	Entries []LeaderboardEntryResponse `json:"entries"`
}

// PlayerRequest is the body for POST /api/v1/players.
type PlayerRequest struct {
	DisplayName string `json:"displayName"`
	Anonymous   bool   `json:"anonymous"`
	Email       string `json:"email"`
}

// PlayerResponse is the body returned by POST /api/v1/players.
type PlayerResponse struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Anonymous   bool   `json:"anonymous"`
	CreatedAt   string `json:"createdAt"`
}

// ProgressRequest is the body for PUT /api/v1/players/:id/progress.
type ProgressRequest struct {
	UnlockedLevels []string         `json:"unlockedLevels"`
	Upgrades       models.Upgrades  `json:"upgrades"`
	BestRuns       []models.BestRun `json:"bestRuns"`
	Achievements   []string         `json:"achievements"`
}

// ProgressResponse is the body returned by GET /api/v1/players/:id/progress.
type ProgressResponse struct {
	PlayerID       string           `json:"playerId"`
	UnlockedLevels []string         `json:"unlockedLevels"`
	Upgrades       models.Upgrades  `json:"upgrades"`
	BestRuns       []models.BestRun `json:"bestRuns"`
	Achievements   []string         `json:"achievements"`
}
