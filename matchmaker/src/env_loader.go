package main

import (
	"os"
	"strconv"
	"time"
)

type MatchmakerConfiguration struct {
	RedisServer          string
	RedisPassword        string
	PollBatchSize        int
	SleepInterval        int
	QueueBufferSize      int
	QueueMessageLifespan time.Duration
}

const (
	envRedisServer   = "REDIS_SERVER"
	envRedisPassword = "REDIS_PASSWORD"
	envPollBatchSize = "REDIS_POLL_BATCH_SIZE"
	envSleepInterval = "SLEEP_INTERVAL"
	envQueueLifespan = "QUEUE_LIFESPAN_MILLIS"
)

func loadConfig() *MatchmakerConfiguration {
	server := loadEnvVariableOrDefaultString(envRedisServer, nil)
	if server == nil {
		return nil
	}

	defaultRedisPassword := ""
	redisPassword := loadEnvVariableOrDefaultString(envRedisPassword, &defaultRedisPassword)
	pollBatchSize := loadEnvVariableOrDefaultInt(envPollBatchSize, 20)
	sleepInterval := loadEnvVariableOrDefaultInt(envSleepInterval, 100)
	queueMessageLifeMilliseconds := loadEnvVariableOrDefaultInt(envQueueLifespan, 30000)

	return &MatchmakerConfiguration{
		RedisServer:          *server,
		RedisPassword:        *redisPassword,
		PollBatchSize:        pollBatchSize,
		SleepInterval:        sleepInterval,
		QueueMessageLifespan: time.Duration(int64(queueMessageLifeMilliseconds) * int64(time.Millisecond)),
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
