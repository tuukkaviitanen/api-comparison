package main

import (
	"budget-api/internal/routers"
	"fmt"
	"log"
	"os"
)

func main() {
	PORT := os.Getenv("PORT")
	address := fmt.Sprintf(":%s", PORT)

	router := routers.GetMainRouter()

	if err := router.Run(address); err != nil {
		log.Fatalln("Error occurred while running the server, Error", err)
	}
}
