package models

// Note - struct for use as a response
type Note struct {
	NoteDB
	Children []*Note `json:"children"`
}
