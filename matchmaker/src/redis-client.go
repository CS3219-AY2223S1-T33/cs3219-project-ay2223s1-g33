package main

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	redis "github.com/go-redis/redis/v9"
)

type RedisMatchmakerClient interface {
	Connect()
	Close()
	PollQueue(count int) (result []*RedisQueueObject, expired []*RedisQueueObject)
	UploadMatch(username string, matchId string) error
	UploadFailures(username []string) error
}

type redisMatchmakerClient struct {
	server      string
	redisClient *redis.Client
}

const queueKey = "matchmaker-stream"
const usernameKey = "user"
const difficultyKey = "diff"
const queueMessageLifespan = 30 * time.Second
const matchKeyTemplate = "matchmaker-%s"

func NewRedisMatchmakerClient(server string) RedisMatchmakerClient {
	return &redisMatchmakerClient{
		server: server,
	}
}

func (client *redisMatchmakerClient) Connect() {
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

func (client *redisMatchmakerClient) Close() {
	client.redisClient.Close()
}

func (client *redisMatchmakerClient) PollQueue(count int) (result []*RedisQueueObject, expired []*RedisQueueObject) {
	ctx := context.Background()

	resultStreams, err := client.redisClient.XRead(ctx, &redis.XReadArgs{
		Streams: []string{queueKey, "0"},
		Count:   int64(count),
		Block:   -1,
	}).Result()

	if err == redis.Nil {
		return nil, nil
	}

	if err != nil {
		log.Print(err)
		return nil, nil
	}

	messageStream := resultStreams[0].Messages
	messagesToDelete, expired, inQueue := client.partitionMesssages(ctx, messageStream)

	err = client.redisClient.XDel(ctx, queueKey, messagesToDelete...).Err()
	if err != nil {
		return nil, nil
	}

	return inQueue, expired
}

func (client *redisMatchmakerClient) UploadMatch(username string, matchId string) error {
	key := fmt.Sprintf(matchKeyTemplate, username)
	ctx := context.Background()

	err := client.redisClient.Set(ctx, key, matchId, queueMessageLifespan).Err()
	return err
}

func (client *redisMatchmakerClient) UploadFailures(usernames []string) error {
	keys := make([]string, len(usernames))

	for i, username := range usernames {
		keys[i] = fmt.Sprintf(matchKeyTemplate, username)
	}
	ctx := context.Background()

	err := client.redisClient.Del(ctx, keys...).Err()
	return err
}

func (client *redisMatchmakerClient) partitionMesssages(ctx context.Context, messageStream []redis.XMessage) (
	idsToDelete []string,
	expired []*RedisQueueObject,
	newInQueue []*RedisQueueObject) {

	redisTime, err := client.redisClient.Time(ctx).Result()
	if err != nil {
		return nil, nil, nil
	}

	messageCount := len(messageStream)
	deleteIds := make([]string, messageCount)
	expiredArray := make([]*RedisQueueObject, 0, messageCount)
	validArray := make([]*RedisQueueObject, 0, messageCount)

	i := 0
	for ; i < messageCount; i++ {
		message := messageStream[i]
		timestamp := getTimestampFromMessageId(&message.ID)
		if timestamp == nil {
			continue
		}

		if redisTime.Sub(*timestamp) < queueMessageLifespan {
			break
		}

		deleteIds[i] = message.ID
		queueObject := buildRedisQueueObject(&message)
		if queueObject == nil {
			continue
		}

		expiredArray = append(expiredArray, queueObject)
	}

	for ; i < messageCount; i++ {
		message := messageStream[i]
		deleteIds[i] = message.ID
		queueObject := buildRedisQueueObject(&message)
		if queueObject == nil {
			continue
		}

		validArray = append(validArray, queueObject)
	}

	return deleteIds, expiredArray, validArray
}

func getTimestampFromMessageId(id *string) *time.Time {
	timestamp := strings.Split(*id, "-")[0]
	timestampInt, err := strconv.Atoi(timestamp)
	if err != nil {
		return nil
	}

	messageTime := time.UnixMilli(int64(timestampInt))
	return &messageTime
}

func buildRedisQueueObject(message *redis.XMessage) *RedisQueueObject {
	username, ok := message.Values[usernameKey]
	if !ok {
		return nil
	}

	difficulty, ok := message.Values[difficultyKey]
	if !ok {
		return nil
	}

	stringUsername, ok := username.(string)
	if !ok {
		return nil
	}

	stringDifficulty, ok := difficulty.(string)
	if !ok {
		return nil
	}

	intDifficulty, err := strconv.Atoi(stringDifficulty)
	if err != nil {
		return nil
	}

	return &RedisQueueObject{
		Username:   stringUsername,
		Difficulty: intDifficulty,
	}
}
