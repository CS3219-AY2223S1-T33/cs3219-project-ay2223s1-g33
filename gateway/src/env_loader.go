package main

import (
	"os"
)

type GatewayConfiguration struct {
	UserBFFServer  string
	MatchingServer string
	CollabServer   string
}

const (
	envUserBFFServer  = "USER_BFF_SERVER"
	envMatchingServer = "MATCHING_SERVER"
	envCollabServer   = "COLLAB_SERVER"
)

func loadConfig() *GatewayConfiguration {
	userBFFServer := loadEnvVariableOrDefaultString(envUserBFFServer, "localhost:4000")
	matchingServer := loadEnvVariableOrDefaultString(envMatchingServer, "localhost:4001")
	collabServer := loadEnvVariableOrDefaultString(envCollabServer, "localhost:4002")

	return &GatewayConfiguration{
		UserBFFServer:  userBFFServer,
		MatchingServer: matchingServer,
		CollabServer:   collabServer,
	}
}

func loadEnvVariableOrDefaultString(envKey string, defaultValue string) string {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}
	return value
}
