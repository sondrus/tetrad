package meta

import "fmt"

// Name - application name
var Name = "Tetrad"

// Version - Application version
var Version = "1.0.0"

// Server - value for `server` header in response
var Server = fmt.Sprintf("%s/%s", Name, Version)

// Developer - developer name
var Developer = "Denis Son"

// License - license type
var License = "MIT"

// Site - URL to site
var Site = "https://github.com/sondrus/tetrad"

// Notes - short app description
var Notes = "A simple markdown note-taking application running as an HTTP server, built with Go and Vue."

// Copyrights notice
var Copyrights = fmt.Sprintf("(c) 2025 %s", Developer)
