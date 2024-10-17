package services

import (
	"budget-api/internal/db"
	"budget-api/internal/entities"
	"budget-api/internal/models"
	"time"
)

func GetReport(credentialId string, category *string, from *time.Time, to *time.Time) (*models.BudgetReport, error) {
	query := db.Context.Model(&entities.Transaction{}).Where("credential_id = ?", credentialId)

	if category != nil {
		query = query.Where("category = ?", *category)
	}

	if from != nil {
		query = query.Where("timestamp >= ?", *from)
	}

	if to != nil {
		query = query.Where("timestamp <= ?", *to)
	}

	var transactionValues []float32
	if err := query.Select("value").Find(&transactionValues).Error; err != nil {
		return nil, err
	}

	return generateReport(&transactionValues), nil
}

func generateReport(values *[]float32) *models.BudgetReport {
	report := models.BudgetReport{}

	for _, value := range *values {
		isIncome := value > 0
		isExpense := value < 0

		report.TransactionsSum += value
		report.TransactionsCount++

		if isIncome {
			report.IncomesSum += value
			report.IncomesCount++
		}

		if isExpense {
			report.ExpensesSum += value
			report.ExpensesCount++
		}
	}

	return &report
}
