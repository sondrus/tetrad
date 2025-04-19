package services

import (
	"encoding/json"
	"net/http"

	"github.com/sondrus/tetrad/models"
)

// RespondWithError - helper function to send error response
func RespondWithError(w http.ResponseWriter, status int, message string, err error) {
	w.WriteHeader(status)

	// Create error response
	response := models.HTTPResponseError{
		Status:  status,
		Message: message,
	}
	if err != nil {
		response.Error = err.Error()
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
