package server

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"

	api_about "github.com/sondrus/tetrad/api/about"
	api_database "github.com/sondrus/tetrad/api/database"
	api_note "github.com/sondrus/tetrad/api/note"
	api_notes "github.com/sondrus/tetrad/api/notes"
	api_settings "github.com/sondrus/tetrad/api/settings"
	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/services"
	"github.com/sondrus/tetrad/static"
)

// Start - start web-server
func Start(address string) {
	router := mux.NewRouter().StrictSlash(true)
	registerAllRoutes(router)

	handler := enableCORS(router)

	datetime := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] Tetrad started on http://%s\n", datetime, address)

	log.Fatal(http.ListenAndServe(address, handler))
}

// registerAllRoutes - register all routes for app
func registerAllRoutes(router *mux.Router) {
	router.Use(detectNoteIDByContext)

	// API routes
	api_note.RegisterRoutes(router)
	api_notes.RegisterRoutes(router)
	api_database.RegisterRoutes(router)
	api_settings.RegisterRoutes(router)
	api_about.RegisterRoutes(router)

	// IFrame
	registerRoutesIFrame(router)

	// Download database
	registerRoutesDownload(router)

	// Home page & static files
	registerRoutesHomepage(router)

	// Static files + 404
	router.NotFoundHandler = http.HandlerFunc(handlerNotFound)
}

// RegisterRoutesHomepage - register routes for homepage (/, index.html, ...)
func registerRoutesHomepage(router *mux.Router) {
	router.HandleFunc("/", homepageHandler).Methods("GET")
	router.HandleFunc("/{file}", homepageHandler).Methods("GET")
}

// homepageHandler - handler for homepage (/, index.html, ...)
func homepageHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// If empty path, then open index.html
	file, ok := mux.Vars(r)["file"]
	if !ok {
		file = "index.html"
	}

	// Open index.html as regular static file
	homepageHandlerStatic(w, r, file)
}

// homepageHandlerStatic - handler for static files (html, css, js, ico, ...)
func homepageHandlerStatic(w http.ResponseWriter, r *http.Request, file string) {
	services.SetCommonResponseHeaders(w)

	// If file exists in embedded files, send it
	data, err := static.GetStaticFilesFS().ReadFile("files/homepage/" + file)
	if err != nil {
		handlerNotFound(w, r)
		return
	}

	// Send response
	w.Header().Set("Content-Type", getContentType(file))
	w.Write(data)
}

// registerRoutesIFrame - register routes for view in <iframe>
func registerRoutesIFrame(router *mux.Router) {
	router.HandleFunc("/iframe/{id:[0-9]+}", iframeHandler).Methods("GET")
}

// iframeHandler - show note (TYPE=IFRAME) in iframe
func iframeHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Get note from database
	ID := r.Context().Value(database.IDKey).(int)
	note, err := services.GetNote(ID)
	if err != nil {
		services.RespondWithError(w, http.StatusNotFound, "Note is not found", nil)
		return
	}

	// Check note type is iframe
	if note.Type != "IFRAME" {
		services.RespondWithError(w, http.StatusBadRequest, "Note type is not iframe", nil)
		return
	}

	// Prepare HTML
	html := fmt.Sprintf(`<div class="iframe_contents">%s</div>`, note.Contents)
	js := `<script src="script.js"></script>`

	// Inject JS to HTML (just one match)
	if !strings.HasPrefix(strings.ToUpper(note.Contents), "<!DOCTYPE") {
		html = fmt.Sprintf(`<!DOCTYPE html>`+
			`<html>`+
			`<head>`+
			`<meta charset="UTF-8">`+
			`<style>html,body{margin:0;padding:0;}</style>`+
			`</head>`+
			`<body>%s</body>`+
			`</html>`, html)
	}

	// Inject JS to HTML <head> (just one match)
	re := regexp.MustCompile(`(?i)` + regexp.QuoteMeta("<head>"))
	found := false
	html = re.ReplaceAllStringFunc(html, func(match string) string {
		if found {
			return match
		}
		found = true
		return match + js
	})

	// Send response
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

// registerRoutesDownload - register routes for database download
func registerRoutesDownload(router *mux.Router) {
	router.HandleFunc("/download", downloadDatabaseHandler).Methods("GET")
}

// downloadDatabaseHandler - download database file
func downloadDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Open file for reading
	filePath := database.GetFilepath()
	file, err := os.Open(filePath)
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, "Failed to open database file", nil)
		return
	}
	defer file.Close()

	// Set download headers
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(filePath))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", database.GetFilesize()))

	// Write file to response
	_, err = io.Copy(w, file)
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, "Failed to send file", nil)
		return
	}
}

// handler404 - handler for static files and non-existent files
func handlerNotFound(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// First, try to load static embedded files
	file := r.URL.Path
	data, err := static.GetStaticFilesFS().ReadFile("files" + file)
	if err == nil {
		w.Header().Set("Content-Type", getContentType(file))
		w.Write(data)
		return
	}

	// If not exists, show 404
	services.RespondWithError(w, http.StatusNotFound, "File not found ..", nil)
}

// enableCORS - for debug purpose
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Expose-Headers", "*")

		// If preflight-request (OPTIONS) => exit immediately
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// getContentType - fet file mime type by extension
func getContentType(fileName string) string {
	mimeTypes := map[string]string{
		// Web
		".html": "text/html",
		".htm":  "text/html",
		".css":  "text/css",
		".xml":  "application/xml",
		".js":   "application/javascript",
		".json": "application/json",

		// Images
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".webp": "image/webp",
		".gif":  "image/gif",
		".svg":  "image/svg+xml",
		".ico":  "image/x-icon",
		".bmp":  "image/bmp",

		// Documents
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".doc":  "application/msword",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".xls":  "application/vnd.ms-excel",
		".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		".ppt":  "application/vnd.ms-powerpoint",
		".rtf":  "application/rtf",
		".pdf":  "application/pdf",
		".txt":  "text/plain",

		// Archives
		".zip": "application/zip",
		".7z":  "application/x-7z-compressed",
		".gz":  "application/gzip",
		".rar": "application/x-rar-compressed",
		".tar": "application/x-tar",
		".bz2": "application/x-bzip2",
		".tgz": "application/x-tar-gz",

		// Music
		".mp3":  "audio/mpeg",
		".ogg":  "audio/ogg",
		".midi": "audio/midi",
		".wav":  "audio/wav",

		// Other
		".exe": "application/x-msdownload",
	}

	for ext, mimeType := range mimeTypes {
		if strings.HasSuffix(fileName, ext) {
			return mimeType
		}
	}

	return "application/octet-stream"
}

// detectNoteIDByContext - middleware for extract note ID from URL
func detectNoteIDByContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Do not use ID in post-methods
		if r.Method == http.MethodPost {
			next.ServeHTTP(w, r)
			return
		}

		// Check param `id` is exists in URL
		vars := mux.Vars(r)
		idStr, ok := vars["id"]
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		// Convert to int
		id, err := strconv.Atoi(idStr)
		if err != nil {
			services.RespondWithError(w, http.StatusBadRequest, "Invalid note ID format", err)
			return
		}

		// Check `id` is greater than 0
		if id <= 0 {
			services.RespondWithError(w, http.StatusBadRequest, "Wrong note ID in query", nil)
			return
		}

		// Add `id` to context
		ctx := context.WithValue(r.Context(), database.IDKey, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
