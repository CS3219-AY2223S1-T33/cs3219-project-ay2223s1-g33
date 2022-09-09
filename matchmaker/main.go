package main

import (
	"log"
)

func main() {
	log.Println("Starting Matchmaker")

	config := loadConfig()
	if config == nil {
		log.Fatal("Matchmaker environment configuration not found")
	}

	redisClient := NewRedisMatchmakerClient(config.RedisServer)
	redisClient.Connect()
	defer redisClient.Close()

	queueBuffer := QueueBuffers{
		EasyQueue:   make(chan *string, config.QueueBufferSize),
		MediumQueue: make(chan *string, config.QueueBufferSize),
		HardQueue:   make(chan *string, config.QueueBufferSize),
	}

	matchWorker := NewMatchWorker(redisClient, &queueBuffer)
	fetchWorker := NewFetchWorker(redisClient, &queueBuffer, config.PollBatchSize, config.SleepInterval)
	go matchWorker.Run()

	fetchWorker.Run()
}
