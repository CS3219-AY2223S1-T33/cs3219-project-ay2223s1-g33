package blacklist

import (
	"time"

	redis "github.com/go-redis/redis/v9"
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
	return false, nil
}

func (blacklist *sessionBlacklist) AddToken(token string) error {
	return nil
}

func (blacklist *sessionBlacklist) RemoveToken(token string) error {
	return nil
}
