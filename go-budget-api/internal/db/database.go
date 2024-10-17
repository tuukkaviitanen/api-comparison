package db

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Context *gorm.DB

func ConnectToDatabase(connectionString string) error {
	database, gormErr := gorm.Open(postgres.Open(connectionString), &gorm.Config{TranslateError: true})

	if gormErr != nil {
		return gormErr
	}

	// Access the raw *sql.DB object
	sqlDB, sqlErr := database.DB()
	if sqlErr != nil {
		return sqlErr
	}

	// Configure connection pooling
	sqlDB.SetMaxOpenConns(100)  // Maximum number of open connections
	sqlDB.SetMaxIdleConns(10)   // Maximum number of idle connections
	sqlDB.SetConnMaxLifetime(0) // Maximum amount of time a connection can be reused (0 means no limit)

	Context = database

	return nil
}
