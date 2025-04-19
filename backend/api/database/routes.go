package database

import (
	"github.com/gorilla/mux"
)

// RegisterRoutes - Register all routes to work with database
func RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/database/optimize", OptimizeDatabaseHandler).Methods("POST")
}
