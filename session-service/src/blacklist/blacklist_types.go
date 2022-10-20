package blacklist

type BlacklistToken struct {
	Username  string
	Timestamp uint64
}

//go:generate mockgen -destination=../mocks/mock_token_blacklist.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/blacklist TokenBlacklist
type TokenBlacklist interface {
	AddToken(token *BlacklistToken) error
	RemoveToken(token *BlacklistToken) error
	IsTokenBlacklisted(token *BlacklistToken) (bool, error)
}
