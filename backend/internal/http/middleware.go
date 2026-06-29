package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORS returns a small, dependency-free CORS middleware.
//
//   - If the allowed list contains "*", "*" is echoed for
//     Access-Control-Allow-Origin.
//   - Otherwise, when the request Origin is in the allowed list it is echoed
//     back and "Vary: Origin" is set.
//   - Standard methods and headers are always advertised.
//   - OPTIONS preflight requests are answered with 204 No Content.
func CORS(allowed []string) gin.HandlerFunc {
	allowAll := false
	set := make(map[string]struct{}, len(allowed))
	for _, o := range allowed {
		if o == "*" {
			allowAll = true
		}
		set[o] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if allowAll {
			c.Header("Access-Control-Allow-Origin", "*")
		} else if origin != "" {
			if _, ok := set[origin]; ok {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Vary", "Origin")
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
