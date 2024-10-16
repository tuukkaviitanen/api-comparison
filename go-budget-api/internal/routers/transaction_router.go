package routers

import "github.com/gin-gonic/gin"

func MapTransactionRouter(router *gin.Engine) {
	transactions := router.Group("/transactions")
	{
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
