package middlewares

import (
	b64 "encoding/base64"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/oriser/regroup"
)

var basicAuthRegex = regroup.MustCompile(`^basic (?P<authString>.+)`)

type basicAuthRegexGroups struct {
	AuthString string `regroup:"string"`
}

var basicAuthDecryptedFormatRegex = regroup.MustCompile(`(?<username>.+):(?<password>.+)`)

type basicAuthDecryptedFormatRegexGroups struct {
	Username string `regroup:"string"`
	Password string `regroup:"string"`
}

func Authenticate() gin.HandlerFunc {
	return func(context *gin.Context) {
		authorizationHeader := context.GetHeader("Authorization")

		if authorizationHeader == "" {
			createAuthenticationError(context, "Authorization header missing")
			return
		}

		var basicAuthRegexMatch = &basicAuthRegexGroups{}
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

		credentialId := fmt.Sprintf("%s:%s", username, password)

		context.Set("credentialId", credentialId)

		context.Next()
	}
}

func createAuthenticationError(context *gin.Context, message string) {
	fullMessage := fmt.Sprintf("Authentication error: %s", message)

	context.Header("WWW-Authenticate", "Basic")
	context.JSON(401, gin.H{
		"error": fullMessage,
	})
}
