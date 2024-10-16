package routers

import "github.com/gin-gonic/gin"

func mapReportRouter(router *gin.Engine) {
	reports := router.Group("/reports")
	{
		reports.GET("/", func(context *gin.Context) {
			context.Status(200)
		})
	}
}
