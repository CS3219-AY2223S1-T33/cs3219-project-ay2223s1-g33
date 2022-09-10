package main

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"cs3219-project-ay2223s1-g33/matchmaker/worker"
	"log"
)

func main() {
	log.Println("Starting Matchmaker")

	config := loadConfig()
	if config == nil {
		log.Fatal("Matchmaker environment configuration not found")
	}

	redisClient := conn.NewRedisMatchmakerClient(config.RedisServer)
	redisClient.Connect()
	defer redisClient.Close()

	queueBuffer := common.QueueBuffers{
		EasyQueue:   make(chan *string, config.QueueBufferSize),
		MediumQueue: make(chan *string, config.QueueBufferSize),
		HardQueue:   make(chan *string, config.QueueBufferSize),
	}

	matchWorker := worker.NewMatchWorker(redisClient, &queueBuffer)
	fetchWorker := worker.NewFetchWorker(redisClient, &queueBuffer, config.PollBatchSize, config.SleepInterval)
	go matchWorker.Run()

	fetchWorker.Run()
}
