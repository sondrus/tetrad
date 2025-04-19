package static

import "embed"

//go:embed files/**
var staticFilesFS embed.FS

// GetStaticFilesFS - get embedded static files
func GetStaticFilesFS() embed.FS {
	return staticFilesFS
}
