package auth

import (
	"context"
	"log"
	"net/http"
)

const (
	loginRoute    = "/user/login"
	registerRoute = "/user/register"
)

func AttachAuthMiddleware(ctx context.Context, authServiceUrl string, mux http.Handler) (http.Handler, error) {
	log.Printf("Auth Middleware with Server on %s\n", authServiceUrl)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		if path == loginRoute || path == registerRoute {
			mux.ServeHTTP(w, r)
			return
		}

		// Authenticate
		/*_, err := r.Cookie("AUTH-SESSION")
		if err != nil {
			writeUnauthorizedResponse(w)
			return
		}*/
		mux.ServeHTTP(w, r)
	})
	return handler, nil
}

func writeUnauthorizedResponse(w http.ResponseWriter) {
	w.WriteHeader(400)
	w.Write([]byte("Unauthorized"))
}
