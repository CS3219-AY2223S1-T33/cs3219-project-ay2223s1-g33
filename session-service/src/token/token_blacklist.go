package token

type TokenBlacklist interface {
	AddToken(token string) error
	RemoveToken(token string) error
	IsTokenBlacklisted(token string) (bool, error)
}
