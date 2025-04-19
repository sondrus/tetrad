package database

import (
	"encoding/json"
	"net/http"

	"github.com/sondrus/tetrad/meta"
	"github.com/sondrus/tetrad/models"
	"github.com/sondrus/tetrad/services"
	"github.com/sondrus/tetrad/utils"
)

// AboutHandler - GET - get `about`	info
func AboutHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)
	services.SetAboutResponseHeaders(w)

	// Read embedded license data
	license, err := utils.GetLicenseText()
	if err != nil {
		license = ""
	}

	// Create response
	response := map[string]any{
		"success": true,
		"app": models.AppData{
			Name:        meta.Name,
			Version:     meta.Version,
			Developer:   meta.Developer,
			LicenseType: meta.License,
			Site:        meta.Site,
			Notes:       meta.Notes,
			Copyrights:  meta.Copyrights,
			LicenseText: license,
		},
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
