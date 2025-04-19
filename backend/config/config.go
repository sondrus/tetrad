package config

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

// Config - main struct for command-line options
type Config struct {
	Host     string
	Port     string
	Database string
}

// AppConfig - config values
var AppConfig Config

// Load - load config values
func Load() {
	// Get user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("cannot get user home directory: %v", err.Error())
		return
	}

	// Defaults
	defaultHost := "localhost"
	defaultPort := "8888"
	defaultDB := filepath.Join(homeDir, ".tetrad", "database.db")

	// Host and port
	host := flag.String("host", defaultHost, "Host to bind the server to")
	port := flag.String("port", defaultPort, "Port to run the server on")

	// Database
	database := flag.String("database", defaultDB, "Path to the SQLite database file")

	// Parse data
	flag.Parse()

	// Create database directory if it doesn't exist
	dir := filepath.Dir(*database)
	err = os.MkdirAll(dir, 0700)
	if err != nil {
		log.Fatal(err)
		return
	}

	// Init config
	AppConfig = Config{
		Host:     *host,
		Port:     *port,
		Database: *database,
	}
}

// GetLocalAddress - build URL (eg, localhost:8888)
func GetLocalAddress() string {
	host := AppConfig.Host
	port := AppConfig.Port

	if len(host) == 0 {
		host = "localhost"
	}

	return fmt.Sprintf("%s:%s", host, port)
}
