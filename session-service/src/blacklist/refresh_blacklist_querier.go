package blacklist

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist/pipeline"

	redis "github.com/go-redis/redis/v9"
)

type refreshBlacklistQuerier struct {
	redisClient      *redis.Client
	chronoBlacklist  ChronoBlacklist
	refreshBlacklist RefreshBlacklist
}

type RefreshBlacklistQuerier interface {
	TokenBlacklistQuerier
}

func newRefreshBlacklistQuerier(
	redisClient *redis.Client,
	chronoBlacklist ChronoBlacklist,
	refreshBlacklist RefreshBlacklist,
) RefreshBlacklistQuerier {
	return &refreshBlacklistQuerier{
		redisClient:      redisClient,
		chronoBlacklist:  chronoBlacklist,
		refreshBlacklist: refreshBlacklist,
	}
}

func (querier *refreshBlacklistQuerier) IsTokenBlacklisted(token *IssuedToken) (bool, error) {
	pipeline := pipeline.NewRedisBlacklistPipelineBuilder().
		AddAll(querier.chronoBlacklist.getFiltersFor(token)).
		AddAll(querier.refreshBlacklist.getFiltersFor(token)).
		Build()
	return pipeline.Execute(querier.redisClient)
}
