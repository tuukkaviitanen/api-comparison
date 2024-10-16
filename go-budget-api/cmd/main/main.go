package main

import (
	"budget-api/internal/routers"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	PORT := os.Getenv("PORT")
	address := fmt.Sprintf(":%s", PORT)

	router := gin.Default()

	routers.MapTransactionRouter(router)
	routers.MapCredentialsRouter(router)
	routers.MapReportRouter(router)

	router.GET("/openapi.yaml", func(c *gin.Context) {
		c.Header("Content-Type", "text/yaml")
		c.File("openapi.yaml")
	})

	if err := router.Run(address); err != nil {
		log.Fatalln("Error occurred while running the server, Error", err)
	}
}
