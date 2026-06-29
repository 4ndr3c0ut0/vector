// Package models defines the domain models shared across the backend.
package models

import "time"

// Player is a registered (anonymous or identified) player.
type Player struct {
	ID          string
	DisplayName string
	Email       string
	Anonymous   bool
	CreatedAt   time.Time
}

// Run is a single recorded attempt at a level.
type Run struct {
	ID               string
	PlayerID         string
	LevelID          string
	LevelVersion     string
	Score            int
	DurationMs       int
	RescuedSurvivors int
	TotalSurvivors   int
	EnergyRemaining  int
	Result           string
	DeathCause       *string
	ClientVersion    string
	CreatedAt        time.Time
}

// LeaderboardEntry is a ranking record derived from a victorious run.
type LeaderboardEntry struct {
	ID         string
	RunID      string
	PlayerID   string
	LevelID    string
	Score      int
	DurationMs int
	CreatedAt  time.Time
}

// Upgrades captures the per-player upgrade levels. JSON tags drive the API
// response shape directly.
type Upgrades struct {
	EnergyTank         int `json:"energyTank"`
	ThrusterEfficiency int `json:"thrusterEfficiency"`
	ScannerRange       int `json:"scannerRange"`
}

// BestRun is a summary of a player's best run for a level.
type BestRun struct {
	LevelID          string `json:"levelId"`
	Score            int    `json:"score"`
	DurationMs       int    `json:"durationMs"`
	RescuedSurvivors int    `json:"rescuedSurvivors"`
}

// Progress is the persisted progression state for a player.
type Progress struct {
	UnlockedLevels []string
	Upgrades       Upgrades
	BestRuns       []BestRun
	Achievements   []string
	UpdatedAt      time.Time
}
