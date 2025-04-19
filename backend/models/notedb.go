package models

import "time"

// NoteDB - struct for storage notes
type NoteDB struct {
	ID           int64  `gorm:"column:ID;primaryKey" json:"id"`
	ParentID     int64  `gorm:"column:PARENT_ID" json:"parentId"`
	Depth        int64  `gorm:"column:DEPTH" json:"depth"`
	Left         int64  `gorm:"column:LEFT" json:"left"`
	Right        int64  `gorm:"column:RIGHT" json:"right"`
	Expanded     bool   `gorm:"column:EXPANDED;type:INTEGER" json:"expanded"`
	Readonly     bool   `gorm:"column:READONLY;type:INTEGER" json:"readonly"`
	Icon         int64  `gorm:"column:ICON" json:"icon"`
	Type         string `gorm:"column:TYPE" json:"type"`
	Title        string `gorm:"column:TITLE" json:"title"`
	Contents     string `gorm:"column:CONTENTS" json:"contents"`
	URL          string `gorm:"column:URL" json:"url"`
	Syntax       string `gorm:"column:SYNTAX" json:"syntax"`
	Favorite     int64  `gorm:"column:FAVORITE" json:"favorite"`
	DateCreated  int64  `gorm:"column:DATE_CREATED" json:"dateCreated"`
	DateModified int64  `gorm:"column:DATE_MODIFIED" json:"dateModified"`

	// Virtual fields
	ContentsLength int64 `gorm:"column:CONTENTS_LENGTH" json:"contentsLength"`
}

// TableName - set custom table name for GORM
func (NoteDB) TableName() string {
	return "notes"
}

// GetDateCreated - convert value to timestamp
func (n *NoteDB) GetDateCreated() time.Time {
	return time.Unix(n.DateCreated, 0)
}

// GetDateModified - convert value to timestamp
func (n *NoteDB) GetDateModified() time.Time {
	return time.Unix(n.DateModified, 0)
}
