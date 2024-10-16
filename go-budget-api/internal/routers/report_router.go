package routers

import "github.com/gin-gonic/gin"

func MapReportRouter(router *gin.Engine) {
	reports := router.Group("/reports")
	{
		reports.GET("/", func(context *gin.Context) {
			context.Status(200)
		})
	}
}
