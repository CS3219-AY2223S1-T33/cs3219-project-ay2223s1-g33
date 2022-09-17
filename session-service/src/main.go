package main

import (
	"cs3219-project-ay2223s1-g33/session-service/conn"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"log"
	"time"
)

const TokenLifespan = 3 * 24 * time.Hour // 3 days

func main() {
	log.Println("Starting Session Service")
	config := loadConfig()
	if config == nil {
		log.Fatalln("Server is not configured correctly")
	}

	redisClient := conn.NewRedisBlacklistClient(config.RedisServer, TokenLifespan)
	redisClient.Connect()
	tokenAgent := getTokenAgent(config, redisClient)

	apiServer := server.CreateApiServer(config.Port)
	sessionService := service.CreateSessionService(tokenAgent)
	err := apiServer.RegisterService(sessionService)
	if err != nil {
		log.Fatalln("Could not register Session Service")
	}

	apiServer.Start()
}

func getTokenAgent(config *SessionServiceConfig, redisBlacklist conn.RedisBlacklistClient) token.TokenAgent {
	return token.CreateTokenAgent(config.SigningSecret, TokenLifespan, redisBlacklist)
}
