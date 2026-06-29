package http

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"

	"github.com/andre/vector/backend/internal/config"
)

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	m.Run()
}

func newTestRouter() *gin.Engine {
	return NewRouter(config.Config{CORSOrigins: "*"})
}

func doRequest(t *testing.T, r http.Handler, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()

	var reader io.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		reader = bytes.NewReader(raw)
	}

	req := httptest.NewRequest(method, path, reader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func decode(t *testing.T, w *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode body %q: %v", w.Body.String(), err)
	}
	return out
}

func validRun(playerID, levelID string, score int) map[string]any {
	return map[string]any{
		"playerId":         playerID,
		"levelId":          levelID,
		"levelVersion":     "0.1.0",
		"score":            score,
		"durationMs":       100000,
		"rescuedSurvivors": 1,
		"totalSurvivors":   1,
		"energyRemaining":  10,
		"result":           "victory",
		"clientVersion":    "0.1.0",
	}
}

func TestHealth(t *testing.T) {
	r := newTestRouter()
	w := doRequest(t, r, http.MethodGet, "/health", nil)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	body := decode(t, w)
	if body["status"] != "ok" || body["service"] != "vector-api" || body["version"] != "0.1.0" {
		t.Fatalf("unexpected health body: %v", body)
	}
}

func TestCreateRunVictoryRanking(t *testing.T) {
	r := newTestRouter()

	// First victory on an empty board ranks 1.
	w := doRequest(t, r, http.MethodPost, "/api/v1/runs", validRun("player-1", "level-001", 1000))
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d (body=%s)", w.Code, http.StatusCreated, w.Body.String())
	}
	body := decode(t, w)
	if body["accepted"] != true {
		t.Fatalf("accepted = %v, want true", body["accepted"])
	}
	if pos, ok := body["rankPosition"].(float64); !ok || int(pos) != 1 {
		t.Fatalf("rankPosition = %v, want 1", body["rankPosition"])
	}

	// A higher-score victory for the same level takes rank 1.
	w = doRequest(t, r, http.MethodPost, "/api/v1/runs", validRun("player-2", "level-001", 2000))
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusCreated)
	}
	body = decode(t, w)
	if pos, ok := body["rankPosition"].(float64); !ok || int(pos) != 1 {
		t.Fatalf("rankPosition = %v, want 1", body["rankPosition"])
	}

	// The leaderboard should reflect the new ordering.
	w = doRequest(t, r, http.MethodGet, "/api/v1/leaderboard?levelId=level-001", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	body = decode(t, w)
	entries, ok := body["entries"].([]any)
	if !ok || len(entries) != 2 {
		t.Fatalf("entries = %v, want 2", body["entries"])
	}

	first := entries[0].(map[string]any)
	second := entries[1].(map[string]any)
	if first["playerId"] != "player-2" || int(first["score"].(float64)) != 2000 || int(first["position"].(float64)) != 1 {
		t.Fatalf("first entry unexpected: %v", first)
	}
	if second["playerId"] != "player-1" || int(second["score"].(float64)) != 1000 || int(second["position"].(float64)) != 2 {
		t.Fatalf("second entry unexpected: %v", second)
	}
}

func TestCreateRunNonVictoryHasNullRank(t *testing.T) {
	r := newTestRouter()

	run := validRun("player-1", "level-001", 0)
	run["result"] = "death"
	cause := "asphyxiation"
	run["deathCause"] = cause

	w := doRequest(t, r, http.MethodPost, "/api/v1/runs", run)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d (body=%s)", w.Code, http.StatusCreated, w.Body.String())
	}
	body := decode(t, w)
	if body["rankPosition"] != nil {
		t.Fatalf("rankPosition = %v, want null", body["rankPosition"])
	}
}

func TestCreateRunInvalidResult(t *testing.T) {
	r := newTestRouter()

	run := validRun("player-1", "level-001", 100)
	run["result"] = "explosion" // not in the oneof set

	w := doRequest(t, r, http.MethodPost, "/api/v1/runs", run)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}

	body := decode(t, w)
	errObj, ok := body["error"].(map[string]any)
	if !ok {
		t.Fatalf("missing error envelope: %v", body)
	}
	if errObj["code"] != "invalid_request" {
		t.Fatalf("error code = %v, want invalid_request", errObj["code"])
	}
	if _, ok := errObj["message"].(string); !ok {
		t.Fatalf("error message missing: %v", errObj)
	}
}

func TestCreateRunMissingRequiredField(t *testing.T) {
	r := newTestRouter()

	run := validRun("player-1", "level-001", 100)
	delete(run, "playerId") // required

	w := doRequest(t, r, http.MethodPost, "/api/v1/runs", run)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
	body := decode(t, w)
	errObj := body["error"].(map[string]any)
	if errObj["code"] != "invalid_request" {
		t.Fatalf("error code = %v, want invalid_request", errObj["code"])
	}
}

func TestCreateRunNegativeScoreMessage(t *testing.T) {
	r := newTestRouter()

	run := validRun("player-1", "level-001", -5)

	w := doRequest(t, r, http.MethodPost, "/api/v1/runs", run)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
	body := decode(t, w)
	errObj := body["error"].(map[string]any)
	if errObj["message"] != "score must be greater than or equal to zero" {
		t.Fatalf("message = %v, want the documented score message", errObj["message"])
	}
}

