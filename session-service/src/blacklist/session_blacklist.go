package blacklist

import (
	"context"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	sessionKeyLifespanTolerance    = 5 * time.Minute
	redisSessionBlacklistKeyFormat = "auth-session-blacklist-%s-%d"
)

type sessionBlacklist struct {
	ChronologicalBlacklist
	redisClient    *redis.Client
	expiryDuration time.Duration
}

func newSessionBlacklist(redisClient *redis.Client, expiryDuration time.Duration) TokenBlacklist {
	return &sessionBlacklist{
		ChronologicalBlacklist: newChronologicalBlacklist(redisClient, expiryDuration),
		redisClient:            redisClient,
		expiryDuration:         expiryDuration,
	}
}

func (blacklist *sessionBlacklist) IsTokenBlacklisted(token *BlacklistToken) (bool, error) {
	redisKey := blacklist.getTokenRepresentation(token)
	ctx := context.Background()

	redisResults, err := blacklist.redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		pipe.Get(ctx, redisKey)
		blacklist.GetTimestampBlacklistFor(ctx, pipe, token.Username)
		return nil
	})

	if err != nil {
		return false, err
	}

	err = redisResults[0].(*redis.StringCmd).Err()
	if err != nil && err != redis.Nil {
		return false, err
	} else if err == nil {
		return true, nil
	}

	// Token is not specifically blacklisted, check blanket blacklist
	chronoCommandResult, err := redisResults[1].(*redis.StringCmd).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}

	isBlacklisted, err := blacklist.IsTimestampBlacklisted(chronoCommandResult, token.Timestamp)
	if err != nil {
		return false, err
	}

	return isBlacklisted, nil
}

func (blacklist *sessionBlacklist) AddToken(token *BlacklistToken) error {
	redisKey := blacklist.getTokenRepresentation(token)
	ctx := context.Background()
	keyLifespan := blacklist.expiryDuration + sessionKeyLifespanTolerance

	return blacklist.redisClient.Set(ctx, redisKey, "1", keyLifespan).Err()
}

func (blacklist *sessionBlacklist) RemoveToken(token *BlacklistToken) error {
	redisKey := blacklist.getTokenRepresentation(token)
	ctx := context.Background()

	return blacklist.redisClient.Del(ctx, redisKey).Err()
}

func (*sessionBlacklist) getTokenRepresentation(token *BlacklistToken) string {
	return fmt.Sprintf(redisSessionBlacklistKeyFormat, token.Username, token.Timestamp)
}
