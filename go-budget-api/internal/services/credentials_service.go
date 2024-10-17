package services

import (
	"budget-api/internal/db"
	"budget-api/internal/entities"
	"crypto/sha256"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

func hashPassword(password string) string {
	hash := sha256.New()

	hash.Write([]byte(password))

	passwordHash := hash.Sum(nil)

	return fmt.Sprintf("%x", passwordHash)
}

func GetCredentialId(username string, password string) (*string, error) {
	passwordHash := hashPassword(password)

	var id string
	result := db.Context.
		Model(&entities.Credential{}).
		Where(&entities.Credential{Username: username, PasswordHash: passwordHash}).
		Select("id").
		First(&id)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &id, nil
}

func CreateCredential(username string, password string) error {
	passwordHash := hashPassword(password)

	credential := entities.Credential{Username: username, PasswordHash: passwordHash}

	result := db.Context.Create(&credential)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return ErrUnique
		}
		return result.Error
	}

	return nil
}

func DeleteCredential(credentialId string) error {
	result := db.Context.Where(&entities.Credential{Id: credentialId}).Delete(&entities.Credential{})

	if result.Error != nil {
		return result.Error
	}

	return nil
}
