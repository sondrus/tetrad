package models

// Option - struct
type Option struct {
	Name  string `gorm:"column:NAME; primaryKey; not null"`
	Value string `gorm:"column:VALUE; not null"`
	Type  string `gorm:"column:TYPE; not null"`
}

// TableName - set custom table name for GORM
func (Option) TableName() string {
	return "options"
}
