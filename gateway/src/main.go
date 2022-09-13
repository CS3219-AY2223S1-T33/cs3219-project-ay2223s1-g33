package main

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	log.Println("Starting GRPC Gateway")
	config := loadConfig()

	if err := run(config); err != nil {
		log.Fatal(err)
	}
	log.Println("GRPC Gateway Death")
}

func run(config *GatewayConfiguration) error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	gatewayMux, err := registerGatewayRoutes(ctx, config)
	if err != nil {
		return errors.New("Failed to register gateway routes")
	}

	proxyMux, err := registerProxyRoutes(ctx, config, gatewayMux)
	if err != nil {
		return errors.New("Failed to register proxy routes")
	}

	corsMux := cors.Default().Handler(proxyMux)

	// Start HTTP server (and proxy calls to gRPC server endpoint)
	return http.ListenAndServe(":5000", corsMux)
}
