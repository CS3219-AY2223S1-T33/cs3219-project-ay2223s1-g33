package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"log"
	"time"
)

type FetchWorker interface {
	PipeTo(FetchResultHandler)
	Run()
}

type sleepAdapter interface {
	Sleep(duration time.Duration)
}

//go:generate mockgen -destination=../mocks/mock_fetch_result_handler.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/matchmaker/worker FetchResultHandler
type FetchResultHandler interface {
	HandleQueueItems([]*common.QueueItem)
}

type fetchWorker struct {
	redisClient   conn.RedisMatchmakerClient
	outputHandler FetchResultHandler
	pollBatchSize int
	sleepDuration time.Duration
	active        bool
}

func NewFetchWorker(
	redisClient conn.RedisMatchmakerClient,
	pollBatchSize int,
	sleepInterval int,
) FetchWorker {
	return &fetchWorker{
		redisClient:   redisClient,
		pollBatchSize: pollBatchSize,
		sleepDuration: time.Duration(int64(sleepInterval) * int64(time.Millisecond)),
		active:        true,
	}
}

func (worker *fetchWorker) PipeTo(handler FetchResultHandler) {
	worker.outputHandler = handler
}

func (worker *fetchWorker) Run() {
	log.Println("Starting fetch worker")
	for worker.active {
		expired, inQueue, err := worker.redisClient.PollQueue(worker.pollBatchSize)
		if err != nil {
			log.Printf("Error Polling Redis: %s\n", err)
		}
		worker.processExpired(expired)
		worker.processInQueue(inQueue)
		time.Sleep(worker.sleepDuration)
	}

	log.Println("Fetch worker dying")
}

func (worker *fetchWorker) processInQueue(queueItems []*common.QueueItem) {
	if worker.outputHandler == nil {
		return
	}

	if queueItems == nil {
		return
	}

	worker.outputHandler.HandleQueueItems(queueItems)
}

func (worker *fetchWorker) processExpired(queueItems []*common.QueueItem) {
	err := worker.redisClient.DeleteQueueItems(queueItems)
	if err != nil {
		log.Printf("Failed to clear expired items: %s\n", err)
	}

	usernames := make([]string, len(queueItems))
	for i, item := range queueItems {
		usernames[i] = item.Username
	}

	err = worker.redisClient.UploadFailures(usernames)
	if err != nil {
		log.Printf("Failed to upload failures for expired items: %s\n", err)
	}
}
