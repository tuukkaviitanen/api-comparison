package routers

import (
	"budget-api/internal/middlewares"

	"github.com/gin-gonic/gin"
)

func mapTransactionRouter(router *gin.Engine) {
	transactions := router.Group("/transactions")
	{
		transactions.Use(middlewares.Authenticate())

		transactions.GET("/", func(context *gin.Context) {
			context.Status(200)
		})

		transactions.GET("/:transactionId", func(context *gin.Context) {
			context.Status(200)
		})

		transactions.POST("/", func(context *gin.Context) {
			context.Status(201)
		})

		transactions.PUT("/:transactionId", func(context *gin.Context) {
			context.Status(200)
		})

		transactions.DELETE("/:transactionId", func(context *gin.Context) {
			context.Status(204)
		})
	}
}
