package blacklist

import (
	"time"

	redis "github.com/go-redis/redis/v9"
)

//go:generate mockgen -destination=../mocks/mock_redis_client.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/blacklist RedisBlacklistClient
type RedisBlacklistClient interface {
	Connect() error
	Close()
	GetSessionBlacklist() TokenBlacklistWriter
	GetRefreshBlacklist() TokenBlacklistWriter
	GetChronoBlacklist() TokenBlacklistWriter

	GetSessionBlacklistQuerier() TokenBlacklistQuerier
	GetRefreshBlacklistQuerier() TokenBlacklistQuerier
}

type blacklistClient struct {
	server                string
	sessionExpiryDuration time.Duration
	refreshExpiryDuration time.Duration

	redisClient      *redis.Client
	sessionBlacklist SessionBlacklist
	refreshBlacklist RefreshBlacklist
	chronoBlacklist  ChronoBlacklist

	sessionBlacklistQuerier SessionBlacklistQuerier
	refreshBlacklistQuerier RefreshBlacklistQuerier
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
	client.chronoBlacklist = newChronoBlacklist(client.redisClient, client.refreshExpiryDuration)
	client.sessionBlacklistQuerier = newSessionBlacklistQuerier(
		client.redisClient,
		client.chronoBlacklist,
		client.sessionBlacklist,
	)
	client.refreshBlacklistQuerier = newRefreshBlacklistQuerier(
		client.redisClient,
		client.chronoBlacklist,
		client.refreshBlacklist,
	)

	return nil
}

func (client *blacklistClient) Close() {
	client.redisClient.Close()
}

func (client *blacklistClient) GetSessionBlacklist() TokenBlacklistWriter {
	return client.sessionBlacklist
}

func (client *blacklistClient) GetRefreshBlacklist() TokenBlacklistWriter {
	return client.refreshBlacklist
}

func (client *blacklistClient) GetChronoBlacklist() TokenBlacklistWriter {
	return client.chronoBlacklist
}

func (client *blacklistClient) GetSessionBlacklistQuerier() TokenBlacklistQuerier {
	return client.sessionBlacklistQuerier
}

func (client *blacklistClient) GetRefreshBlacklistQuerier() TokenBlacklistQuerier {
	return client.refreshBlacklistQuerier
}
