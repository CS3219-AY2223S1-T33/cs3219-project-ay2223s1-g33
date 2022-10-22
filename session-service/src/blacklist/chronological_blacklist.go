package blacklist

import (
	"context"
	"cs3219-project-ay2223s1-g33/session-service/blacklist/pipeline"
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	chronoBlacklistTolerance      = 24 * time.Hour
	redisChronoBlacklistKeyFormat = "auth-chrono-blacklist-%s"
)

type ChronoBlacklist interface {
	TokenBlacklistWriter
	redisBlacklistFilterProvider
}

type chronoBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

func newChronoBlacklist(redisClient *redis.Client, expiryDuration time.Duration) ChronoBlacklist {
	return &chronoBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (chronoBlacklist *chronoBlacklist) getFiltersFor(token *IssuedToken) []pipeline.RedisBlacklistFilter {
	querierFunc := func(ctx context.Context, client redis.Cmdable) {
		chronoBlacklist.queryChronoBlacklist(ctx, client, token.Username)
	}

	checkerFunc := func(result redis.Cmder) (bool, error) {
		castedResult, ok := result.(*redis.StringCmd)
		if !ok {
			return false, errors.New("Unexpected Redis Reply")
		}

		chronoCommandResult, err := castedResult.Result()
		if err == redis.Nil {
			return false, nil
		} else if err != nil {
			return false, err
		}

		return chronoBlacklist.isTimestampBlacklisted(chronoCommandResult, token.Timestamp)
	}

	return []pipeline.RedisBlacklistFilter{
		pipeline.BlacklistFilterFrom(querierFunc, checkerFunc),
	}
}

func (chronoBlacklist *chronoBlacklist) AddToken(token *IssuedToken) error {
	redisKey := chronoBlacklist.getTokenRepresentation(token.Username)
	ctx := context.Background()
	keyLifespan := chronoBlacklist.expiryDuration + chronoBlacklistTolerance
	value := fmt.Sprintf("%d", token.Timestamp)

	val, err := chronoBlacklist.redisClient.Get(ctx, redisKey).Result()
	if err != nil && err != redis.Nil {
		log.Println(err)
		return err
	}

	timestamp := uint64(0)
	if err != redis.Nil {
		timestamp, err = strconv.ParseUint(val, 10, 64)
		if err != nil {
			return err
		}
	}

	if timestamp > token.Timestamp {
		return nil
	}

	return chronoBlacklist.redisClient.Set(ctx, redisKey, value, keyLifespan).Err()
}

func (chronoBlacklist *chronoBlacklist) RemoveToken(token *IssuedToken) error {
	redisKey := chronoBlacklist.getTokenRepresentation(token.Username)
	ctx := context.Background()

	return chronoBlacklist.redisClient.Del(ctx, redisKey).Err()
}

func (chronoBlacklist *chronoBlacklist) queryChronoBlacklist(ctx context.Context, client redis.Cmdable, username string) {
	key := chronoBlacklist.getTokenRepresentation(username)
	client.Get(ctx, key)
}

func (chronoBlacklist *chronoBlacklist) isTimestampBlacklisted(redisValue string, timestamp uint64) (bool, error) {
	redisTimestamp, err := strconv.ParseUint(redisValue, 10, 64)
	if err != nil {
		return false, err
	}

	return timestamp <= redisTimestamp, nil
}

func (*chronoBlacklist) getTokenRepresentation(username string) string {
	return fmt.Sprintf(redisChronoBlacklistKeyFormat, username)
}
