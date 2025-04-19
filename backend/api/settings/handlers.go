package settings

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/sondrus/tetrad/services"
)

// LoadSettingsHandler - GET - load frontend settings
func LoadSettingsHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Load settings from DB and transform to settings tree
	settings, err := services.LoadSettings()
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Error loading settings: %v", err), nil)
		return
	}

	// Create response
	response := map[string]any{
		"success":    true,
		"settings":   settings,
		"hljsThemes": services.GetHljsThemes(),
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SaveSettingsHandler - PUT - save frontend settings
func SaveSettingsHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Decode request json into map
	var settings map[string]any
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&settings); err != nil {
		services.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON: %v", err), nil)
		return
	}

	// Save settings to DB
	services.SaveSettings(settings)

	// Create response
	response := map[string]any{
		"success": true,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
