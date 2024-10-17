package routers

import (
	"budget-api/internal/middlewares"
	"budget-api/internal/models"
	"budget-api/internal/services"
	"errors"
	"log"

	"github.com/gin-gonic/gin"
)

func mapCredentialsRouter(router *gin.Engine) {
	credentials := router.Group("/credentials")
	{
		credentials.POST("/", postCredentials())

		credentials.Use(middlewares.Authenticate())

		credentials.DELETE("/", deleteCredentials())
	}
}

func postCredentials() gin.HandlerFunc {
	return func(context *gin.Context) {
		var body models.Credential

		if err := context.ShouldBindBodyWithJSON(&body); err != nil {
			context.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if err := services.CreateCredential(body.Username, body.Password); err != nil {
			if errors.Is(err, services.ErrUnique) {
				context.JSON(400, gin.H{"error": "Unique error: username is already taken"})
			} else {
				log.Printf("[POST Credential] Unexpected error: %s\n", err.Error())
				_ = context.AbortWithError(500, err)
			}
			return
		}

		context.Status(204)
	}
}

func deleteCredentials() gin.HandlerFunc {
	return func(context *gin.Context) {
		credentialId := context.GetString("credentialId")

		if err := services.DeleteCredential(credentialId); err != nil {
			log.Printf("[DELETE Credential] Unexpected error: %s\n", err.Error())
			_ = context.AbortWithError(500, err)
			return
		}

		context.Status(204)
	}
}
