package database

import (
	"log"
	"os"
	"path/filepath"

	"github.com/sondrus/tetrad/static"
	"gorm.io/gorm"
)

// extractDatabase - extract database from embedded files
func extractDatabase(filename string) {
	_, err := os.Stat(filename)
	if !os.IsNotExist(err) {
		return
	}

	// Create database directory if it doesn't exist
	dir := filepath.Dir(filename)
	err = os.MkdirAll(dir, 0700)
	if err != nil {
		log.Fatal(err)
		return
	}

	// Extract db to memory
	dbContents, err := static.GetStaticFilesFS().ReadFile("files/demodb/demo.db")
	if err != nil {
		log.Fatal(err)
		return
	}

	// Write to file
	err = os.WriteFile(filename, dbContents, 0o755)
	if err != nil {
		log.Fatal(err)
		return
	}

	return
}

// initDatabase - auto create tables
func initDatabase(db *gorm.DB) {
	tables := map[string][]string{
		"icons": {
			`CREATE TABLE IF NOT EXISTS "icons" (
				"ID"			INTEGER NOT NULL,
				"ICON"			BLOB NOT NULL,
				"SORT"			INTEGER NOT NULL DEFAULT 0,
				"DATE_CREATED"	INTEGER NOT NULL,
				"DATE_MODIFIED"	INTEGER NOT NULL,
				PRIMARY KEY("ID" AUTOINCREMENT)
			)`,
		},
		"notes": {
			`CREATE TABLE IF NOT EXISTS "notes" (
				"ID"			INTEGER NOT NULL,
				"PARENT_ID"		INTEGER NOT NULL,
				"DEPTH"			INTEGER NOT NULL DEFAULT 0,
				"LEFT"			INTEGER NOT NULL DEFAULT 0,
				"RIGHT"			INTEGER NOT NULL DEFAULT 0,
				"EXPANDED"		INTEGER NOT NULL DEFAULT 0,
				"READONLY"		INTEGER NOT NULL DEFAULT 0,
				"ICON"			INTEGER NOT NULL DEFAULT 0,
				"TYPE"			TEXT NOT NULL,
				"TITLE"			TEXT NOT NULL,
				"CONTENTS"		TEXT NOT NULL,
				"URL"			TEXT,
				"SYNTAX"		TEXT,
				"FAVORITE"		INTEGER NOT NULL DEFAULT 0,
				"DATE_CREATED"	INTEGER NOT NULL,
				"DATE_MODIFIED"	INTEGER NOT NULL,
				PRIMARY KEY("ID" AUTOINCREMENT)
			);`,
			`INSERT INTO notes VALUES(1,0,0,1,4,1,0,0,'MD','Note 1','Contents 1',
				NULL, NULL,0,1744617711,1744617711);`,
			`INSERT INTO notes VALUES(2,0,0,5,6,1,0,0,'MD','Note2 2','Contents 2',
				NULL, NULL,0,1744617716,1744617716);`,
			`INSERT INTO notes VALUES(3,1,1,2,3,1,0,0,'URL','Markdown crash course','',
				'https://www.youtube.com/embed/8owG83ozHYw',NULL,0,1744617724,1744617724);`,
		},
		"options": {
			`CREATE TABLE IF NOT EXISTS "options" (
				"NAME"	TEXT NOT NULL UNIQUE,
				"VALUE"	TEXT NOT NULL,
				"TYPE"	TEXT NOT NULL,
				PRIMARY KEY("NAME")
			)`,
		},
	}

	// Execute all queries
	for table, sql := range tables {
		if db.Migrator().HasTable(table) {
			continue
		}

		for _, query := range sql {
			if err := db.Exec(query).Error; err != nil {
				log.Fatalf("Error quering SQL: %v\nSQL: %s", err, query)
			}
		}
	}
}
