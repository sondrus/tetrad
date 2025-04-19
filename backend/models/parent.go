package models

// Parent - struct for note parent info
type Parent struct {
	ID       int64  `json:"id"`
	ParentID int64  `json:"parent_id"`
	Title    string `json:"title"`
	Depth    int64  `json:"depth"`
}
