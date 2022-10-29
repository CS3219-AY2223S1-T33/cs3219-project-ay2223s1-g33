package auth

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"fmt"
	"log"
	"net/http"
	"strings"
)

const (
	loginRoute             = "/api/user/login"
	registerRoute          = "/api/user/register"
	passwordResetRoute     = "/api/reset"
	resetTokenConsumeRoute = "/api/reset/confirm"
)

type authMiddleware struct {
	util.BasePipeOutput
	sessionServiceUrl string
	authAgent         AuthAgent
}

func NewAuthMiddleware(sessionServiceUrl string) util.DisposableThroughPipe {
	log.Printf("Auth Middleware using Session Service on %s\n", sessionServiceUrl)
	authAgent, err := CreateAuthAgent(sessionServiceUrl)
	if err != nil {
		return nil
	}

	return &authMiddleware{
		sessionServiceUrl: sessionServiceUrl,
		authAgent:         authAgent,
	}
}

func (middleware *authMiddleware) Dispose() {
	middleware.authAgent.Dispose()
}

func (middleware *authMiddleware) Receive(httpCtx *util.HTTPContext) error {
	req := httpCtx.Request
	resp := httpCtx.Response

	path := req.URL.EscapedPath()
	if isUnprotectedRoute(path) {
		return middleware.BasePipeOutput.WriteToDownstream((httpCtx))
	}

	sanitizeRequest(req)

	// Authenticate
	sessionTokenCookie, err := req.Cookie(AuthCookieNameSessionToken)
	if err != nil {
		return writeUnauthorizedResponse(resp)
	}
	sessionToken := sessionTokenCookie.Value

	refreshTokenCookie, err := req.Cookie(AuthCookieNameRefreshToken)
	if err != nil {
		return writeUnauthorizedResponse(resp)
	}
	refreshToken := refreshTokenCookie.Value

	if sessionToken == "" || refreshToken == "" {
		return writeUnauthorizedResponse(resp)
	}

	log.Println("Authenticating with server")
	username, nickname, newSessionToken, err := middleware.authAgent.ValidateToken(sessionToken, refreshToken)
	if err != nil {
		return writeUnauthorizedResponse(resp)
	}

	if newSessionToken != "" {
		resp.Header().Add("Set-Cookie", fmt.Sprintf(
			"%s=%s; Path=/",
			AuthCookieNameSessionToken,
			newSessionToken,
		))
		sessionToken = newSessionToken
	}

	addAuthHeaders(req, username, nickname, sessionToken, refreshToken)
	return middleware.WriteToDownstream(httpCtx)
}

func isUnprotectedRoute(path string) bool {
	return path == loginRoute ||
		path == registerRoute ||
		path == passwordResetRoute ||
		path == resetTokenConsumeRoute ||
		path == "/" ||
		strings.HasPrefix(path, "/static")
}

func sanitizeRequest(req *http.Request) {
	req.Header.Set(AuthHeaderUsername, "")
	req.Header.Set(AuthHeaderNickname, "")
	req.Header.Set(AuthHeaderSessionToken, "")
	req.Header.Set(AuthHeaderRefreshToken, "")
}

func addAuthHeaders(
	req *http.Request,
	username string,
	nickname string,
	sessionToken string,
	refreshToken string,
) {
	req.Header.Set(AuthHeaderUsername, username)
	req.Header.Set(AuthHeaderNickname, nickname)
	req.Header.Set(AuthHeaderSessionToken, sessionToken)
	req.Header.Set(AuthHeaderRefreshToken, refreshToken)
}

func writeUnauthorizedResponse(w http.ResponseWriter) error {
	w.WriteHeader(401)
	_, err := w.Write([]byte("Unauthorized"))
	return err
}
