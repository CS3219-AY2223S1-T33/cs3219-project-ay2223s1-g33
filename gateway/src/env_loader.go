package main

import (
	"crypto/x509"
	"os"
	"strconv"
	"strings"
)

type GatewayConfiguration struct {
	UserServiceUrl     string
	MatchingServiceUrl string
	CollabServiceUrl   string
	SessionServiceUrl  string
	HistoryServiceUrl  string
	StaticServerUrl    string
	StaticFolderPath   string

	GRPCCertificate *x509.CertPool

	Port int
}

const (
	envUserService     = "USER_SERVICE_URL"
	envMatchingService = "MATCHING_SERVICE_URL"
	envCollabService   = "COLLAB_SERVICE_URL"
	envSessionService  = "SESSION_SERVICE_URL"
	envHistoryService  = "HISTORY_SERVICE_URL"
	envStaticServer    = "STATIC_SERVER"
	envStaticFolder    = "STATIC_FOLDER"
	envGRPCCert        = "GRPC_CERT"
	envPort            = "GATEWAY_PORT"
)

func loadConfig() *GatewayConfiguration {
	userServer := loadEnvVariableOrDefaultString(envUserService, "localhost:4000")
	matchingServer := loadEnvVariableOrDefaultString(envMatchingService, "localhost:4001")
	collabServer := loadEnvVariableOrDefaultString(envCollabService, "localhost:4003")
	sessionServer := loadEnvVariableOrDefaultString(envSessionService, "localhost:4100")
	historyServer := loadEnvVariableOrDefaultString(envHistoryService, "localhost:4005")
	staticServer := loadEnvVariableOrDefaultString(envStaticServer, "")
	staticFolder := loadEnvVariableOrDefaultString(envStaticFolder, "")
	grpcCert := loadEnvVariableOrDefaultString(envGRPCCert, "")
	port := loadEnvVariableOrDefaultInt(envPort, 5000)

	cp := x509.NewCertPool()
	if grpcCert != "" {
		grpcCert = sanitizeQuotesAndBreakline(grpcCert)
		if !cp.AppendCertsFromPEM([]byte(grpcCert)) {
			cp = nil
		}
	}

	return &GatewayConfiguration{
		UserServiceUrl:     userServer,
		MatchingServiceUrl: matchingServer,
		CollabServiceUrl:   collabServer,
		SessionServiceUrl:  sessionServer,
		HistoryServiceUrl:  historyServer,
		StaticServerUrl:    staticServer,
		StaticFolderPath:   staticFolder,
		GRPCCertificate:    cp,
		Port:               port,
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

func sanitizeQuotesAndBreakline(inp string) string {
	return strings.ReplaceAll(strings.Trim(inp, "\"'"), "\\n", "\n")
}
