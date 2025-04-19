package main

import (
	"log"

	"github.com/sondrus/tetrad/config"
	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/server"
)

func main() {
	config.Load()

	if err := database.LoadDatabase(config.AppConfig.Database); err != nil {
		log.Fatalf("Failed to load database: %s", err)
	}

	server.Start(config.GetLocalAddress())
}
