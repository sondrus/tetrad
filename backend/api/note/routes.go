package note

import (
	"github.com/gorilla/mux"
)

// RegisterRoutes - registers all routes for working with a single note
func RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/note/add", PostNoteHandler).Methods("POST")
	router.HandleFunc("/api/note/{id:[0-9]+}", GetNoteHandler).Methods("GET")
	router.HandleFunc("/api/note/{id:[0-9]+}", PatchNoteHandler).Methods("PATCH")
	router.HandleFunc("/api/note/{id:[0-9]+}", DeleteNoteHandler).Methods("DELETE")
}
