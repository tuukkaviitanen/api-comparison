package routers

import (
	"budget-api/internal/middlewares"
	"budget-api/internal/models"
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

		var reportRequest models.ReportRequest

		if err := context.ShouldBindQuery(&reportRequest); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		report, err := services.GetReport(
			credentialId,
			reportRequest.Category,
			reportRequest.From,
			reportRequest.To)
		if err != nil {
			log.Printf("[GET Reports] Unexpected error: %s\n", err.Error())
			_ = context.AbortWithError(500, err)
			return
		}

		context.JSON(200, report)
	}
}
