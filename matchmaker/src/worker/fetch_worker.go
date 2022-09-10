package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"log"
	"time"
)

type FetchWorker interface {
	Run()
}

type sleepAdapter interface {
	Sleep(duration time.Duration)
}

type fetchWorker struct {
	redisClient   conn.RedisMatchmakerClient
	queues        *common.QueueBuffers
	pollBatchSize int
	sleepDuration time.Duration
	sleepAdapter  func(duration time.Duration)
	active        bool
}

func NewFetchWorker(
	redisClient conn.RedisMatchmakerClient,
	queues *common.QueueBuffers,
	pollBatchSize int,
	sleepInterval int,
) FetchWorker {
	return &fetchWorker{
		redisClient:   redisClient,
		queues:        queues,
		pollBatchSize: pollBatchSize,
		sleepDuration: time.Duration(int64(sleepInterval) * int64(time.Millisecond)),
		sleepAdapter:  func(duration time.Duration) { time.Sleep(duration) },
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

func (worker *fetchWorker) processInQueue(queueItems []*common.QueueItem) {
	for _, queueItem := range queueItems {
		worker.addToQueue(queueItem)
	}
}

func (worker *fetchWorker) processExpired(expired []*common.QueueItem) {
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

func (worker *fetchWorker) addToQueue(queueItem *common.QueueItem) {
	switch queueItem.Difficulty {
	case common.DifficultyEasy:
		worker.queues.EasyQueue <- &queueItem.Username
	case common.DifficultyMedium:
		worker.queues.MediumQueue <- &queueItem.Username
	case common.DifficultyHard:
		worker.queues.HardQueue <- &queueItem.Username
	default:
		log.Println("Invalid difficulty value detected in queue")
	}

	log.Printf("Adding [%s] to queue\n", queueItem.Username)
}
