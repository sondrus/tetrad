package note

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/models"
	"github.com/sondrus/tetrad/services"
	"gorm.io/gorm"
)

// GetNoteHandler - GET - get single note by ID
func GetNoteHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Get note from database
	ID := r.Context().Value(database.IDKey).(int)
	note, err := services.GetNote(ID)
	if err != nil {
		services.RespondWithError(w, http.StatusNotFound, "Note is not found", nil)
		return
	}

	// Create response
	response := map[string]any{
		"success": true,
		"note":    note,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// PostNoteHandler - POST - create new note
func PostNoteHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Decode request json into map
	var fields map[string]any
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		services.RespondWithError(w, http.StatusBadRequest, "Invalid JSON", nil)
		return
	}

	// Changes keys from JSON to GORM
	fields = services.NormalizeNoteKeys(fields)

	// If exists 'ID', delete it
	delete(fields, "ID")

	// Set dates
	now := time.Now().Unix()
	fields["DATE_CREATED"] = now
	fields["DATE_MODIFIED"] = now

	// Set empty contents if not set
	if _, exists := fields["CONTENTS"]; !exists {
		fields["CONTENTS"] = ""
	}

	// Insert new note to DB
	db := database.GetORM()
	result := db.Model(&models.NoteDB{}).Create(fields)
	if result.Error != nil {
		errorMessage := fmt.Sprintf("Error creating note: %v", result.Error)
		services.RespondWithError(w, http.StatusInternalServerError, errorMessage, nil)
		return
	}

	// Nested set rebuild
	services.RebuildNotesTree()

	// Create response
	response := map[string]any{
		"success": true,
		"date":    now,
		"id":      fields["ID"],
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// PatchNoteHandler - PATCH - update some fields for note
func PatchNoteHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Decode request json into map
	var fields map[string]any
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		services.RespondWithError(w, http.StatusBadRequest, "Invalid JSON", nil)
		return
	}

	// Changes keys from JSON to GORM
	fields = services.NormalizeNoteKeys(fields)

	// Get note from database
	ID := r.Context().Value(database.IDKey).(int)
	_, err := services.GetNote(ID)
	if err != nil {
		services.RespondWithError(w, http.StatusNotFound, "Note is not found", nil)
		return
	}

	// If exists 'ID', delete it
	delete(fields, "ID")

	// Set dates
	now := time.Now().Unix()
	fields["DATE_MODIFIED"] = now

	// Update fields
	db := database.GetORM()
	err = db.Model(&models.NoteDB{}).Where("ID = ?", ID).Updates(fields).Error
	if err != nil {
		errorMessage := fmt.Sprintf("Error updating note: %v", err)
		services.RespondWithError(w, http.StatusInternalServerError, errorMessage, nil)
		return
	}

	// Nested set rebuild (just if has PARENT_ID or TITLE)
	_, hasParent := fields["PARENT_ID"]
	_, hasTitle := fields["TITLE"]
	if hasParent || hasTitle {
		services.RebuildNotesTree()
	}

	// Create response
	response := map[string]any{
		"success": true,
		"date":    now,
		"id":      ID,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DeleteNoteHandler - DELETE - delete single note with its children
func DeleteNoteHandler(w http.ResponseWriter, r *http.Request) {
	services.SetCommonResponseHeaders(w)

	// Get note from database
	ID := r.Context().Value(database.IDKey).(int)
	note, err := services.GetNote(ID)
	if err != nil {
		services.RespondWithError(w, http.StatusNotFound, "Note is not found", nil)
		return
	}

	// Delete child notes in transaction
	db := database.GetORM()
	err = db.Transaction(func(tx *gorm.DB) error {
		// Fetch LEFT, RIGHT, and DEPTH values from the note object
		left := note.Left
		right := note.Right
		depth := note.Depth

		// Delete all child notes based on LEFT, RIGHT, and DEPTH
		if err := tx.Where("LEFT > ? AND RIGHT < ? AND DEPTH > ?", left, right, depth).
			Delete(&models.NoteDB{}).Error; err != nil {
			return fmt.Errorf("failed to delete child notes for note ID %d: %w", ID, err)
		}

		// Delete the note itself
		if err := tx.Delete(&models.NoteDB{}, ID).Error; err != nil {
			return fmt.Errorf("failed to delete note with ID %d: %w", ID, err)
		}

		return nil
	})

	if err != nil {
		services.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete note: %v", err), nil)
		return
	}

	// Nested set rebuild
	services.RebuildNotesTree()

	// Create response
	response := map[string]any{
		"success": true,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
