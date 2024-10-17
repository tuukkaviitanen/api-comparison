package routers

import (
	"budget-api/internal/middlewares"
	"budget-api/internal/services"
	"log"

	"github.com/gin-gonic/gin"
)

func mapReportRouter(router *gin.Engine) {
	reports := router.Group("/reports")
	{
		reports.Use(middlewares.Authenticate())

		reports.GET("/", getReport())
	}
}

func getReport() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")

		report, err := services.GetReport(credentialId, nil, nil, nil)

		if err != nil {
			log.Printf("[GET Reports] Unexpected error: %s\n", err.Error())
			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(200, report)
	}
}
