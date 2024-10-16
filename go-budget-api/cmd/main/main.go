package main

import (
	"budget-api/internal/routers"
	"fmt"
	"log"
	"os"

	_ "ariga.io/atlas-provider-gorm/gormschema"
)

func main() {
	PORT := os.Getenv("PORT")
	// CONNECTION_STRING := os.Getenv("CONNECTION_STRING")

	address := fmt.Sprintf(":%s", PORT)

	// db, err := gorm.Open(postgres.Open(CONNECTION_STRING), &gorm.Config{})

	router := routers.GetMainRouter()

	if err := router.Run(address); err != nil {
		log.Fatalln("Error occurred while running the server, Error", err)
	}
}
