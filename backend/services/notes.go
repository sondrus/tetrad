package services

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/models"
	"gorm.io/gorm"
)

// NoteQueryOptions - arguments struct for func GetNotes
type NoteQueryOptions struct {
	Where        string
	Args         []any
	Order        string
	Limit        int
	OmitContents bool
}

// NormalizeNoteKeys - normalize keys for update (convert from JSON to GORM)
func NormalizeNoteKeys(fields map[string]any) map[string]any {
	result := make(map[string]any)

	// Get NoteDB struct
	var note models.NoteDB
	t := reflect.TypeOf(note)

	// Build a map: json -> gorm_column
	jsonToGorm := make(map[string]string)

	for i := range t.NumField() {
		field := t.Field(i)

		// Get data from annotation
		jsonTag := field.Tag.Get("json")
		gormTag := field.Tag.Get("gorm")

		// Skip if there are no json or gorm tags
		if jsonTag == "" || gormTag == "" {
			continue
		}

		// Search for column:NAME in gorm tag
		parts := strings.SplitSeq(gormTag, ";")
		for part := range parts {
			if strings.HasPrefix(part, "column:") {
				column := strings.TrimPrefix(part, "column:")
				jsonToGorm[jsonTag] = column
				break
			}
		}
	}

	// Transform keys by map
	for key, value := range fields {
		if column, ok := jsonToGorm[key]; ok {
			result[column] = value
		}
	}

	return result
}

// GetNotes - general method for get note list
func GetNotes(opts NoteQueryOptions) ([]models.NoteDB, error) {
	db := database.GetORM()
	var notes []models.NoteDB

	query := db.Model(&models.NoteDB{})

	// Exclude CONTENTS and virtual CONTENTS_LENGTH from SELECT
	exclude := []string{}

	if opts.OmitContents {
		exclude = append(exclude, "CONTENTS")
	}
	exclude = append(exclude, "CONTENTS_LENGTH")

	fields := database.GetFields(&models.NoteDB{}, exclude)

	// Add own CONTENTS_LENGTH to SELECT
	fields = append(fields, "LENGTH(CONTENTS) AS CONTENTS_LENGTH")

	query = query.Select(fields)

	// WHERE
	if opts.Where != "" {
		query = query.Where(opts.Where, opts.Args...)
	}

	// ORDER
	if opts.Order != "" {
		query = query.Order(opts.Order)
	}

	// LIMIT
	if opts.Limit > 0 {
		query = query.Limit(opts.Limit)
	}

	// Execute
	if err := query.Find(&notes).Error; err != nil {
		return nil, err
	}

	return notes, nil
}

// GetNote - get single note by ID
func GetNote(id int) (models.NoteDB, error) {
	notes, err := GetNotes(NoteQueryOptions{
		Where: "ID = ?",
		Args:  []any{id},
		Limit: 1,
	})
	if err != nil {
		return models.NoteDB{}, err
	}

	if len(notes) == 0 {
		return models.NoteDB{}, errors.New("note not found")
	}

	return notes[0], nil
}

// GetNotesList - get whole list of notes
func GetNotesList() ([]models.NoteDB, error) {
	return GetNotes(NoteQueryOptions{
		Order:        "LEFT ASC",
		OmitContents: true,
	})

}

// GetNotesTree - get whole tree with notes
func GetNotesTree() ([]models.Note, error) {
	noteDBList, err := GetNotes(NoteQueryOptions{
		Order:        "LEFT ASC",
		OmitContents: true,
	})
	if err != nil {
		return nil, err
	}

	//  Convert []NoteDB to []Note
	notes := make([]models.Note, len(noteDBList))
	for i, dbNote := range noteDBList {
		notes[i] = models.Note{
			NoteDB:   dbNote,
			Children: []*models.Note{},
		}
	}

	// Transform list to tree
	tree := buildNoteTree(notes)

	return tree, nil
}

