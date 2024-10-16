package main

import (
	"budget-api/internal/db"
	"budget-api/internal/routers"
	"fmt"
	"log"
	"os"
)

func main() {
	PORT := os.Getenv("PORT")
	CONNECTION_STRING := os.Getenv("CONNECTION_STRING")

	if PORT == "" {
		log.Fatalln("PORT environment variable not found, exiting...")
	}
	if CONNECTION_STRING == "" {
		log.Fatalln("CONNECTION_STRING environment variable not found, exiting...")
	}

	log.Printf("PORT: %s, CONNECTION_STRING: %s\n", PORT, CONNECTION_STRING)

	address := fmt.Sprintf(":%s", PORT)

	log.Println("Initializing database connection...")
	err := db.ConnectToDatabase(CONNECTION_STRING)
	if err != nil {
		log.Fatalln("Error occurred while initializing database connection, Error", err)
	}
	log.Println("Database connection initialized successfully!")

	router := routers.GetMainRouter()

	if err := router.Run(address); err != nil {
		log.Fatalln("Error occurred while running the server, Error", err)
	}
}
