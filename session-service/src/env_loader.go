package main

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type SessionServiceConfig struct {
	RedisServer string
	Port        int

	SessionSecret        string
	RefreshSecret        string
	SessionTokenLifespan time.Duration
	RefreshTokenLifespan time.Duration
}

const (
	envRedisServer     = "REDIS_SERVER"
	envPort            = "SERVER_PORT"
	envSessionSecret   = "SESSION_SIGNING_SECRET"
	envRefreshSecret   = "REFRESH_SIGNING_SECRET"
	envSessionLifespan = "SESSION_LIFESPAN_MINS"
	envRefreshLifespan = "REFRESH_LIFESPAN_MINS"
)

const (
	defaultPort                 = 4100
	defaultSessionTokenLifespan = 15          // 15 minutes
	defaultRefreshTokenLifespan = 3 * 24 * 60 // 3 days
)

func loadConfig() (*SessionServiceConfig, error) {
	server := loadEnvVariableOrDefaultString(envRedisServer, nil)
	if server == nil {
		return nil, errors.New("Redis Server not set")
	}

	sessionSecret := loadEnvVariableOrDefaultString(envSessionSecret, nil)
	if sessionSecret == nil {
		return nil, errors.New("Session Secret not set")
	}

	refreshSecret := loadEnvVariableOrDefaultString(envRefreshSecret, nil)
	if refreshSecret == nil {
		return nil, errors.New("Refresh Secret not set")
	}

	sessionTokenLifespan := loadEnvVariableOrDefaultInt(envSessionLifespan, defaultSessionTokenLifespan)
	refreshTokenLifespan := loadEnvVariableOrDefaultInt(envRefreshLifespan, defaultRefreshTokenLifespan)

	port := loadEnvVariableOrDefaultInt(envPort, 4100)

	return &SessionServiceConfig{
		RedisServer:          *server,
		Port:                 port,
		SessionSecret:        *sessionSecret,
		RefreshSecret:        *refreshSecret,
		SessionTokenLifespan: time.Duration(int64(sessionTokenLifespan) * int64(time.Minute)),
		RefreshTokenLifespan: time.Duration(int64(refreshTokenLifespan) * int64(time.Minute)),
	}, nil
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