func TestLeaderboardSortAndLimit(t *testing.T) {
	r := newTestRouter()

	for _, s := range []int{500, 1500, 1000} {
		w := doRequest(t, r, http.MethodPost, "/api/v1/runs", validRun("p-"+strconv.Itoa(s), "level-001", s))
		if w.Code != http.StatusCreated {
			t.Fatalf("seed run status = %d", w.Code)
		}
	}

	w := doRequest(t, r, http.MethodGet, "/api/v1/leaderboard?levelId=level-001&limit=2", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	body := decode(t, w)
	entries := body["entries"].([]any)
	if len(entries) != 2 {
		t.Fatalf("entries len = %d, want 2 (limit respected)", len(entries))
	}

	first := entries[0].(map[string]any)
	second := entries[1].(map[string]any)
	if int(first["score"].(float64)) != 1500 {
		t.Fatalf("first score = %v, want 1500", first["score"])
	}
	if int(second["score"].(float64)) != 1000 {
		t.Fatalf("second score = %v, want 1000", second["score"])
	}
}

func TestLeaderboardEmptyReturnsArray(t *testing.T) {
	r := newTestRouter()

	w := doRequest(t, r, http.MethodGet, "/api/v1/leaderboard", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	body := decode(t, w)
	if body["levelId"] != "level-001" || body["period"] != "all" {
		t.Fatalf("unexpected defaults: %v", body)
	}
	entries, ok := body["entries"].([]any)
	if !ok || len(entries) != 0 {
		t.Fatalf("entries = %v, want empty array", body["entries"])
	}
}

func TestCreatePlayer(t *testing.T) {
	r := newTestRouter()

	w := doRequest(t, r, http.MethodPost, "/api/v1/players", map[string]any{
		"displayName": "Ana",
		"anonymous":   false,
		"email":       "ana@example.com",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d (body=%s)", w.Code, http.StatusCreated, w.Body.String())
	}

	body := decode(t, w)
	if id, ok := body["id"].(string); !ok || id == "" {
		t.Fatalf("id = %v, want non-empty string", body["id"])
	}
	if body["displayName"] != "Ana" {
		t.Fatalf("displayName = %v, want Ana", body["displayName"])
	}
	if body["anonymous"] != false {
		t.Fatalf("anonymous = %v, want false", body["anonymous"])
	}
}

func TestCreatePlayerGeneratesName(t *testing.T) {
	r := newTestRouter()

	w := doRequest(t, r, http.MethodPost, "/api/v1/players", map[string]any{"anonymous": true})
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusCreated)
	}
	body := decode(t, w)
	name, ok := body["displayName"].(string)
	if !ok || len(name) < len("VECTOR-") || name[:len("VECTOR-")] != "VECTOR-" {
		t.Fatalf("generated displayName = %v, want VECTOR- prefix", body["displayName"])
	}
}

func TestProgressDefaultAndRoundTrip(t *testing.T) {
	r := newTestRouter()

	// Unknown player gets the default progress.
	w := doRequest(t, r, http.MethodGet, "/api/v1/players/unknown-id/progress", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}
	body := decode(t, w)
	if body["playerId"] != "unknown-id" {
		t.Fatalf("playerId = %v", body["playerId"])
	}
	unlocked := body["unlockedLevels"].([]any)
	if len(unlocked) != 1 || unlocked[0] != "level-001" {
		t.Fatalf("unlockedLevels = %v, want [level-001]", body["unlockedLevels"])
	}
	upgrades := body["upgrades"].(map[string]any)
	if int(upgrades["energyTank"].(float64)) != 0 {
		t.Fatalf("default energyTank = %v, want 0", upgrades["energyTank"])
	}

	// Store new progress, then read it back.
	put := doRequest(t, r, http.MethodPut, "/api/v1/players/player-9/progress", map[string]any{
		"unlockedLevels": []string{"level-001", "level-002"},
		"upgrades":       map[string]any{"energyTank": 2, "thrusterEfficiency": 1, "scannerRange": 1},
		"achievements":   []string{"first_rescue"},
	})
	if put.Code != http.StatusOK {
		t.Fatalf("put status = %d, want %d (body=%s)", put.Code, http.StatusOK, put.Body.String())
	}
	putBody := decode(t, put)
	if putBody["updated"] != true || putBody["playerId"] != "player-9" {
		t.Fatalf("unexpected put response: %v", putBody)
	}

	got := doRequest(t, r, http.MethodGet, "/api/v1/players/player-9/progress", nil)
	gotBody := decode(t, got)
	gotUnlocked := gotBody["unlockedLevels"].([]any)
	if len(gotUnlocked) != 2 {
		t.Fatalf("unlockedLevels = %v, want 2 entries", gotBody["unlockedLevels"])
	}
	gotUpgrades := gotBody["upgrades"].(map[string]any)
	if int(gotUpgrades["energyTank"].(float64)) != 2 {
		t.Fatalf("energyTank = %v, want 2", gotUpgrades["energyTank"])
	}
	// bestRuns must serialize as [] even though it was omitted on PUT.
	if _, ok := gotBody["bestRuns"].([]any); !ok {
		t.Fatalf("bestRuns = %v, want array", gotBody["bestRuns"])
	}
}

func TestCORSPreflight(t *testing.T) {
	r := newTestRouter()

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/runs", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("preflight status = %d, want %d", w.Code, http.StatusNoContent)
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("Allow-Origin = %q, want *", got)
	}
	if got := w.Header().Get("Access-Control-Allow-Methods"); got == "" {
		t.Fatalf("Allow-Methods missing")
	}
}
