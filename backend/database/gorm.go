package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/sondrus/tetrad/static"
	"github.com/sondrus/tetrad/utils"

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
	driver := initSqleanDriver()
	connection := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)", databasePath)

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

	// Auto create database (not auto-migrate)
	initDatabase(database)

	return nil
}

// initSqleanDriver - create new sqlite driver with unicode support for correct `LIKE` in SQL
func initSqleanDriver() string {
	sqliteDef := "sqlite3"

	// Prepare sqlean extension
	libfile, libext, err := getLibFilename()
	if err != nil {
		log.Fatal(err)
		return sqliteDef
	}
	libpath := fmt.Sprintf("files/sqlean/%s.%s", libfile, libext)

	// Read binary data from embedded FS
	files, err := utils.ListEmbeddedFiles(static.GetStaticFilesFS(), "files/sqlean")
	if err != nil {
		log.Fatal(err)
		return sqliteDef
	}

	// Check file exist in embedded files
	if _, ok := files[libpath]; !ok {
		log.Fatalf("fatal: library %s not found in embedded files", libpath)
		return sqliteDef
	}

	// Get library file contents
	libContents, err := static.GetStaticFilesFS().ReadFile(libpath)
	if err != nil {
		log.Fatal(err)
		return sqliteDef
	}

	// Get library file path
	libfileTmp := filepath.Join(os.TempDir(), fmt.Sprintf("tetrad-sqlean-ext/unicode.%s", libext))

	// Create non-existent folders
	err = os.MkdirAll(filepath.Dir(libfileTmp), os.ModePerm)
	if err != nil {
		log.Fatal(err)
		return sqliteDef
	}

	// Save library to file
	err = os.WriteFile(libfileTmp, libContents, 0o755)
	if err != nil {
		log.Fatal(err)
		return sqliteDef
	}

	// Register sqlite3 driver with sqlean unicode extension
	driver := "sqlite3_unicode"
	sql.Register(driver, &sqlite3.SQLiteDriver{
		Extensions: []string{libfileTmp},
	})

	return driver
}

// getLibFilename - get unicode extension filename (relative to OS and ARCH)
func getLibFilename() (string, string, error) {
	prefix := "unicode"

	switch runtime.GOOS {
	case "linux":
		switch runtime.GOARCH {
		case "amd64":
			return fmt.Sprintf("%s-linux-386", prefix), "so", nil
		case "386":
			return fmt.Sprintf("%s-linux-386", prefix), "so", nil
		case "arm64":
			return fmt.Sprintf("%s-linux-arm64", prefix), "so", nil
		}
	case "android":
		switch runtime.GOARCH {
		case "arm64":
			return fmt.Sprintf("%s-android-arm64", prefix), "so", nil
		}
	case "darwin":
		switch runtime.GOARCH {
		case "amd64":
			return fmt.Sprintf("%s-macos-386", prefix), "dylib", nil
		case "386":
			return fmt.Sprintf("%s-macos-386", prefix), "dylib", nil
		case "arm64":
			return fmt.Sprintf("%s-macos-arm64", prefix), "dylib", nil
		}
	case "windows":
		switch runtime.GOARCH {
		case "amd64":
			return fmt.Sprintf("%s-win-amd64", prefix), "dll", nil
		case "386":
			return fmt.Sprintf("%s-win-386", prefix), "dll", nil
		case "arm64":
			return fmt.Sprintf("%s-win-arm64", prefix), "dll", nil
		}
	}
	return "", "", fmt.Errorf("unsupported OS/ARCH for sqlean unicode library: %s/%s", runtime.GOOS, runtime.GOARCH)
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
