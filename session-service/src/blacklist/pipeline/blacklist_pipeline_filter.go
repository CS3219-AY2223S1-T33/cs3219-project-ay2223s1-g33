package pipeline

import (
	"context"

	"github.com/go-redis/redis/v9"
)

type redisBlacklistFilterQuerier func(ctx context.Context, client redis.Cmdable)
type redisBlacklistFilterChecker func(result redis.Cmder) (bool, error)

type RedisBlacklistFilter interface {
	QueryOn(ctx context.Context, client redis.Cmdable)
	IsBlacklisted(result redis.Cmder) (bool, error)
}

type redisBlacklistFilter struct {
	querier redisBlacklistFilterQuerier
	checker redisBlacklistFilterChecker
}

type RedisBlacklistPipeline interface {
	Execute(redisClient *redis.Client) (bool, error)
}

type redisBlacklistPipeline struct {
	filters []RedisBlacklistFilter
}

func (pipeline *redisBlacklistPipeline) Execute(redisClient *redis.Client) (bool, error) {
	ctx := context.Background()
	results, err := redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		for _, filter := range pipeline.filters {
			filter.QueryOn(ctx, pipe)
		}
		return nil
	})

	if err != nil && err != redis.Nil {
		return false, err
	}

	for i, filter := range pipeline.filters {
		isBlacklisted, err := filter.IsBlacklisted(results[i])
		if err != nil {
			return false, err
		}
		if isBlacklisted {
			return true, nil
		}
	}

	return false, nil
}

func (filter *redisBlacklistFilter) QueryOn(ctx context.Context, client redis.Cmdable) {
	filter.querier(ctx, client)
}

func (filter *redisBlacklistFilter) IsBlacklisted(result redis.Cmder) (bool, error) {
	return filter.checker(result)
}

func BlacklistFilterFrom(
	querier func(ctx context.Context, client redis.Cmdable),
	checker func(result redis.Cmder) (bool, error),
) RedisBlacklistFilter {
	return &redisBlacklistFilter{
		querier: querier,
		checker: checker,
	}
}