// buildTree - convert Note list to Note tree
func buildNoteTree(list []models.Note) []models.Note {
	// Map to store pointers to notes
	noteMap := make(map[int64]*models.Note)
	for i := range list {
		// Initialize empty slice for children
		list[i].Children = []*models.Note{}
		// Store pointer to each note in the map
		noteMap[list[i].ID] = &list[i]
	}

	// Root notes list
	var roots []*models.Note

	// Build the tree
	for i := range list {
		note := &list[i]
		if note.ParentID == 0 {
			// If it's a root note, add it to roots
			roots = append(roots, note)
		} else {
			// If the note has a parent, add it to the parent's Children
			if parent, ok := noteMap[note.ParentID]; ok {
				parent.Children = append(parent.Children, note)
			}
		}
	}

	// Convert pointers to copies for the returned slice
	result := make([]models.Note, len(roots))
	for i, ptr := range roots {
		// Convert pointer to value for the result tree
		result[i] = *ptr
	}
	return result
}

// UpdateNoteContents - update contens for single note
func UpdateNoteContents(id int64, newContents string) error {
	db := database.GetORM()

	// Search note by ID
	var note models.NoteDB
	if err := db.First(&note, id).Error; err != nil {
		return errors.New("note not found")
	}

	// Prepare note struct for save
	note.Contents = newContents
	note.DateModified = time.Now().Unix()

	// Save note
	if err := db.Omit("ContentsLength").Save(&note).Error; err != nil {
		return err
	}

	return nil
}

// RebuildNotesTree - rebuild the nested set values: LEFT, RIGHT, DEPTH
func RebuildNotesTree() error {
	db := database.GetORM()

	// Start transaction
	return db.Transaction(func(tx *gorm.DB) error {
		// Load necessary fields: ID, ParentID, Title (for sorting)
		var notes []models.NoteDB
		if err := tx.Model(&models.NoteDB{}).
			Select("ID", "PARENT_ID", "TITLE").
			Order("PARENT_ID, TITLE").
			Find(&notes).Error; err != nil {
			return fmt.Errorf("failed to load notes: %w", err)
		}

		// Prepare a map for parent-child relationships
		children := make(map[int64][]*models.NoteDB)
		noteByID := make(map[int64]*models.NoteDB)

		// Build the map of children for each parent
		for i := range notes {
			n := &notes[i]
			noteByID[n.ID] = n
			children[n.ParentID] = append(children[n.ParentID], n)
		}

		// Recursive walk function to calculate LEFT, RIGHT, DEPTH
		var counter int64 = 1
		var walk func(n *models.NoteDB, depth int64)
		walk = func(n *models.NoteDB, depth int64) {
			n.Left = counter
			n.Depth = depth
			counter++

			// Recursively walk through children
			for _, child := range children[n.ID] {
				walk(child, depth+1)
			}

			n.Right = counter
			counter++
		}

		// Walk from the root notes (parent ID == 0)
		for _, root := range children[0] {
			walk(root, 0)
		}

		// Update each note individually
		for _, n := range noteByID {
			if err := tx.Model(&models.NoteDB{}).
				Where("ID = ?", n.ID).
				Updates(map[string]any{
					"LEFT":  n.Left,
					"RIGHT": n.Right,
					"DEPTH": n.Depth,
				}).Error; err != nil {
				return fmt.Errorf("failed to update note %d: %w", n.ID, err)
			}
		}

		return nil
	})
}

// SetExpandCollapse - set expand/collapse for notes
func SetExpandCollapse(collapse []int, expand []int) {
	db := database.GetORM()

	if len(expand) == 1 && expand[0] == 0 {
		// If expand is [0], set expanded = 1 for all records
		db.Exec("UPDATE notes SET EXPANDED = 1")
	} else if len(expand) > 0 {
		// Set expanded = 1 for the specified notes
		db.Model(&models.NoteDB{}).Where("ID IN ?", expand).Update("EXPANDED", 1)
	}

	if len(collapse) == 1 && collapse[0] == 0 {
		// If collapse is [0], set expanded = 0 for all records
		db.Exec("UPDATE notes SET EXPANDED = 0")
	} else if len(collapse) > 0 {
		// Set expanded = 0 for the specified notes
		db.Model(&models.NoteDB{}).Where("ID IN ?", collapse).Update("EXPANDED", 0)
	}
}
