package routers

import (
	"budget-api/internal/middlewares"

	"github.com/gin-gonic/gin"
)

func mapReportRouter(router *gin.Engine) {
	reports := router.Group("/reports")
	{
		reports.Use(middlewares.Authenticate())

		reports.GET("/", func(context *gin.Context) {
			context.Status(200)
		})
	}
}
