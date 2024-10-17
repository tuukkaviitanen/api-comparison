package routers

import (
	"budget-api/internal/middlewares"

	"github.com/gin-gonic/gin"
)

func GetMainRouter() *gin.Engine {
	router := gin.Default()

	router.Use(middlewares.ErrorHandler())

	mapTransactionRouter(router)
	mapCredentialsRouter(router)
	mapReportRouter(router)

	router.GET("/openapi.yaml", func(c *gin.Context) {
		c.Header("Content-Type", "text/yaml")
		c.File("openapi.yaml")
	})

	return router
}
