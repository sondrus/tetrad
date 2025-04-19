package settings

import (
	"github.com/gorilla/mux"
)

// RegisterRoutes - registers all routes for working with the database.
func RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/settings", LoadSettingsHandler).Methods("GET")
	router.HandleFunc("/api/settings", SaveSettingsHandler).Methods("PUT")
}
