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
	refreshKeyLifespanTolerance    = 24 * time.Hour
	redisRefreshBlacklistKeyFormat = "auth-refresh-blacklist-%d"
	refreshBlacklistTokenFormat    = "%s-%d"
)

type refreshBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

type RefreshBlacklist interface {
	TokenBlacklistWriter
	redisBlacklistFilterProvider
}

func newRefreshBlacklist(redisClient *redis.Client, expiryDuration time.Duration) RefreshBlacklist {
	return &refreshBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (blacklist *refreshBlacklist) getFiltersFor(token *IssuedToken) []pipeline.RedisBlacklistFilter {
	flattenedToken := blacklist.getTokenRepresentation(token)
	startOfDay := getStartOfDay(time.Now())
	filters := make([]pipeline.RedisBlacklistFilter, 0)

	checkerFunc := func(result redis.Cmder) (bool, error) {
		castedResult, ok := result.(*redis.BoolCmd)
		if !ok {
			return false, errors.New("Unexpected Redis Reply")
		}

		err := castedResult.Err()
		if err == redis.Nil {
			return false, nil
		} else if err != nil {
			return false, err
		}
		return castedResult.Val(), nil
	}

	forEachPeriod(startOfDay, -24*time.Hour, blacklist.expiryDuration, func(timestamp time.Time) {
		blacklistKey := getBlacklistKeyForDay(timestamp)
		querierFunc := func(ctx context.Context, client redis.Cmdable) {
			client.SIsMember(ctx, blacklistKey, flattenedToken)
		}
		filters = append(filters, pipeline.BlacklistFilterFrom(querierFunc, checkerFunc))
	})

	return filters
}

func (blacklist *refreshBlacklist) AddToken(token *IssuedToken) error {
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

func (blacklist *refreshBlacklist) RemoveToken(token *IssuedToken) error {
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

func (*refreshBlacklist) getTokenRepresentation(token *IssuedToken) string {
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
