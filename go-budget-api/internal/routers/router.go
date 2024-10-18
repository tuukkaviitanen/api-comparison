package routers

import (
	"budget-api/internal/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func GetMainRouter() *gin.Engine {
	router := gin.Default()

	binding.Validator = &customValidator{}

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
