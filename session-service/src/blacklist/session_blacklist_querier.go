package blacklist

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist/pipeline"

	redis "github.com/go-redis/redis/v9"
)

type sessionBlacklistQuerier struct {
	redisClient      *redis.Client
	chronoBlacklist  ChronoBlacklist
	sessionBlacklist SessionBlacklist
}

type SessionBlacklistQuerier interface {
	TokenBlacklistQuerier
}

func newSessionBlacklistQuerier(
	redisClient *redis.Client,
	chronoBlacklist ChronoBlacklist,
	sessionBlacklist SessionBlacklist,
) SessionBlacklistQuerier {
	return &sessionBlacklistQuerier{
		redisClient:      redisClient,
		chronoBlacklist:  chronoBlacklist,
		sessionBlacklist: sessionBlacklist,
	}
}

func (querier *sessionBlacklistQuerier) IsTokenBlacklisted(token *IssuedToken) (bool, error) {
	pipeline := pipeline.NewRedisBlacklistPipelineBuilder().
		AddAll(querier.chronoBlacklist.getFiltersFor(token)).
		AddAll(querier.sessionBlacklist.getFiltersFor(token)).
		Build()
	return pipeline.Execute(querier.redisClient)
}
