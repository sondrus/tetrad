package database

import (
	"github.com/gorilla/mux"
)

// RegisterRoutes - registers all routes for working with `about` info
func RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/about", AboutHandler).Methods("GET")
}
