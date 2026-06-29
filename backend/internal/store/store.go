// Package store provides an in-memory, thread-safe data store used by the
// MVP-2 skeleton. It deliberately requires no database so the backend is
// demonstrable on its own.
package store

import (
	"sort"
	"sync"
	"time"

	"github.com/andre/vector/backend/internal/models"
)

// Store is a concurrency-safe in-memory repository for players, runs,
// leaderboard entries and player progress.
type Store struct {
	mu          sync.RWMutex
	players     map[string]models.Player
	runs        map[string]models.Run
	leaderboard []models.LeaderboardEntry
	progress    map[string]models.Progress
}

// New returns an initialized, empty Store.
func New() *Store {
	return &Store{
		players:  make(map[string]models.Player),
		runs:     make(map[string]models.Run),
		progress: make(map[string]models.Progress),
	}
}

// CreatePlayer stores a player.
func (s *Store) CreatePlayer(p models.Player) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.players[p.ID] = p
}

// GetPlayer returns a player by id.
func (s *Store) GetPlayer(id string) (models.Player, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.players[id]
	return p, ok
}

// CreateRun stores a run.
func (s *Store) CreateRun(r models.Run) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.runs[r.ID] = r
}

// AddLeaderboardEntry appends an entry and returns its 1-based rank position
// among all entries for the same level, ordered by score DESC, durationMs ASC,
// then createdAt ASC.
func (s *Store) AddLeaderboardEntry(e models.LeaderboardEntry) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.leaderboard = append(s.leaderboard, e)

	same := make([]models.LeaderboardEntry, 0, len(s.leaderboard))
	for _, le := range s.leaderboard {
		if le.LevelID == e.LevelID {
			same = append(same, le)
		}
	}
	sortEntries(same)

	for i, le := range same {
		if le.ID == e.ID {
			return i + 1
		}
	}
	return len(same)
}

// Leaderboard returns the sorted, period-filtered leaderboard entries for a
// level. period may be "all", "daily", "weekly" or "monthly"; any other value
// is treated as "all". limit, when positive, caps the number of results.
func (s *Store) Leaderboard(levelID, period string, limit int, now time.Time) []models.LeaderboardEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var window time.Duration
	switch period {
	case "daily":
		window = 24 * time.Hour
	case "weekly":
		window = 7 * 24 * time.Hour
	case "monthly":
		window = 30 * 24 * time.Hour
	}
	cutoff := now.Add(-window)

	out := make([]models.LeaderboardEntry, 0, len(s.leaderboard))
	for _, e := range s.leaderboard {
		if e.LevelID != levelID {
			continue
		}
		if window > 0 && e.CreatedAt.Before(cutoff) {
			continue
		}
		out = append(out, e)
	}
	sortEntries(out)

	if limit > 0 && len(out) > limit {
		out = out[:limit]
	}
	return out
}

// GetProgress returns the stored progress for a player.
func (s *Store) GetProgress(id string) (models.Progress, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.progress[id]
	return p, ok
}

// SetProgress stores the progress for a player.
func (s *Store) SetProgress(id string, p models.Progress) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.progress[id] = p
}

// sortEntries sorts in place by score DESC, durationMs ASC, createdAt ASC.
func sortEntries(entries []models.LeaderboardEntry) {
	sort.SliceStable(entries, func(i, j int) bool {
		a, b := entries[i], entries[j]
		if a.Score != b.Score {
			return a.Score > b.Score
		}
		if a.DurationMs != b.DurationMs {
			return a.DurationMs < b.DurationMs
		}
		return a.CreatedAt.Before(b.CreatedAt)
	})
}
