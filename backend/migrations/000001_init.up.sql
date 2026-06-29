CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name VARCHAR(40) NOT NULL,
  email VARCHAR(255),
  anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_players_email_unique
  ON players (lower(email))
  WHERE email IS NOT NULL;

CREATE TABLE levels (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  version VARCHAR(40) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_levels_enabled ON levels (enabled);

CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id VARCHAR(80) NOT NULL REFERENCES levels(id),
  level_version VARCHAR(40) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  rescued_survivors INTEGER NOT NULL CHECK (rescued_survivors >= 0),
  total_survivors INTEGER NOT NULL CHECK (total_survivors >= 0),
  energy_remaining INTEGER NOT NULL CHECK (energy_remaining >= 0),
  result VARCHAR(20) NOT NULL CHECK (result IN ('victory', 'death', 'abandoned')),
  death_cause VARCHAR(80),
  client_version VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_runs_player_id ON runs (player_id);
CREATE INDEX idx_runs_level_score ON runs (level_id, score DESC, duration_ms ASC);
CREATE INDEX idx_runs_created_at ON runs (created_at DESC);

CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL UNIQUE REFERENCES runs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id VARCHAR(80) NOT NULL REFERENCES levels(id),
  score INTEGER NOT NULL CHECK (score >= 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  rank_scope VARCHAR(20) NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leaderboard_level_scope_score
  ON leaderboard_entries (level_id, rank_scope, score DESC, duration_ms ASC, created_at ASC);

CREATE TABLE player_progress (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  unlocked_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
  upgrades JSONB NOT NULL DEFAULT '{}'::jsonb,
  best_runs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_player_progress_unlocked_levels
  ON player_progress USING GIN (unlocked_levels);

CREATE TABLE achievements (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE player_achievements (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id VARCHAR(80) NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_achievement_id
  ON player_achievements (achievement_id);
