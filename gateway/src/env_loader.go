package main

import (
	"os"
)

type GatewayConfiguration struct {
	UserBFFServer  string
	MatchingServer string
}

const (
	envUserBFFServer  = "USER_BFF_SERVER"
	envMatchingServer = "MATCHING_SERVER"
)

func loadConfig() *GatewayConfiguration {
	userBFFServer := loadEnvVariableOrDefaultString(envUserBFFServer, "localhost:4000")
	matchingServer := loadEnvVariableOrDefaultString(envMatchingServer, "localhost:4001")

	return &GatewayConfiguration{
		UserBFFServer:  userBFFServer,
		MatchingServer: matchingServer,
	}
}

func loadEnvVariableOrDefaultString(envKey string, defaultValue string) string {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}
	return value
}
