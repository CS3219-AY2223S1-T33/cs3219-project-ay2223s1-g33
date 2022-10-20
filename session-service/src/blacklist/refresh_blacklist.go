package blacklist

import (
	"context"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	refreshKeyLifespanTolerance    = 24 * time.Hour
	redisRefreshBlacklistKeyFormat = "auth-refresh-blacklist-%d"
	refreshBlacklistTokenFormat    = "%s-%d"
)

type refreshBlacklist struct {
	chronologicalBlacklist
	redisClient    *redis.Client
	expiryDuration time.Duration
}

func newRefreshBlacklist(redisClient *redis.Client, expiryDuration time.Duration) TokenBlacklist {
	return &refreshBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (blacklist *refreshBlacklist) IsTokenBlacklisted(token *BlacklistToken) (bool, error) {
	redisClient := blacklist.redisClient
	ctx := context.Background()
	flattenedToken := blacklist.getTokenRepresentation(token)

	startOfDay := getStartOfDay(time.Now())
	blacklistResults, err := redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		blacklist.GetTimestampBlacklistFor(ctx, pipe, token.Username)
		forEachPeriod(startOfDay, -24*time.Hour, blacklist.expiryDuration, func(timestamp time.Time) {
			blacklistKey := getBlacklistKeyForDay(timestamp)
			pipe.SIsMember(ctx, blacklistKey, flattenedToken)
		})
		return nil
	})

	if err != nil {
		return false, err
	}

	for _, blacklistResult := range blacklistResults[1:] {
		if blacklistResult.(*redis.BoolCmd).Val() {
			return true, nil
		}
	}

	chronoCommandResult, err := blacklistResults[0].(*redis.StringCmd).Result()
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

func (blacklist *refreshBlacklist) AddToken(token *BlacklistToken) error {
	redisClient := blacklist.redisClient
	ctx := context.Background()

	flattenedToken := blacklist.getTokenRepresentation(token)
	startOfDay := getStartOfDay(time.Now())
	blacklistKey := getBlacklistKeyForDay(startOfDay)
	tokenLifespan := blacklist.expiryDuration + refreshKeyLifespanTolerance
	tokenExpireAt := startOfDay.Add(tokenLifespan)

	_, err := redisClient.SAdd(ctx, blacklistKey, flattenedToken).Result()
	if err != nil {
		return err
	}

	_, err = redisClient.ExpireAt(ctx, blacklistKey, tokenExpireAt).Result()
	if err != nil {
		return err
	}

	return nil
}

func (blacklist *refreshBlacklist) RemoveToken(token *BlacklistToken) error {
	redisClient := blacklist.redisClient
	ctx := context.Background()

	flattenedToken := blacklist.getTokenRepresentation(token)
	startOfDay := getStartOfDay(time.Now())
	_, err := redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		forEachPeriod(startOfDay, -24*time.Hour, blacklist.expiryDuration, func(timestamp time.Time) {
			blacklistKey := getBlacklistKeyForDay(timestamp)
			pipe.SRem(ctx, blacklistKey, flattenedToken)
		})
		return nil
	})
	return err
}

func (*refreshBlacklist) getTokenRepresentation(token *BlacklistToken) string {
	return fmt.Sprintf(refreshBlacklistTokenFormat, token.Username, token.Timestamp)
}

func forEachPeriod(baseTimestamp time.Time, stepSize time.Duration, maximumGap time.Duration, consumer func(time.Time)) {
	shouldContinue := func(timestamp time.Time) bool {
		if stepSize < 0 {
			return baseTimestamp.Sub(timestamp) < maximumGap
		} else {
			return timestamp.Sub(baseTimestamp) < maximumGap
		}
	}

	for currentTimestamp := baseTimestamp; shouldContinue(currentTimestamp); currentTimestamp = currentTimestamp.Add(stepSize) {
		consumer(currentTimestamp)
	}
}

func getStartOfDay(now time.Time) time.Time {
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
}

func getBlacklistKeyForDay(baseTimestamp time.Time) string {
	return fmt.Sprintf(redisRefreshBlacklistKeyFormat, baseTimestamp.Unix())
}
