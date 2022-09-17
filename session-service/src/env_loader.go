package main

import (
	"os"
	"strconv"
)

type SessionServiceConfig struct {
	RedisServer string
	Port        int

	SigningSecret string
}

const (
	envRedisServer   = "REDIS_SERVER"
	envPort          = "SERVER_PORT"
	envSigningSecret = "JWT_SIGNING_SECRET"
)

func loadConfig() *SessionServiceConfig {
	server := loadEnvVariableOrDefaultString(envRedisServer, nil)
	if server == nil {
		return nil
	}

	signingSecret := loadEnvVariableOrDefaultString(envSigningSecret, nil)
	if signingSecret == nil {
		return nil
	}

	port := loadEnvVariableOrDefaultInt(envPort, 4100)

	return &SessionServiceConfig{
		RedisServer:   *server,
		Port:          port,
		SigningSecret: *signingSecret,
	}
}

func loadEnvVariableOrDefaultString(envKey string, defaultValue *string) *string {
	value, found := os.LookupEnv(envKey)
	if !found {
		return defaultValue
	}
	return &value
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
