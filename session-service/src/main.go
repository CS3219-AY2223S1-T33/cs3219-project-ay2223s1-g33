package main

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"log"
	"time"
)

const SessionTokenLifespan = 15 * time.Minute   // 15 minutes
const RefreshTokenLifespan = 3 * 24 * time.Hour // 3 days

func main() {
	log.Println("Starting Session Service")
	config := loadConfig()
	if config == nil {
		log.Fatalln("Server is not configured correctly")
	}

	redisClient := blacklist.NewRedisBlacklistClient(config.RedisServer, SessionTokenLifespan, RefreshTokenLifespan)
	err := redisClient.Connect()
	if err != nil {
		log.Fatalln("Cannot connect to Redis")
	}

	tokenAgent := getTokenAgent(config, redisClient.GetSessionBlacklist())
	apiServer := server.CreateApiServer(config.Port)
	sessionService := service.CreateSessionService(tokenAgent)
	err = apiServer.RegisterService(sessionService)
	if err != nil {
		log.Fatalln("Could not register Session Service")
	}

	apiServer.Start()
}

func getTokenAgent(config *SessionServiceConfig, redisBlacklist blacklist.RedisBlacklist) token.TokenAgent {
	return token.CreateTokenAgent(config.SessionSecret, SessionTokenLifespan, redisBlacklist)
}
