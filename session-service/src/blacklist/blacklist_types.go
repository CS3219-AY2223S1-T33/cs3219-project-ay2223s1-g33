package blacklist

import "cs3219-project-ay2223s1-g33/session-service/blacklist/pipeline"

type IssuedToken struct {
	Username  string
	Timestamp uint64
}

//go:generate mockgen -destination=../mocks/mock_token_blacklist.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/blacklist TokenBlacklistWriter,TokenBlacklistQuerier
type TokenBlacklistWriter interface {
	AddToken(token *IssuedToken) error
	RemoveToken(token *IssuedToken) error
}

type TokenBlacklistQuerier interface {
	IsTokenBlacklisted(token *IssuedToken) (bool, error)
}

type redisBlacklistFilterProvider interface {
	getFiltersFor(token *IssuedToken) []pipeline.RedisBlacklistFilter
}
