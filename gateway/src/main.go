package main

import (
	"context"
	"cs3219-project-ay2223s1-g33/gateway/auth"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	log.Printf("Starting GRPC Gateway [V%d.%d.%d]\n", VersionMajor, VersionMinor, VersionRevision)
	config := loadConfig()

	if config == nil {
		log.Fatalln("Gateway not configured")
	}

	log.Printf("Listening on port %d\n", config.Port)

	if err := run(config); err != nil {
		log.Fatalln(err)
	}

	log.Println("GRPC Gateway Death")
}

func run(config *GatewayConfiguration) error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	gatewayMux, err := AttachGatewayMiddleware(ctx, config)
	if err != nil {
		return errors.New("Failed to register gateway routes")
	}

	proxyMux, err := AttachProxyMiddleware(config, gatewayMux)
	if err != nil {
		return errors.New("Failed to register proxy routes")
	}

	authMux, disposeAuth, err := auth.AttachAuthMiddleware(config.SessionServer, proxyMux)
	if err != nil {
		return errors.New("Failed to register authentication layer")
	}
	defer disposeAuth.Dispose()

	staticMux := AttachStaticServe(config.StaticServer)
	prefixRouter := AttachPrefixRouter("/api", authMux, staticMux)

	corsObj := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "http://127.0.0.1:*"},
		AllowCredentials: true,
	})

	corsMux := corsObj.Handler(prefixRouter)

	// Start HTTP server (and proxy calls to gRPC server endpoint)
	return http.ListenAndServe(fmt.Sprintf(":%d", config.Port), corsMux)
}
