package blacklist

import (
	"context"
	"cs3219-project-ay2223s1-g33/session-service/blacklist/pipeline"
	"errors"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	sessionKeyLifespanTolerance    = 5 * time.Minute
	redisSessionBlacklistKeyFormat = "auth-session-blacklist-%s-%d"
)

type sessionBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

type SessionBlacklist interface {
	TokenBlacklistWriter
	redisBlacklistFilterProvider
}

func newSessionBlacklist(redisClient *redis.Client, expiryDuration time.Duration) SessionBlacklist {
	return &sessionBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (blacklist *sessionBlacklist) getFiltersFor(token *IssuedToken) []pipeline.RedisBlacklistFilter {
	redisKey := blacklist.getTokenRepresentation(token)
	querierFunc := func(ctx context.Context, client redis.Cmdable) {
		client.Get(ctx, redisKey)
	}

	checkerFunc := func(result redis.Cmder) (bool, error) {
		castedResult, ok := result.(*redis.StringCmd)
		if !ok {
			return false, errors.New("Unexpected Redis Reply")
		}

		err := castedResult.Err()
		if err == redis.Nil {
			return false, nil
		} else if err != nil {
			return false, err
		}

		return true, nil
	}

	return []pipeline.RedisBlacklistFilter{
		pipeline.BlacklistFilterFrom(querierFunc, checkerFunc),
	}
}

func (blacklist *sessionBlacklist) AddToken(token *IssuedToken) error {
	redisKey := blacklist.getTokenRepresentation(token)
	ctx := context.Background()
	keyLifespan := blacklist.expiryDuration + sessionKeyLifespanTolerance

	return blacklist.redisClient.Set(ctx, redisKey, "1", keyLifespan).Err()
}

func (blacklist *sessionBlacklist) RemoveToken(token *IssuedToken) error {
	redisKey := blacklist.getTokenRepresentation(token)
	ctx := context.Background()

	return blacklist.redisClient.Del(ctx, redisKey).Err()
}

func (*sessionBlacklist) getTokenRepresentation(token *IssuedToken) string {
	return fmt.Sprintf(redisSessionBlacklistKeyFormat, token.Username, token.Timestamp)
}
