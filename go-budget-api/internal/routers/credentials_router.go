package routers

import (
	"budget-api/internal/middlewares"

	"github.com/gin-gonic/gin"
)

func mapCredentialsRouter(router *gin.Engine) {
	credentials := router.Group("/credentials")
	{
		credentials.POST("/", func(context *gin.Context) {
			context.Status(204)
		})

		credentials.Use(middlewares.Authenticate())

		credentials.DELETE("/", func(context *gin.Context) {
			context.Status(204)
		})
	}
}
