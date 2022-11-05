package main

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"log"
	"time"
)

func main() {
	log.Printf("Starting Session Service [V%d.%d.%d]\n", VersionMajor, VersionMinor, VersionRevision)
	config, err := loadConfig()
	if err != nil || config == nil {
		log.Fatalf("Server is not configured correctly: %s \n", err)
	}

	if config.grpcCertificate == nil {
		log.Println("WARN: GRPC using insecure mode because no cert was provided")
	} else {
		log.Println("GRPC Operating in secure mode")
	}

	log.Printf("Session Token Lifespan: %d minutes\n", config.SessionTokenLifespan/time.Minute)
	log.Printf("Refresh Token Lifespan: %d minutes\n", config.RefreshTokenLifespan/time.Minute)

	redisClient := blacklist.NewRedisBlacklistClient(
		config.RedisServer,
		config.RedisPassword,
		config.SessionTokenLifespan,
		config.RefreshTokenLifespan,
	)

	err = redisClient.Connect()
	if err != nil {
		log.Fatalln("Cannot connect to Redis")
	}

	sessionTokenAgent := token.CreateTokenAgent(
		config.SessionSecret,
		config.SessionTokenLifespan,
		redisClient.GetSessionBlacklist(),
		redisClient.GetSessionBlacklistQuerier(),
	)
	refreshTokenAgent := token.CreateTokenAgent(
		config.RefreshSecret,
		config.RefreshTokenLifespan,
		redisClient.GetRefreshBlacklist(),
		redisClient.GetRefreshBlacklistQuerier(),
	)

	apiServer := server.CreateApiServerWithCreds(config.Port, config.grpcCertificate)
	sessionService := service.CreateSessionService(
		sessionTokenAgent,
		refreshTokenAgent,
		redisClient.GetChronoBlacklist(),
	)
	err = apiServer.RegisterService(sessionService)
	if err != nil {
		log.Fatalln("Could not register Session Service")
	}

	apiServer.Start()
}
