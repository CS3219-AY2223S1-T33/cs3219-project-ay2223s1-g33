package conn

import (
	"context"
	"log"
	"time"

	redis "github.com/go-redis/redis/v9"
	"github.com/google/uuid"
)

type HeartbeatClient interface {
	Run()
	RegisterEntrypoint(entry func())
}

type heartbeatClient struct {
	redisClient   *redis.Client
	entryFunction func()

	isRunning    bool
	instanceUuid string
}

const (
	matchmakerLockKey          = "matchmaker-worker-lock"
	matchmakerLockPollInterval = 5 * time.Second
)

func NewHeartbeatClient(redisClient *redis.Client) HeartbeatClient {
	return &heartbeatClient{
		redisClient:  redisClient,
		instanceUuid: uuid.New().String(),
	}
}

func (client *heartbeatClient) RegisterEntrypoint(entry func()) {
	client.entryFunction = entry
}

func (client *heartbeatClient) Run() {
	client.acquireLock()
	log.Println("Matchmaker lock acquired")
	client.isRunning = true

	go client.runLockRefresh()
	defer func() {
		log.Println("Matchmaker death")
		client.isRunning = false
	}()

	if client.entryFunction == nil {
		return
	}
	client.entryFunction()
}

func (client *heartbeatClient) acquireLock() {
	for {
		ctx := context.Background()
		result, err := client.redisClient.
			SetNX(ctx, matchmakerLockKey, client.instanceUuid, matchmakerLockPollInterval*2).Result()
		if err != nil {
			log.Println("Error while trying to acquire lock")
		}

		if result {
			break
		}

		time.Sleep(matchmakerLockPollInterval)
	}
}

func (client *heartbeatClient) runLockRefresh() {
	log.Println("Starting heartbeat worker")
	for client.isRunning {
		ctx := context.Background()
		_, err := client.redisClient.
			Set(ctx, matchmakerLockKey, client.instanceUuid, matchmakerLockPollInterval*2).Result()
		if err != nil {
			log.Println("Error while trying to refresh lock")
		}

		time.Sleep(matchmakerLockPollInterval)
	}
	log.Println("Heartbeat worker death")
}
