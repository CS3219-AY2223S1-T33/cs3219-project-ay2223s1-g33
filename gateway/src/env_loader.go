package main

import (
	"os"
	"strconv"
)

type GatewayConfiguration struct {
	UserBFFServer  string
	MatchingServer string
	CollabServer   string
	SessionServer  string
	HistoryServer  string
	StaticServer   string

	Port int
}

const (
	envUserBFFServer  = "USER_BFF_SERVER"
	envMatchingServer = "MATCHING_SERVER"
	envCollabServer   = "COLLAB_SERVER"
	envSessionServer  = "SESSION_SERVER"
	envHistoryServer  = "HISTORY_SERVER"
	envStaticServer   = "STATIC_SERVER"
	envPort           = "GATEWAY_PORT"
)

func loadConfig() *GatewayConfiguration {
	userBFFServer := loadEnvVariableOrDefaultString(envUserBFFServer, "localhost:4000")
	matchingServer := loadEnvVariableOrDefaultString(envMatchingServer, "localhost:4001")
	collabServer := loadEnvVariableOrDefaultString(envCollabServer, "localhost:4003")
	sessionServer := loadEnvVariableOrDefaultString(envSessionServer, "localhost:4100")
	historyServer := loadEnvVariableOrDefaultString(envHistoryServer, "localhost:4005")
	staticServer := loadEnvVariableOrDefaultString(envStaticServer, "localhost:8000")
	port := loadEnvVariableOrDefaultInt(envPort, 5000)

	return &GatewayConfiguration{
		UserBFFServer:  userBFFServer,
		MatchingServer: matchingServer,
		CollabServer:   collabServer,
		SessionServer:  sessionServer,
		HistoryServer:  historyServer,
		StaticServer:   staticServer,
		Port:           port,
	}
}

func loadEnvVariableOrDefaultString(envKey string, defaultValue string) string {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}
	return value
}

func loadEnvVariableOrDefaultInt(envKey string, defaultValue int) int {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}

	intValue, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}

	return intValue
}
