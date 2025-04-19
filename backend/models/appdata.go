package models

// AppData - struct for `About`
type AppData struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Developer   string `json:"developer"`
	LicenseType string `json:"licenseType"`
	Site        string `json:"site"`
	Notes       string `json:"notes"`
	Copyrights  string `json:"copyrights"`
	LicenseText string `json:"licenseText"`
}
