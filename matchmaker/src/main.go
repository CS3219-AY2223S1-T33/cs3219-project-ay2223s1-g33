package main

import (
	"cs3219-project-ay2223s1-g33/matchmaker/conn"
	"cs3219-project-ay2223s1-g33/matchmaker/worker"
	"log"

	redis "github.com/go-redis/redis/v9"
)

func main() {
	log.Printf("Starting Matchmaker [V%d.%d.%d]\n", VERSION_MAJOR, VERSION_MINOR, VERSION_REVISION)

	config := loadConfig()
	if config == nil {
		log.Fatal("Matchmaker environment configuration not found")
	}

	connOptions := &redis.Options{
		Addr:     config.RedisServer,
		Password: config.RedisPassword,
		DB:       0,
	}
	redisClient := redis.NewClient(connOptions)
	defer redisClient.Close()

	heartbeatClient := conn.NewHeartbeatClient(redisClient)

	redisMatchmakerClient := conn.NewRedisMatchmakerClient(redisClient, config.QueueMessageLifespan)
	fetchWorker := worker.NewFetchWorker(redisMatchmakerClient, config.PollBatchSize, config.SleepInterval)
	matchWorker := worker.NewMatchWorker()
	uploadWorker := worker.NewUploadWorker(redisMatchmakerClient)

	fetchWorker.PipeTo(matchWorker)
	matchWorker.PipeTo(uploadWorker)

	heartbeatClient.RegisterEntrypoint(func() {
		log.Println("Matchmaker acquired control")
		fetchWorker.Run()
	})
	heartbeatClient.Run()
	log.Println("Matchmaker Death")
}
