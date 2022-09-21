package blacklist

import (
	"time"

	redis "github.com/go-redis/redis/v9"
)

//go:generate mockgen -destination=../mocks/mock_redis_client.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/conn RedisBlacklistClient
type RedisBlacklistClient interface {
	Connect() error
	Close()
	GetSessionBlacklist() RedisBlacklist
	GetRefreshBlacklist() RedisBlacklist
}

type blacklistClient struct {
	server                string
	sessionExpiryDuration time.Duration
	refreshExpiryDuration time.Duration

	redisClient      *redis.Client
	sessionBlacklist RedisBlacklist
	refreshBlacklist RedisBlacklist
}

type RedisBlacklist interface {
	AddToken(token string) error
	RemoveToken(token string) error
	IsTokenBlacklisted(token string) (bool, error)
}

func NewRedisBlacklistClient(
	server string,
	sessionExpiryDuration time.Duration,
	refreshExpiryDuration time.Duration,
) RedisBlacklistClient {
	return &blacklistClient{
		server:                server,
		sessionExpiryDuration: sessionExpiryDuration,
		refreshExpiryDuration: refreshExpiryDuration,
	}
}

func (client *blacklistClient) Connect() error {
	if client.redisClient != nil {
		return nil
	}

	connOptions := &redis.Options{
		Addr:     client.server,
		Password: "",
		DB:       0,
	}

	client.redisClient = redis.NewClient(connOptions)
	client.sessionBlacklist = newSessionBlacklist(client.redisClient, client.sessionExpiryDuration)
	client.refreshBlacklist = newRefreshBlacklist(client.redisClient, client.refreshExpiryDuration)

	return nil
}

func (client *blacklistClient) Close() {
	client.redisClient.Close()
}

func (client *blacklistClient) GetSessionBlacklist() RedisBlacklist {
	return client.sessionBlacklist
}

func (client *blacklistClient) GetRefreshBlacklist() RedisBlacklist {
	return client.refreshBlacklist
}
