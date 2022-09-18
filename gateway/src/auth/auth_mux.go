package auth

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"log"
	"net/http"
)

const (
	loginRoute    = "/user/login"
	registerRoute = "/user/register"
)

func AttachAuthMiddleware(sessionServiceUrl string, mux http.Handler) (http.Handler, util.Disposable, error) {
	log.Printf("Auth Middleware with Server on %s\n", sessionServiceUrl)
	authAgent, err := CreateAuthAgent(sessionServiceUrl)
	if err != nil {
		return nil, nil, err
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		if path == loginRoute || path == registerRoute {
			mux.ServeHTTP(w, r)
			return
		}

		// Sanitize the request
		r.Header.Set("X-Bearer-Username", "")
		r.Header.Set("X-Bearer-Session-Token", "")

		// Authenticate
		token, err := r.Cookie("AUTH-SESSION")
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		log.Println("Authenticating with server")
		username, err := authAgent.ValidateToken(token.Value)
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}

		r.Header.Set("X-Bearer-Username", username)
		r.Header.Set("X-Bearer-Session-Token", token.Value)
		mux.ServeHTTP(w, r)
	})
	return handler, authAgent, nil
}

func writeUnauthorizedResponse(w http.ResponseWriter) {
	w.WriteHeader(400)
	w.Write([]byte("Unauthorized"))
}
