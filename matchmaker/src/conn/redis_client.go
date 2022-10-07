package conn

import (
	"context"
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	redis "github.com/go-redis/redis/v9"
)

//go:generate mockgen -destination=../mocks/mock_redis_client.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/matchmaker/conn RedisMatchmakerClient
type RedisMatchmakerClient interface {
	PollQueue(count int) (expired []*common.QueueItem, result []*common.QueueItem, err error)
	DeleteQueueItems(items []*common.QueueItem) error
	UploadMatch(username string, matchId string, difficulty int) error
	UploadFailures(username []string) error
}

type redisMatchmakerClient struct {
	redisClient   *redis.Client
	queueLifespan time.Duration
}

const (
	queueKey           = "matchmaker-stream"
	usernameKey        = "user"
	difficultyKey      = "diff"
	matchKeyTemplate   = "matchmaker-%s"
	matchValueTemplate = "%d;%s"
)

func NewRedisMatchmakerClient(redisClient *redis.Client, queueLifespan time.Duration) RedisMatchmakerClient {
	return &redisMatchmakerClient{
		redisClient:   redisClient,
		queueLifespan: queueLifespan,
	}
}

func (client *redisMatchmakerClient) PollQueue(count int) (expired []*common.QueueItem, result []*common.QueueItem, err error) {
	ctx := context.Background()

	resultStreams, err := client.redisClient.XRead(ctx, &redis.XReadArgs{
		Streams: []string{queueKey, "0"},
		Count:   int64(count),
		Block:   -1,
	}).Result()

	if err == redis.Nil {
		return nil, nil, nil
	}

	if err != nil {
		return nil, nil, err
	}

	redisTime, err := client.redisClient.Time(ctx).Result()
	if err != nil {
		return nil, nil, err
	}

	messageStream := resultStreams[0].Messages
	expired, inQueue := client.partitionMesssages(ctx, messageStream, redisTime)

	return expired, inQueue, err
}

func (client *redisMatchmakerClient) DeleteQueueItems(items []*common.QueueItem) error {
	ctx := context.Background()

	if len(items) == 0 {
		return nil
	}

	messageIds := make([]string, len(items))
	for i, item := range items {
		messageIds[i] = item.StreamId
	}

	err := client.redisClient.XDel(ctx, queueKey, messageIds...).Err()
	return err
}

func (client *redisMatchmakerClient) UploadMatch(username string, matchId string, difficulty int) error {
	key := fmt.Sprintf(matchKeyTemplate, username)
	ctx := context.Background()

	value := fmt.Sprintf(matchValueTemplate, difficulty, matchId)
	err := client.redisClient.Set(ctx, key, value, client.queueLifespan).Err()
	return err
}

func (client *redisMatchmakerClient) UploadFailures(usernames []string) error {
	if len(usernames) == 0 {
		return nil
	}

	keys := make([]string, len(usernames))
	ctx := context.Background()

	for i, username := range usernames {
		keys[i] = fmt.Sprintf(matchKeyTemplate, username)
	}
	err := client.redisClient.Del(ctx, keys...).Err()
	return err
}

func (client *redisMatchmakerClient) partitionMesssages(ctx context.Context, messageStream []redis.XMessage, timeNow time.Time) (
	expired []*common.QueueItem,
	newInQueue []*common.QueueItem) {

	messageCount := len(messageStream)
	expiredArray := make([]*common.QueueItem, 0, messageCount)
	validArray := make([]*common.QueueItem, 0, messageCount)

	i := 0
	for ; i < messageCount; i++ {
		message := messageStream[i]
		timestamp := getTimestampFromMessageId(&message.ID)
		if timestamp == nil {
			continue
		}

		if timeNow.Sub(*timestamp) < client.queueLifespan {
			break
		}

		queueObject := buildQueueItem(&message)
		if queueObject == nil {
			continue
		}

		expiredArray = append(expiredArray, queueObject)
	}

	for ; i < messageCount; i++ {
		message := messageStream[i]
		queueObject := buildQueueItem(&message)
		if queueObject == nil {
			continue
		}

		validArray = append(validArray, queueObject)
	}

	return expiredArray, validArray
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

func buildQueueItem(message *redis.XMessage) *common.QueueItem {
	username, ok := message.Values[usernameKey]
	if !ok {
		return nil
	}

	stringDifficulties, ok := message.Values[difficultyKey]
	if !ok {
		return nil
	}

	stringUsername, ok := username.(string)
	if !ok {
		return nil
	}

	jsonDifficulties, ok := stringDifficulties.(string)
	if !ok {
		return nil
	}

	difficulties := make([]int, 0)
	err := json.Unmarshal([]byte(jsonDifficulties), &difficulties)
	if err != nil {
		return nil
	}

	return &common.QueueItem{
		StreamId:     message.ID,
		Username:     stringUsername,
		Difficulties: difficulties,
	}
}
