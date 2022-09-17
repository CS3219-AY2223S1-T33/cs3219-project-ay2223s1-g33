package token

//go:generate mockgen -destination=../mocks/mock_token_blacklist.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/token TokenBlacklist
type TokenBlacklist interface {
	AddToken(token string) error
	RemoveToken(token string) error
	IsTokenBlacklisted(token string) (bool, error)
}
