package services

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"github.com/sondrus/tetrad/database"
	"github.com/sondrus/tetrad/models"
)

// LoadSettings - load frontend settings from database
func LoadSettings() (map[string]any, error) {
	var options []models.Option
	if err := database.GetORM().Find(&options).Error; err != nil {
		return nil, err
	}

	// Transform flat data into hierarchical structure
	settings := make(map[string]any)
	for _, option := range options {
		keys := strings.Split(option.Name, ".")

		// Transform the value to the appropriate type
		value, err := convertToAppropriateType(option.Value, option.Type)
		if err != nil {
			return nil, fmt.Errorf("invalid value type for option %s: %v", option.Name, err)
		}

		setNestedValue(settings, keys, value)
	}

	return settings, nil
}

// convertToAppropriateType - transforms a string value to the appropriate type
func convertToAppropriateType(value string, typeName string) (any, error) {
	switch typeName {
	case "string":
		return value, nil
	case "int":
		return strconv.Atoi(value)
	case "bool":
		return strconv.ParseBool(value)
	case "float64":
		return strconv.ParseFloat(value, 64)
	default:
		return nil, fmt.Errorf("unsupported type %s", typeName)
	}
}

// setNestedValue - recursively assigns a value to a nested field in a map
// "sidebar.width" = 100 ==> ["sidebar" => ["width": 100]]
func setNestedValue(data map[string]any, keys []string, value any) {
	if len(keys) == 1 {
		data[keys[0]] = value
		return
	}

	// Search for a nested map, create if not found
	if _, exists := data[keys[0]]; !exists {
		data[keys[0]] = make(map[string]any)
	}

	// Recursively call for the nested map
	setNestedValue(data[keys[0]].(map[string]any), keys[1:], value)
}

// SaveSettings - save settings array to database
func SaveSettings(settings map[string]any) error {
	var flattenedOptions []models.Option

	// Convert settigns tree to list
	flattenSettings(settings, "", &flattenedOptions)

	for _, option := range flattenedOptions {

		var existingOption models.Option
		if err := database.GetORM().Where("NAME = ?", option.Name).First(&existingOption).Error; err != nil {
			// Create
			if err := database.GetORM().Create(&option).Error; err != nil {
				return fmt.Errorf("Error create option %s: %v", option.Name, err)
			}

		} else {
			// Update
			existingOption.Value = option.Value
			existingOption.Type = option.Type
			if err := database.GetORM().Save(&existingOption).Error; err != nil {
				return fmt.Errorf("Error update option %s: %v", option.Name, err)
			}

		}
	}

	return nil
}

// flattenSettings - transform options map to a flat list of options
func flattenSettings(data map[string]any, parent string, options *[]models.Option) {
	for key, value := range data {
		fullKey := key
		if parent != "" {
			fullKey = parent + "." + key
		}

		switch v := value.(type) {
		case map[string]any:
			// Recursive processing
			flattenSettings(v, fullKey, options)
		default:
			// Save the value as a string
			var valueStr string
			switch v := value.(type) {
			case string:
				valueStr = v
			case float64:
				valueStr = fmt.Sprintf("%v", v)
			case bool:
				valueStr = fmt.Sprintf("%v", v)
			default:
				valueStr = fmt.Sprintf("%v", v)
			}

			*options = append(*options, models.Option{
				Name:  fullKey,
				Value: valueStr,
				Type:  reflect.TypeOf(value).String(),
			})
		}
	}
}
