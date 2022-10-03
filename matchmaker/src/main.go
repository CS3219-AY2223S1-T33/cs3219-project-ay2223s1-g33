package main

import (
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"cs3219-project-ay2223s1-g33/matchmaker/worker"
	"log"
)

func main() {
	log.Printf("Starting Matchmaker [V%d.%d.%d]\n", VERSION_MAJOR, VERSION_MINOR, VERSION_REVISION)

	config := loadConfig()
	if config == nil {
		log.Fatal("Matchmaker environment configuration not found")
	}

	redisClient := conn.NewRedisMatchmakerClient(config.RedisServer, config.QueueMessageLifespan)
	redisClient.Connect()
	defer redisClient.Close()

	fetchWorker := worker.NewFetchWorker(redisClient, config.PollBatchSize, config.SleepInterval)
	matchWorker := worker.NewMatchWorker()
	uploadWorker := worker.NewUploadWorker(redisClient)

	fetchWorker.PipeTo(matchWorker)
	matchWorker.PipeTo(uploadWorker)

	fetchWorker.Run()
	log.Println("Matchmaker Death")
}
