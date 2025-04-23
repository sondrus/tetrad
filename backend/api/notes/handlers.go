package notes

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/sondrus/tetrad/services"
)

// GetNotesListHandler - GET - get notes list, sorted by `LEFT`
func GetNotesListHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Get notes list
	notes, err := services.GetNotesList()
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch notes list", err)
	}

	// Create response
	response := map[string]any{
		"success": true,
		"notes":   notes,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetNotesTreeHandler - GET - get notes tree
func GetNotesTreeHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Get notes tree
	notes, err := services.GetNotesTree()
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch notes tree", err)
		return
	}

	// Create response
	response := map[string]any{
		"success": true,
		"notes":   notes,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SearchNotesHandler - GET - search notes by query
func SearchNotesHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Declare JSON POST structure
	var req struct {
		Query string `json:"query"`
		Title bool   `json:"title"`
		Whole bool   `json:"whole"`
	}

	// Decode input JSON
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		services.RespondWithError(w, http.StatusBadRequest, "Invalid JSON", err)
		return
	}

	// Check query text is filled
	if req.Query == "" {
		services.RespondWithError(w, http.StatusBadRequest, "Missing 'query' parameter", nil)
		return
	}

	// If `whole`, use full phrase 'as is', else use words from phrase
	var words []string
	if req.Whole {
		words = []string{req.Query}
	} else {
		words = strings.Fields(req.Query)
	}

	// Prepare SQL WHERE
	var whereConditions []string
	var args []any
	for _, word := range words {
		if req.Title {
			whereConditions = append(whereConditions, "custom_like(TITLE, ?)")
			args = append(args, word)
		} else {
			whereConditions = append(whereConditions,
				"("+
					"custom_like(TITLE, ?) OR "+
					"custom_like(CONTENTS, ?) OR "+
					"(URL IS NOT NULL AND custom_like(URL, ?))"+
					")",
			)
			args = append(args, word, word, word)
		}
	}
	whereClause := strings.Join(whereConditions, " AND ")

	// Get notes with filter
	notes, err := services.GetNotes(services.NoteQueryOptions{
		Where:        whereClause,
		Args:         args,
		OmitContents: true,
	})
	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, "Failed to search notes", err)
		return
	}

	// Create response
	response := map[string]any{
		"success": true,
		"notes":   notes,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ExpandNotesHandler - expand/collapse notes
func ExpandNotesHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Decode into map
	var fields map[string]any
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		services.RespondWithError(w, http.StatusBadRequest, "Invalid JSON", nil)
		return
	}

	// Check collapse and expand
	var collapse, expand []int

	if c, ok := fields["collapse"].([]any); ok {
		for _, id := range c {
			if num, ok := id.(float64); ok {
				collapse = append(collapse, int(num))
			}
		}
	}

	if e, ok := fields["expand"].([]any); ok {
		for _, id := range e {
			if num, ok := id.(float64); ok {
				expand = append(expand, int(num))
			}
		}
	}

	// Execute
	services.SetExpandCollapse(collapse, expand)

	// Create response
	response := map[string]any{
		"success": true,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
