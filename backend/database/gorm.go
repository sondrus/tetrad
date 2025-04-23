package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"time"

	"github.com/mattn/go-sqlite3"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var database *gorm.DB

var databasePath string = ""

// GetORM - get ref to GORM
func GetORM() *gorm.DB {
	return database
}

// GetFilepath - get database filepath
func GetFilepath() string {
	return databasePath
}

// GetFilesize - get database filesize
func GetFilesize() int64 {
	info, err := os.Stat(databasePath)
	if err != nil {
		return 0
	}

	return info.Size()
}

// LoadDatabase - load database from file
func LoadDatabase(path string) error {
	filenameAbs, err := filepath.Abs(path)
	if err != nil {
		log.Fatal(err)
	}
	databasePath = filenameAbs

	// If database file doesn't exist, extract from embedded static files
	extractDatabase(databasePath)

	// Prepare sqlite connection, including unicode extension
	connection := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)", databasePath)

	driver := "sqlite3_custom"
	sql.Register(driver, &sqlite3.SQLiteDriver{
		ConnectHook: func(conn *sqlite3.SQLiteConn) error {
			return conn.RegisterFunc("custom_like", sqliteCustomLike, true)
		},
	})

	// Connect to database
	sqliteDb, err := sql.Open(driver, connection)
	if err != nil {
		fmt.Println("Error opening database:", err)
		return err
	}

	// GORM config
	config := &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold: time.Second,
				LogLevel:      logger.Warn,
			},
		),
	}

	// Open database
	database, err = gorm.Open(sqlite.Dialector{
		Conn: sqliteDb,
	}, config)
	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return err
	}

	// Auto create database with tables (not auto-migrate)
	initDatabase(database)

	return nil
}

// Vacuum - compress sqlite database
func Vacuum() (bool, error) {
	err := database.Exec("VACUUM").Error
	if err != nil {
		log.Fatal("Error compressing (vacuum) database:", err)
		return false, err
	}

	return true, nil
}

// GetFields - get all fields (columns) for table (using gorm annotations)
func GetFields(model any, exclude []string) []string {
	var fields []string
	val := reflect.ValueOf(model).Elem()
	typ := val.Type()

	// Set for excluded fields
	excludeSet := make(map[string]struct{})
	for _, field := range exclude {
		excludeSet[field] = struct{}{}
	}

	for i := range val.NumField() {
		field := typ.Field(i)
		column := field.Tag.Get("gorm")
		if column == "" {
			continue
		}

		// Get column name (remove "column:" prefix if it exists)
		columnName := strings.Split(column, ";")[0]
		columnName = strings.TrimPrefix(columnName, "column:")

		// Check if we need to exclude this field
		if _, excluded := excludeSet[columnName]; excluded {
			continue
		}

		fields = append(fields, columnName)
	}
	return fields
}

// Custom function similar to LIKE (because UTF-8 LIKE is not working in sqlite)
func sqliteCustomLike(contents, pattern string) bool {
	return strings.Contains(strings.ToLower(contents), strings.ToLower(pattern))
}
