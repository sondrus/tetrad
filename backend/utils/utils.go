package utils

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
)

// JSONDebug - Debug print with JSON format
func JSONDebug(data any) {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
	}
	fmt.Println(string(jsonData))
}

// ListEmbeddedFiles - Get all files from embedded FS
func ListEmbeddedFiles(embeddedFS embed.FS, startPath string) (map[string]int64, error) {
	files := make(map[string]int64)

	err := fs.WalkDir(embeddedFS, startPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			data, err := embeddedFS.ReadFile(path)
			if err != nil {
				return err
			}

			files[path] = int64(len(data))
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return files, nil
}
