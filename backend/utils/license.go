package utils

import (
	"fmt"

	"github.com/sondrus/tetrad/static"
)

// GetLicenseText - get license text (license.txt + third-party.txt)
func GetLicenseText() (string, error) {
	// Read embedded license.txt
	license, err := static.GetStaticFilesFS().ReadFile("files/about/license.txt")
	if err != nil {
		return "", err
	}

	// Read embedded third-party.txt
	thirdparty, err := static.GetStaticFilesFS().ReadFile("files/about/third-party.txt")
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s\n\n---\n\n%s", string(license), string(thirdparty)), nil
}
