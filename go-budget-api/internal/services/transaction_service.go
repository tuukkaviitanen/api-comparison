package services

import (
	"budget-api/internal/db"
	"budget-api/internal/entities"
	"budget-api/internal/models"
	"time"
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

func CreateTransaction(category string, description string, value float32, timestamp time.Time, credentialId string) (*models.ProcessedTransaction, error) {
	transaction := entities.Transaction{
		Category:     category,
		Description:  description,
		Value:        value,
		Timestamp:    timestamp,
		CredentialId: credentialId,
	}

	if err := db.Context.Create(&transaction).Error; err != nil {
		return nil, err
	}

	return mapProcessedTransaction(&transaction), nil
}

func GetTransactions(credentialId string) ([]*models.ProcessedTransaction, error) {
	var transactions = []*models.ProcessedTransaction{}
	if err := db.Context.
		Model(&entities.Transaction{}).
		Where(&entities.Transaction{CredentialId: credentialId}).
		Find(&transactions).
		Error; err != nil {
		return nil, err
	}

	return transactions, nil
}
