package routers

import "github.com/gin-gonic/gin"

func GetMainRouter() *gin.Engine {
	router := gin.Default()

	mapTransactionRouter(router)
	mapCredentialsRouter(router)
	mapReportRouter(router)

	router.GET("/openapi.yaml", func(c *gin.Context) {
		c.Header("Content-Type", "text/yaml")
		c.File("openapi.yaml")
	})

	return router
}
