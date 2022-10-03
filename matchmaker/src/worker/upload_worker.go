package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"log"

	"github.com/google/uuid"
)

type UploadWorker interface {
	HandleMatches(input []*common.QueueItemsMatch)
}

type uploadWorker struct {
	redisClient conn.RedisMatchmakerClient
}

func NewUploadWorker(redisClient conn.RedisMatchmakerClient) UploadWorker {
	return &uploadWorker{
		redisClient: redisClient,
	}
}

func (worker *uploadWorker) HandleMatches(input []*common.QueueItemsMatch) {
	if len(input) == 0 {
		return
	}

	streamIdsToDelete := make([]*common.QueueItem, 0, len(input)*2)
	for _, match := range input {
		streamIdsToDelete = append(streamIdsToDelete, match.UserA)
		streamIdsToDelete = append(streamIdsToDelete, match.UserB)
		worker.uploadMatch(match)
	}

	err := worker.redisClient.DeleteQueueItems(streamIdsToDelete)
	if err != nil {
		log.Printf("Failed to delete items from queue: %s", err)
	}
}

func (worker *uploadWorker) uploadMatch(match *common.QueueItemsMatch) {
	if match == nil {
		return
	}

	matchToken := uuid.New().String()
	usernameA := match.UserA.Username
	usernameB := match.UserB.Username

	log.Printf("Matched (%s, %s): %s\n", usernameA, usernameB, matchToken)

	err := worker.redisClient.UploadMatch(usernameA, matchToken, match.Difficulty)
	if err != nil {
		log.Println("Failed to upload match result")
		return
	}

	err = worker.redisClient.UploadMatch(usernameB, matchToken, match.Difficulty)
	if err != nil {
		log.Println("Failed to upload match result")
	}
}
