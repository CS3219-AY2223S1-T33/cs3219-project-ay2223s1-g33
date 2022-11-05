package main

import (
	"crypto/tls"
	"errors"
	"os"
	"strconv"
	"strings"
	"time"
)

type SessionServiceConfig struct {
	RedisServer   string
	RedisPassword string
	Port          int

	SessionSecret        string
	RefreshSecret        string
	SessionTokenLifespan time.Duration
	RefreshTokenLifespan time.Duration

	grpcCertificate *tls.Certificate
}

const (
	envRedisServer     = "REDIS_SERVER"
	envRedisPassword   = "REDIS_PASSWORD"
	envPort            = "SERVER_PORT"
	envSessionSecret   = "SESSION_SIGNING_SECRET"
	envRefreshSecret   = "REFRESH_SIGNING_SECRET"
	envSessionLifespan = "SESSION_LIFESPAN_MINS"
	envRefreshLifespan = "REFRESH_LIFESPAN_MINS"

	envGRPCCert = "GRPC_CERT"
	envGRPCKey  = "GRPC_KEY"
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

	defaultEmptyString := ""
	redisPassword := loadEnvVariableOrDefaultString(envRedisPassword, &defaultEmptyString)
	sessionTokenLifespan := loadEnvVariableOrDefaultInt(envSessionLifespan, defaultSessionTokenLifespan)
	refreshTokenLifespan := loadEnvVariableOrDefaultInt(envRefreshLifespan, defaultRefreshTokenLifespan)
	port := loadEnvVariableOrDefaultInt(envPort, 4100)

	grpcCert := loadEnvVariableOrDefaultString(envGRPCCert, &defaultEmptyString)
	grpcKey := loadEnvVariableOrDefaultString(envGRPCKey, &defaultEmptyString)
	var certPtr *tls.Certificate = nil
	if *grpcCert != "" && *grpcKey != "" {
		cert, err := tls.X509KeyPair(
			[]byte(sanitizeQuotesAndBreakline(*grpcCert)),
			[]byte(sanitizeQuotesAndBreakline(*grpcKey)),
		)
		if err == nil {
			certPtr = &cert
		}
	}

	return &SessionServiceConfig{
		RedisServer:          *server,
		RedisPassword:        *redisPassword,
		Port:                 port,
		SessionSecret:        *sessionSecret,
		RefreshSecret:        *refreshSecret,
		SessionTokenLifespan: time.Duration(int64(sessionTokenLifespan) * int64(time.Minute)),
		RefreshTokenLifespan: time.Duration(int64(refreshTokenLifespan) * int64(time.Minute)),
		grpcCertificate:      certPtr,
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

func sanitizeQuotesAndBreakline(inp string) string {
	return strings.ReplaceAll(strings.Trim(inp, "\"'"), "\\n", "\n")
}
