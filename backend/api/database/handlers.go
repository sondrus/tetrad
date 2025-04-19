package database

import (
	"encoding/json"
	"net/http"

	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/services"
)

// OptimizeDatabaseHandler - GET
func OptimizeDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	size := database.GetFilesize()

	success, err := database.Vacuum()
	errorMessage := ""
	if err != nil {
		errorMessage = err.Error()
	}

	response := map[string]any{
		"success":  success,
		"error":    errorMessage,
		"size_old": size,
		"size_new": database.GetFilesize(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
