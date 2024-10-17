package routers

import (
	"budget-api/internal/middlewares"
	"budget-api/internal/models"
	"budget-api/internal/services"

	"github.com/gin-gonic/gin"
)

func mapTransactionRouter(router *gin.Engine) {
	transactions := router.Group("/transactions")
	{
		transactions.Use(middlewares.Authenticate())

		transactions.GET("/", getTransaction())

		transactions.GET("/:transactionId", func(context *gin.Context) {
			context.Status(200)
		})

		transactions.POST("/", postTransaction())

		transactions.PUT("/:transactionId", func(context *gin.Context) {
			context.Status(200)
		})

		transactions.DELETE("/:transactionId", func(context *gin.Context) {
			context.Status(204)
		})
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
			context.AbortWithError(500, err)
			return
		}

		context.JSON(201, processedTransaction)
	}
}

func getTransaction() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")

		transactions, err := services.GetTransactions(credentialId)

		if err != nil {
			context.AbortWithError(500, err)
			return
		}

		context.JSON(200, transactions)
	}
}
