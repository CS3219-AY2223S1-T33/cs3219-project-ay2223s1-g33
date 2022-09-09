package main

import (
	"log"
	"time"
)

type FetchWorker interface {
	Run()
}

type fetchWorker struct {
	redisClient   RedisMatchmakerClient
	queues        *QueueBuffers
	pollBatchSize int
	sleepDuration time.Duration
	active        bool
}

func NewFetchWorker(redisClient RedisMatchmakerClient, queues *QueueBuffers, pollBatchSize int, sleepInterval int) FetchWorker {
	return &fetchWorker{
		redisClient:   redisClient,
		queues:        queues,
		pollBatchSize: pollBatchSize,
		sleepDuration: time.Duration(int64(sleepInterval) * int64(time.Millisecond)),
		active:        true,
	}
}

func (worker *fetchWorker) Run() {
	log.Println("Starting fetch worker")
	for worker.active {
		inQueue, expired := worker.redisClient.PollQueue(worker.pollBatchSize)
		worker.processInQueue(inQueue)
		worker.processExpired(expired)
		time.Sleep(worker.sleepDuration)
	}

	log.Println("Fetch worker dying")
}

func (worker *fetchWorker) processInQueue(queueItems []*RedisQueueObject) {
	for _, queueItem := range queueItems {
		worker.addToQueue(queueItem)
	}
}

func (worker *fetchWorker) processExpired(expired []*RedisQueueObject) {
	if len(expired) > 0 {
		usernames := make([]string, len(expired))
		for i, expiredItem := range expired {
			usernames[i] = expiredItem.Username
		}
		err := worker.redisClient.UploadFailures(usernames)
		if err != nil {
			log.Println("Failed to remove users from queue")
		}
	}
}

func (worker *fetchWorker) addToQueue(queueItem *RedisQueueObject) {
	switch queueItem.Difficulty {
	case DifficultyEasy:
		worker.queues.EasyQueue <- &queueItem.Username
	case DifficultyMedium:
		worker.queues.MediumQueue <- &queueItem.Username
	case DifficultyHard:
		worker.queues.HardQueue <- &queueItem.Username
	default:
		log.Println("Invalid difficulty value detected in queue")
	}

	log.Printf("Adding [%s] to queue\n", queueItem.Username)
}
