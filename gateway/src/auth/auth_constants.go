package auth

const (
	AuthHeaderUsername         = "X-Bearer-Username"
	AuthHeaderNickname         = "X-Bearer-Nickname"
	AuthHeaderSessionToken     = "X-Bearer-Session-Token"
	AuthHeaderRefreshToken     = "X-Bearer-Refresh-Token"
	AuthCookieNameSessionToken = "AUTH-SESSION"
	AuthCookieNameRefreshToken = "AUTH-REFRESH"
)
