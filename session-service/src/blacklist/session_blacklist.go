package blacklist

import (
	"context"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	sessionKeyLifespanTolerance    = 5 * time.Minute
	redisSessionBlacklistKeyFormat = "auth-session-blacklist-%s"
)

type sessionBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

func newSessionBlacklist(redisClient *redis.Client, expiryDuration time.Duration) RedisBlacklist {
	return &sessionBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (blacklist *sessionBlacklist) IsTokenBlacklisted(token string) (bool, error) {
	redisKey := fmt.Sprintf(redisSessionBlacklistKeyFormat, token)
	ctx := context.Background()
	err := blacklist.redisClient.Get(ctx, redisKey).Err()

	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	return true, nil
}

func (blacklist *sessionBlacklist) AddToken(token string) error {
	redisKey := fmt.Sprintf(redisSessionBlacklistKeyFormat, token)
	ctx := context.Background()
	keyLifespan := blacklist.expiryDuration + sessionKeyLifespanTolerance

	return blacklist.redisClient.Set(ctx, redisKey, "1", keyLifespan).Err()
}

func (blacklist *sessionBlacklist) RemoveToken(token string) error {
	redisKey := fmt.Sprintf(redisSessionBlacklistKeyFormat, token)
	ctx := context.Background()

	return blacklist.redisClient.Del(ctx, redisKey).Err()
}
