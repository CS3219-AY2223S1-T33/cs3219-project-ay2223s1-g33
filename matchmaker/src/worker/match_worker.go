package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"log"

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
	redisClient conn.RedisMatchmakerClient
	queues      *common.QueueBuffers
	active      bool
}

func NewMatchWorker(
	redisClient conn.RedisMatchmakerClient,
	queues *common.QueueBuffers,
) MatchWorker {
	return &matchWorker{
		redisClient: redisClient,
		queues:      queues,
		active:      true,
	}
}

func (worker *matchWorker) Run() {
	var easyBuffer, medBuffer, hardBuffer *string

	log.Println("Starting match worker")
	for worker.active {
		var match *MatchmakerMatch
		select {
		case queuer := <-worker.queues.EasyQueue:
			easyBuffer, match = worker.matchmake(easyBuffer, queuer)
		case queuer := <-worker.queues.MediumQueue:
			hardBuffer, match = worker.matchmake(medBuffer, queuer)
		case queuer := <-worker.queues.HardQueue:
			hardBuffer, match = worker.matchmake(hardBuffer, queuer)
		}

		if match != nil {
			go worker.uploadMatch(match)
		}
	}
	log.Println("Match worker dying")
}

func (worker *matchWorker) matchmake(buffer *string, incoming *string) (*string, *MatchmakerMatch) {
	if buffer == nil {
		return incoming, nil
	}

	matchId := uuid.New().String()
	return nil, &MatchmakerMatch{
		userA: buffer,
		userB: incoming,
		token: &matchId,
	}
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
