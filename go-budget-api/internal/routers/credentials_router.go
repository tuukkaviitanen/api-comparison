package routers

import "github.com/gin-gonic/gin"

func mapCredentialsRouter(router *gin.Engine) {
	credentials := router.Group("/credentials")
	{
		credentials.POST("/", func(context *gin.Context) {
			context.Status(204)
		})

		credentials.DELETE("/", func(context *gin.Context) {
			context.Status(204)
		})
	}
}
