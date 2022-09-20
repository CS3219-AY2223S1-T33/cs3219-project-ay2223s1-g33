package auth

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"fmt"
	"log"
	"net/http"
	"strings"
)

const (
	loginRoute    = "/api/user/login"
	registerRoute = "/api/user/register"

	headerUsername         = "X-Bearer-Username"
	headerSessionToken     = "X-Bearer-Session-Token"
	headerRefreshToken     = "X-Bearer-Refresh-Token"
	cookieNameSessionToken = "AUTH-SESSION"
	cookieNameRefreshToken = "AUTH-REFRESH"
)

func AttachAuthMiddleware(sessionServiceUrl string, mux http.Handler) (http.Handler, util.Disposable, error) {
	log.Printf("Auth Middleware with Server on %s\n", sessionServiceUrl)
	authAgent, err := CreateAuthAgent(sessionServiceUrl)
	if err != nil {
		return nil, nil, err
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		if path == loginRoute || path == registerRoute || path == "/" || strings.HasPrefix(path, "/static") {
			mux.ServeHTTP(w, r)
			return
		}

		// Sanitize the request
		r.Header.Set(headerUsername, "")
		r.Header.Set(headerSessionToken, "")
		r.Header.Set(headerRefreshToken, "")

		// Authenticate
		sessionToken, err := r.Cookie(cookieNameSessionToken)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		refreshToken, err := r.Cookie(cookieNameRefreshToken)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		log.Println("Authenticating with server")
		username, newSessionToken, err := authAgent.ValidateToken(sessionToken.Value, refreshToken.Value)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		r.Header.Set(headerUsername, username)
		r.Header.Set(headerSessionToken, sessionToken.Value)
		r.Header.Set(headerRefreshToken, refreshToken.Value)

		if newSessionToken != "" {
			w.Header().Add("Set-Cookie", fmt.Sprintf(
				"%s=%s; Path=/",
				cookieNameSessionToken,
				newSessionToken,
			))
		}

		mux.ServeHTTP(w, r)
	})
	return handler, authAgent, nil
}

func writeUnauthorizedResponse(w http.ResponseWriter) {
	w.WriteHeader(403)
	w.Write([]byte("Unauthorized"))
}
