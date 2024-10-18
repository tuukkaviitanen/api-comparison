package routers

import (
	"budget-api/internal/middlewares"
	"budget-api/internal/models"
	"budget-api/internal/services"
	"errors"

	"github.com/gin-gonic/gin"
)

func mapTransactionRouter(router *gin.Engine) {
	transactions := router.Group("/transactions")
	{
		transactions.Use(middlewares.Authenticate())

		transactions.GET("/", getTransactions())

		transactions.GET("/:transactionId", getTransaction())

		transactions.POST("/", postTransaction())

		transactions.PUT("/:transactionId", putTransaction())

		transactions.DELETE("/:transactionId", deleteTransaction())
	}
}

func postTransaction() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")
		var transaction models.TransactionRequest

		if err := context.ShouldBindBodyWithJSON(&transaction); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		processedTransaction, err := services.CreateTransaction(
			transaction.Category,
			transaction.Description,
			transaction.Value,
			transaction.Timestamp,
			credentialId)
		if err != nil {
			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(201, processedTransaction)
	}
}

func getTransactions() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")

		var body models.GetTransactionQuery

		if err := context.ShouldBindQuery(&body); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		transactions, err := services.GetTransactions(
			credentialId,
			body.Category,
			body.From,
			body.To,
			body.Sort,
			body.Order,
			body.Skip,
			body.Limit)
		if err != nil {
			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(200, transactions)
	}
}

func getTransaction() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")

		var uri models.TransactionUri

		if err := context.ShouldBindUri(&uri); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		transactions, err := services.GetTransaction(uri.TransactionId, credentialId)
		if err != nil {
			if errors.Is(err, services.ErrNotFound) {
				context.JSON(404, gin.H{"error": "Transaction not found"})
				return
			}

			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(200, transactions)
	}
}

func putTransaction() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")
		var transaction models.TransactionRequest
		var uri models.TransactionUri

		if err := context.ShouldBindUri(&uri); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if err := context.ShouldBindBodyWithJSON(&transaction); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		processedTransaction, err := services.UpdateTransaction(uri.TransactionId, credentialId, transaction.Category, transaction.Description, transaction.Value, transaction.Timestamp)
		if err != nil {
			if errors.Is(err, services.ErrNotFound) {
				context.JSON(404, gin.H{"error": "Transaction not found"})
				return
			}

			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(200, processedTransaction)
	}
}

func deleteTransaction() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")
		var uri models.TransactionUri

		if err := context.ShouldBindUri(&uri); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if err := services.DeleteTransaction(uri.TransactionId, credentialId); err != nil {
			if errors.Is(err, services.ErrNotFound) {
				context.JSON(404, gin.H{"error": "Transaction not found"})
				return
			}

			_ = context.AbortWithError(500, err)
			return
		}

		context.Status(204)
	}
}
