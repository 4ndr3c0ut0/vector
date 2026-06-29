package config

import (
	"os"
	"strings"
)

// Config holds the runtime configuration loaded from the environment.
type Config struct {
	Port        string
	Env         string
	DatabaseURL string
	RedisURL    string
	CORSOrigins string
}

// Load reads configuration from environment variables, applying sensible
// defaults so the service runs without any external setup.
func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		Env:         getenv("ENV", "development"),
		DatabaseURL: getenv("DATABASE_URL", ""),
		RedisURL:    getenv("REDIS_URL", ""),
		CORSOrigins: getenv("CORS_ORIGINS", "*"),
	}
}

// CORSOriginsList parses CORS_ORIGINS into a slice of trimmed, non-empty
// origins. It returns []string{"*"} when nothing meaningful is configured.
func (c Config) CORSOriginsList() []string {
	raw := strings.TrimSpace(c.CORSOrigins)
	if raw == "" {
		return []string{"*"}
	}

	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}

	if len(out) == 0 {
		return []string{"*"}
	}
	return out
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
