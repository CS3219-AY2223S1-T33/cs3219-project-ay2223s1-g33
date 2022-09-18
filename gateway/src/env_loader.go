package main

import (
	"os"
)

type GatewayConfiguration struct {
	UserBFFServer  string
	MatchingServer string
	CollabServer   string
	SessionServer  string
	StaticServer   string
}

const (
	envUserBFFServer  = "USER_BFF_SERVER"
	envMatchingServer = "MATCHING_SERVER"
	envCollabServer   = "COLLAB_SERVER"
	envSessionServer  = "SESSION_SERVER"
	envStaticServer   = "STATIC_SERVER"
)

func loadConfig() *GatewayConfiguration {
	userBFFServer := loadEnvVariableOrDefaultString(envUserBFFServer, "localhost:4000")
	matchingServer := loadEnvVariableOrDefaultString(envMatchingServer, "localhost:4001")
	collabServer := loadEnvVariableOrDefaultString(envCollabServer, "localhost:4002")
	sessionServer := loadEnvVariableOrDefaultString(envSessionServer, "localhost:4100")
	staticServer := loadEnvVariableOrDefaultString(envStaticServer, "localhost:8000")

	return &GatewayConfiguration{
		UserBFFServer:  userBFFServer,
		MatchingServer: matchingServer,
		CollabServer:   collabServer,
		SessionServer:  sessionServer,
		StaticServer:   staticServer,
	}
}

func loadEnvVariableOrDefaultString(envKey string, defaultValue string) string {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}
	return value
}
