package services

import (
	"net/http"
	"strconv"

	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/meta"
)

// SetCommonResponseHeaders - set common HTTP headers to response
func SetCommonResponseHeaders(w http.ResponseWriter) {
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Server", meta.Server)

	w.Header().Set("Content-Security-Policy", "frame-ancestors 'self'")
	w.Header().Set("X-Frame-Options", "SAMEORIGIN")

	w.Header().Set("X-Database-File", database.GetFilepath())
	w.Header().Set("X-Database-Size", strconv.FormatInt(database.GetFilesize(), 10))
}

// SetAboutResponseHeaders - set `About` HTTP headers to response
func SetAboutResponseHeaders(w http.ResponseWriter) {
	w.Header().Set("X-App-Name", meta.Name)
	w.Header().Set("X-App-Version", meta.Version)
	w.Header().Set("X-App-Developer", meta.Developer)
	w.Header().Set("X-App-License", meta.License)
	w.Header().Set("X-App-Site", meta.Site)
	w.Header().Set("X-App-Notes", meta.Notes)
	w.Header().Set("X-App-Copyrights", meta.Copyrights)
}
