package blacklist

import (
	"time"

	redis "github.com/go-redis/redis/v9"
)

type refreshBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

func newRefreshBlacklist(redisClient *redis.Client, expiryDuration time.Duration) RedisBlacklist {
	return &refreshBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (blacklist *refreshBlacklist) IsTokenBlacklisted(token string) (bool, error) {
	return false, nil
}

func (blacklist *refreshBlacklist) AddToken(token string) error {
	return nil
}

func (blacklist *refreshBlacklist) RemoveToken(token string) error {
	return nil
}
