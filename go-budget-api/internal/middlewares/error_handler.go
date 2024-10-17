package middlewares

import (
	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return func(context *gin.Context) {
		context.Next()
		if len(context.Errors) > 0 {
			context.JSON(-1, gin.H{"error": "Unexpected error occurred"})
		}
	}
}
