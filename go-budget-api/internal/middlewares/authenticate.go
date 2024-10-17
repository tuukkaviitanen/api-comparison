package middlewares

import (
	"budget-api/internal/services"
	b64 "encoding/base64"
	"errors"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/oriser/regroup"
)

var basicAuthRegex = regroup.MustCompile(`(?i)^basic (?P<authString>.+)`)

type basicAuthRegexGroups struct {
	AuthString string `regroup:"authString"`
}

var basicAuthDecryptedFormatRegex = regroup.MustCompile(`(?P<username>.+):(?P<password>.+)`)

type basicAuthDecryptedFormatRegexGroups struct {
	Username string `regroup:"username"`
	Password string `regroup:"password"`
}

func Authenticate() gin.HandlerFunc {
	return func(context *gin.Context) {
		authorizationHeader := context.GetHeader("Authorization")

		if authorizationHeader == "" {
			createAuthenticationError(context, "Authorization header missing")
			return
		}

		basicAuthRegexMatch := &basicAuthRegexGroups{}
		if err := basicAuthRegex.MatchToTarget(authorizationHeader, basicAuthRegexMatch); err != nil {
			createAuthenticationError(context, "Invalid authorization header")
			return
		}

		encryptedAuthString := basicAuthRegexMatch.AuthString

		decodedAuthBytes, err := b64.StdEncoding.DecodeString(encryptedAuthString)
		if err != nil {
			createAuthenticationError(context, "Invalid base64 string")
			return
		}

		decodedAuthString := string(decodedAuthBytes)

		basicAuthDecryptedFormatRegexMatch := &basicAuthDecryptedFormatRegexGroups{}
		if err := basicAuthDecryptedFormatRegex.MatchToTarget(decodedAuthString, basicAuthDecryptedFormatRegexMatch); err != nil {
			createAuthenticationError(context, "Invalid credentials format")
			return
		}

		username := basicAuthDecryptedFormatRegexMatch.Username
		password := basicAuthDecryptedFormatRegexMatch.Password

		credentialId, err := services.GetCredentialId(username, password)
		if err != nil {
			if errors.Is(err, services.ErrNotFound) {
				createAuthenticationError(context, "Invalid credentials")
				return
			}
			log.Printf("[Authenticate] Error while fetching id %s\n", err.Error())
			_ = context.AbortWithError(500, err)
			return
		}

		context.Set("credentialId", *credentialId)

		context.Next()
	}
}

func createAuthenticationError(context *gin.Context, message string) {
	fullMessage := fmt.Sprintf("Authentication error: %s", message)

	context.Header("WWW-Authenticate", "Basic")
	context.JSON(401, gin.H{
		"error": fullMessage,
	})
	context.Abort()
}
