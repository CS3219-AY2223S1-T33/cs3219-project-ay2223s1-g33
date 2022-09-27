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
	headerNickname         = "X-Bearer-Nickname"
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

		sanitizeRequest(r)

		// Authenticate
		sessionTokenCookie, err := r.Cookie(cookieNameSessionToken)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}
		sessionToken := sessionTokenCookie.Value

		refreshTokenCookie, err := r.Cookie(cookieNameRefreshToken)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}
		refreshToken := refreshTokenCookie.Value

		log.Println("Authenticating with server")
		username, nickname, newSessionToken, err := authAgent.ValidateToken(sessionToken, refreshToken)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		if newSessionToken != "" {
			w.Header().Add("Set-Cookie", fmt.Sprintf(
				"%s=%s; Path=/",
				cookieNameSessionToken,
				newSessionToken,
			))
			sessionToken = newSessionToken
		}

		addAuthHeaders(r, username, nickname, sessionToken, refreshToken)
		mux.ServeHTTP(w, r)
	})
	return handler, authAgent, nil
}

func sanitizeRequest(req *http.Request) {
	req.Header.Set(headerUsername, "")
	req.Header.Set(headerNickname, "")
	req.Header.Set(headerSessionToken, "")
	req.Header.Set(headerRefreshToken, "")
}

func addAuthHeaders(
	req *http.Request,
	username string,
	nickname string,
	sessionToken string,
	refreshToken string,
) {
	req.Header.Set(headerUsername, username)
	req.Header.Set(headerNickname, nickname)
	req.Header.Set(headerSessionToken, sessionToken)
	req.Header.Set(headerRefreshToken, refreshToken)
}

func writeUnauthorizedResponse(w http.ResponseWriter) {
	w.WriteHeader(403)
	w.Write([]byte("Unauthorized"))
}
