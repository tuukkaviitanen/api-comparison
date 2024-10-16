package db

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Context *gorm.DB

func ConnectToDatabase(connectionString string) error {
	database, err := gorm.Open(postgres.Open(connectionString), &gorm.Config{})

	Context = database

	return err
}
