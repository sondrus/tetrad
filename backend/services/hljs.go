package services

import (
	"sort"
	"strings"

	"github.com/sondrus/tetrad/static"
	"github.com/sondrus/tetrad/utils"
)

// GetHljsThemes - get list of available hljs themes (from embedded FS)
func GetHljsThemes() []string {
	themes := []string{}

	prefix := "files/highlightjs"
	suffix := ".min.css"

	// Get list of files in `files/highlightjs`
	files, _ := utils.ListEmbeddedFiles(static.GetStaticFilesFS(), prefix)

	for file := range files {
		if !strings.HasPrefix(file, prefix) {
			continue
		}
		if !strings.HasSuffix(file, suffix) {
			continue
		}

		// Convert files/highlightjs/mytheme.min.css to mytheme
		theme := strings.TrimSuffix(strings.TrimPrefix(file, prefix+"/"), suffix)

		themes = append(themes, theme)
	}

	sort.Strings(themes)

	return themes
}
