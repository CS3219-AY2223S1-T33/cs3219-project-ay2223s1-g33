package blacklist

import (
	"context"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	sessionKeyLifespanTolerance    = 24 * time.Hour
	redisSessionBlacklistKeyFormat = "auth-jwt-blacklist-%d"
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
	redisClient := blacklist.redisClient
	ctx := context.Background()

	startOfDay := getStartOfDay(time.Now())
	blacklistResults, err := redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		forEachPeriod(startOfDay, -24*time.Hour, blacklist.expiryDuration, func(timestamp time.Time) {
			blacklistKey := getBlacklistKeyForDay(timestamp)
			pipe.SIsMember(ctx, blacklistKey, token)
		})
		return nil
	})

	if err != nil {
		return false, err
	}

	for _, blacklistResult := range blacklistResults {
		if blacklistResult.(*redis.BoolCmd).Val() {
			return true, nil
		}
	}

	return false, nil
}

func (blacklist *sessionBlacklist) AddToken(token string) error {
	redisClient := blacklist.redisClient
	ctx := context.Background()

	startOfDay := getStartOfDay(time.Now())
	blacklistKey := getBlacklistKeyForDay(startOfDay)
	tokenLifespan := blacklist.expiryDuration + sessionKeyLifespanTolerance
	tokenExpireAt := startOfDay.Add(tokenLifespan)

	_, err := redisClient.SAdd(ctx, blacklistKey, token).Result()
	if err != nil {
		return err
	}

	_, err = redisClient.ExpireAt(ctx, blacklistKey, tokenExpireAt).Result()
	if err != nil {
		return err
	}

	return nil
}

func (blacklist *sessionBlacklist) RemoveToken(token string) error {
	redisClient := blacklist.redisClient
	ctx := context.Background()

	startOfDay := getStartOfDay(time.Now())
	_, err := redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		forEachPeriod(startOfDay, -24*time.Hour, blacklist.expiryDuration, func(timestamp time.Time) {
			blacklistKey := getBlacklistKeyForDay(timestamp)
			pipe.SRem(ctx, blacklistKey, token)
		})
		return nil
	})
	return err
}

func forEachPeriod(baseTimestamp time.Time, stepSize time.Duration, maximumGap time.Duration, consumer func(time.Time)) {
	shouldContinue := func(timestamp time.Time) bool {
		if stepSize < 0 {
			return baseTimestamp.Sub(timestamp) < maximumGap
		} else {
			return timestamp.Sub(baseTimestamp) < maximumGap
		}
	}

	for currentTimestamp := baseTimestamp; shouldContinue(currentTimestamp); baseTimestamp = baseTimestamp.Add(stepSize) {
		consumer(currentTimestamp)
	}
}

func getStartOfDay(now time.Time) time.Time {
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
}

func getBlacklistKeyForDay(baseTimestamp time.Time) string {
	return fmt.Sprintf(redisSessionBlacklistKeyFormat, baseTimestamp.Unix())
}
