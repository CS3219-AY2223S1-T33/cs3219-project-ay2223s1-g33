package conn

import (
	"context"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v9"
)

//go:generate mockgen -destination=../mocks/mock_redis_client.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/conn RedisBlacklistClient
type RedisBlacklistClient interface {
	Connect()
	Close()
	token.TokenBlacklist
}

type redisBlacklistClient struct {
	server         string
	expiryDuration time.Duration

	redisClient *redis.Client
}

const (
	keyLifespanTolerance    = 24 * time.Hour
	redisBlacklistKeyFormat = "auth-jwt-blacklist-%d"
)

func NewRedisBlacklistClient(server string, expiryDuration time.Duration) RedisBlacklistClient {
	return &redisBlacklistClient{
		expiryDuration: expiryDuration,
		server:         server,
	}
}

func (client *redisBlacklistClient) Connect() {
	if client.redisClient != nil {
		return
	}

	connOptions := &redis.Options{
		Addr:     client.server,
		Password: "",
		DB:       0,
	}

	client.redisClient = redis.NewClient(connOptions)
}

func (client *redisBlacklistClient) Close() {
	client.redisClient.Close()
}

func (client *redisBlacklistClient) IsTokenBlacklisted(token string) (bool, error) {
	startOfDay := getStartOfDay(time.Now())
	ctx := context.Background()
	blacklistResults, err := client.redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		for baseTimestamp := startOfDay; startOfDay.Sub(baseTimestamp) < client.expiryDuration; baseTimestamp = baseTimestamp.Add(-24 * time.Hour) {
			blacklistKey := getBlacklistKeyForDay(baseTimestamp)
			pipe.SIsMember(ctx, blacklistKey, token)
		}
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

func (client *redisBlacklistClient) AddToken(token string) error {
	startOfDay := getStartOfDay(time.Now())
	blacklistKey := getBlacklistKeyForDay(startOfDay)
	tokenLifespan := client.expiryDuration + keyLifespanTolerance
	tokenExpireAt := startOfDay.Add(tokenLifespan)

	ctx := context.Background()
	_, err := client.redisClient.SAdd(ctx, blacklistKey, token).Result()
	if err != nil {
		return err
	}

	_, err = client.redisClient.ExpireAt(ctx, blacklistKey, tokenExpireAt).Result()
	if err != nil {
		return err
	}

	return nil
}

func (client *redisBlacklistClient) RemoveToken(token string) error {
	startOfDay := getStartOfDay(time.Now())
	ctx := context.Background()
	_, err := client.redisClient.Pipelined(ctx, func(pipe redis.Pipeliner) error {
		for baseTimestamp := startOfDay; startOfDay.Sub(baseTimestamp) < client.expiryDuration; baseTimestamp = baseTimestamp.Add(-24 * time.Hour) {
			blacklistKey := getBlacklistKeyForDay(baseTimestamp)
			pipe.SRem(ctx, blacklistKey, token)
		}
		return nil
	})
	return err
}

func getStartOfDay(now time.Time) time.Time {
	return now.Truncate(24 * time.Hour)
}

func getBlacklistKeyForDay(baseTimestamp time.Time) string {
	return fmt.Sprintf(redisBlacklistKeyFormat, baseTimestamp.Unix())
}
