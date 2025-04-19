package models

// HTTPResponseError - struct for any HTTP error
type HTTPResponseError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
