package main

import (
	"os"
	"strconv"
	"time"
)

type MatchmakerConfiguration struct {
	RedisServer          string
	PollBatchSize        int
	SleepInterval        int
	QueueBufferSize      int
	QueueMessageLifespan time.Duration
}

const (
	envRedisServer   = "REDIS_SERVER"
	envPollBatchSize = "REDIS_POLL_BATCH_SIZE"
	envSleepInterval = "SLEEP_INTERVAL"
	envQueueLifespan = "QUEUE_LIFESPAN_MILLIS"
)

func loadConfig() *MatchmakerConfiguration {
	server := loadEnvVariableOrDefaultString(envRedisServer, nil)
	if server == nil {
		return nil
	}

	pollBatchSize := loadEnvVariableOrDefaultInt(envPollBatchSize, 20)
	sleepInterval := loadEnvVariableOrDefaultInt(envSleepInterval, 100)
	queueMessageLifeMilliseconds := loadEnvVariableOrDefaultInt(envQueueLifespan, 30000)

	return &MatchmakerConfiguration{
		RedisServer:          *server,
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
