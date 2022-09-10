package worker

import (
	"context"
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"log"
	"time"

	"github.com/google/uuid"
)

type MatchmakerMatch struct {
	userA *string
	userB *string
	token *string
}

type MatchWorker interface {
	Run()
}

type matchWorker struct {
	redisClient          conn.RedisMatchmakerClient
	queues               *common.QueueBuffers
	queueMessageLifespan time.Duration
	active               bool
}

type bufferObject struct {
	expiryTime time.Time
	user       *string
}

func NewMatchWorker(
	redisClient conn.RedisMatchmakerClient,
	queues *common.QueueBuffers,
	queueMessageLifespan time.Duration,
) MatchWorker {
	return &matchWorker{
		redisClient:          redisClient,
		queues:               queues,
		queueMessageLifespan: queueMessageLifespan,
		active:               true,
	}
}

func (worker *matchWorker) Run() {
	log.Println("Starting match worker")

	executor := worker.createMatchingContext()
	for worker.active {
		match := executor()

		if match != nil {
			go worker.uploadMatch(match)
		}
	}
	log.Println("Match worker dying")
}

func (worker *matchWorker) createMatchingContext() (executor func() *MatchmakerMatch) {
	var easyBuffer, medBuffer, hardBuffer *bufferObject

	return func() *MatchmakerMatch {
		// Decay buffers
		easyBuffer, medBuffer, hardBuffer = worker.decayBuffers(easyBuffer, medBuffer, hardBuffer)

		var match *MatchmakerMatch
		ctx, cancel := context.WithTimeout(context.Background(), time.Millisecond*500)
		defer cancel()

		select {
		case queuer := <-worker.queues.EasyQueue:
			easyBuffer, match = worker.matchmake(easyBuffer, queuer)
		case queuer := <-worker.queues.MediumQueue:
			medBuffer, match = worker.matchmake(medBuffer, queuer)
		case queuer := <-worker.queues.HardQueue:
			hardBuffer, match = worker.matchmake(hardBuffer, queuer)
		case <-ctx.Done():
		}
		return match
	}
}

func (worker *matchWorker) matchmake(buffer *bufferObject, incoming *string) (*bufferObject, *MatchmakerMatch) {
	if buffer == nil {
		expiryTime := time.Now().Add(worker.queueMessageLifespan)
		return &bufferObject{
			expiryTime: expiryTime,
			user:       incoming,
		}, nil
	}

	matchId := uuid.New().String()
	return nil, &MatchmakerMatch{
		userA: buffer.user,
		userB: incoming,
		token: &matchId,
	}
}

func (worker *matchWorker) decayBuffers(easyBuffer, medBuffer, hardBuffer *bufferObject) (*bufferObject, *bufferObject, *bufferObject) {
	now := time.Now()

	easyBuffer = worker.decayBuffer(easyBuffer, now)
	medBuffer = worker.decayBuffer(medBuffer, now)
	hardBuffer = worker.decayBuffer(hardBuffer, now)

	return easyBuffer, medBuffer, hardBuffer
}

func (worker *matchWorker) decayBuffer(buffer *bufferObject, now time.Time) *bufferObject {
	if buffer != nil {
		if buffer.expiryTime.Before(now) {
			return nil
		}
	}
	return buffer
}

func (worker *matchWorker) uploadMatch(match *MatchmakerMatch) {
	if match == nil {
		return
	}

	log.Printf("Uploading match for (%s, %s)\n", *match.userA, *match.userB)

	err := worker.redisClient.UploadMatch(*match.userA, *match.token)
	if err != nil {
		log.Println("Failed to upload match result")
		return
	}

	err = worker.redisClient.UploadMatch(*match.userB, *match.token)
	if err != nil {
		log.Println("Failed to upload match result")
	}
}
