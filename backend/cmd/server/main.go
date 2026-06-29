package main

import (
	"log"

	"github.com/andre/vector/backend/internal/config"
	"github.com/andre/vector/backend/internal/http"
)

func main() {
	cfg := config.Load()
	router := http.NewRouter(cfg)

	addr := ":" + cfg.Port
	log.Printf("vector-api starting env=%s listening on %s", cfg.Env, addr)

	if err := router.Run(addr); err != nil {
		log.Fatal(err)
	}
}
