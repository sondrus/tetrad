package notes

import (
	"github.com/gorilla/mux"
)

// RegisterRoutes - registers all routes for working with note collections
func RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/notes/list", GetNotesListHandler).Methods("GET")
	router.HandleFunc("/api/notes/tree", GetNotesTreeHandler).Methods("GET")
	router.HandleFunc("/api/notes/search", SearchNotesHandler).Methods("POST")
	router.HandleFunc("/api/notes/expand", ExpandNotesHandler).Methods("POST")
}
