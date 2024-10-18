package services

import (
	"budget-api/internal/db"
	"budget-api/internal/entities"
	"budget-api/internal/models"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

func mapProcessedTransaction(transaction *entities.Transaction) *models.ProcessedTransaction {
	return &models.ProcessedTransaction{
		Id:          transaction.Id,
		Category:    transaction.Category,
		Description: transaction.Description,
		Value:       transaction.Value,
		Timestamp:   transaction.Timestamp,
	}
}

func CreateTransaction(category string, description string, value float64, timestamp time.Time, credentialId string) (*models.ProcessedTransaction, error) {
	transaction := entities.Transaction{
		Category:     category,
		Description:  description,
		Value:        value,
		Timestamp:    timestamp.UTC(),
		CredentialId: credentialId,
	}

	if err := db.Context.Create(&transaction).Error; err != nil {
		return nil, err
	}

	return mapProcessedTransaction(&transaction), nil
}

func GetTransactions(credentialId string, category *string, from *time.Time, to *time.Time, sort string, order string, skip int, limit int) ([]*models.ProcessedTransaction, error) {
	var transactions []*models.ProcessedTransaction

	query := db.Context.
		Model(&entities.Transaction{}).
		Where(&entities.Transaction{CredentialId: credentialId})

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	if from != nil {
		query = query.Where("timestamp >= ?", from.UTC())
	}

	if to != nil {
		query = query.Where("timestamp <= ?", to.UTC())
	}

	if err := query.
		Order(fmt.Sprintf("%s %s", sort, order)).
		Offset(skip).
		Limit(limit).
		Find(&transactions).
		Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

func GetTransaction(transactionId string, credentialId string) (*models.ProcessedTransaction, error) {
	var transaction models.ProcessedTransaction
	if err := db.Context.
		Model(&entities.Transaction{}).
		Where(&entities.Transaction{Id: transactionId, CredentialId: credentialId}).
		First(&transaction).
		Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &transaction, nil
}

func UpdateTransaction(transactionId string, credentialId string, category string, description string, value float64, timestamp time.Time) (*models.ProcessedTransaction, error) {
	var transaction entities.Transaction

	if err := db.Context.
		Where(&entities.Transaction{Id: transactionId, CredentialId: credentialId}).
		First(&transaction).
		Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	transaction.Category = category
	transaction.Description = description
	transaction.Value = value
	transaction.Timestamp = timestamp.UTC()

	if err := db.Context.Save(&transaction).Error; err != nil {
		return nil, err
	}

	return mapProcessedTransaction(&transaction), nil
}

func DeleteTransaction(transactionid string, credentialId string) error {
	result := db.Context.
		Delete(&entities.Transaction{Id: transactionid, CredentialId: credentialId})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}
