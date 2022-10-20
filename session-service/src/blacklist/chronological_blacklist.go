package blacklist

import (
	"context"
	"fmt"
	"strconv"
	"time"

	redis "github.com/go-redis/redis/v9"
)

const (
	chronoBlacklistTolerance      = 24 * time.Hour
	redisChronoBlacklistKeyFormat = "auth-chrono-blacklist-%s"
)

type ChronologicalBlacklist interface {
	IsTokenBlacklisted(username string, timestamp uint64) (bool, error)
	GetTimestampBlacklistFor(ctx context.Context, client RedisGetClient, username string) (string, error)
	IsTimestampBlacklisted(redisValue string, timestamp uint64) (bool, error)
}

type chronologicalBlacklist struct {
	redisClient    *redis.Client
	expiryDuration time.Duration
}

type RedisGetClient interface {
	Get(ctx context.Context, key string) *redis.StringCmd
}

func newChronologicalBlacklist(redisClient *redis.Client, expiryDuration time.Duration) ChronologicalBlacklist {
	return &chronologicalBlacklist{
		redisClient:    redisClient,
		expiryDuration: expiryDuration,
	}
}

func (chronoBlacklist *chronologicalBlacklist) IsTokenBlacklisted(username string, timestamp uint64) (bool, error) {
	ctx := context.Background()

	redisVal, err := chronoBlacklist.GetTimestampBlacklistFor(ctx, chronoBlacklist.redisClient, username)
	if err != nil {
		return false, err
	}

	isBlacklisted, err := chronoBlacklist.IsTimestampBlacklisted(redisVal, timestamp)
	if err != nil {
		return false, err
	}

	return isBlacklisted, nil
}

func (chronoBlacklist *chronologicalBlacklist) GetTimestampBlacklistFor(ctx context.Context, client RedisGetClient, username string) (string, error) {
	key := fmt.Sprintf(redisChronoBlacklistKeyFormat, username)
	result := client.Get(ctx, key)
	val, err := result.Result()

	if err == redis.Nil {
		return "", nil
	} else if err != nil {
		return "", err
	}
	return val, nil
}

func (chronoBlacklist *chronologicalBlacklist) IsTimestampBlacklisted(redisValue string, timestamp uint64) (bool, error) {
	redisTimestamp, err := strconv.ParseUint(redisValue, 10, 64)
	if err != nil {
		return false, err
	}

	return timestamp <= redisTimestamp, nil
}
