package services

import (
	"budget-api/internal/db"
	"budget-api/internal/entities"
	"crypto/sha256"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func hashPassword(password string) string {
	hash := sha256.New()

	hash.Write([]byte(password))

	passwordHash := hash.Sum(nil)

	return fmt.Sprintf("%x", passwordHash)
}

func GetCredentialId(username string, password string) (*uuid.UUID, error) {
	passwordHash := hashPassword(password)

	var id uuid.UUID
	result := db.Context.
		Model(&entities.Credential{}).
		Where(&entities.Credential{Username: username, PasswordHash: passwordHash}).
		Select("id").
		First(id)

	if result.Error != nil {
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
	result := db.Context.Delete(&entities.Credential{}, credentialId)

	if result.Error != nil {
		return result.Error
	}

	return nil
}
