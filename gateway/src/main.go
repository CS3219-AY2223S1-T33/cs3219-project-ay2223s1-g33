package main

import (
	"cs3219-project-ay2223s1-g33/gateway/auth"
	"cs3219-project-ay2223s1-g33/gateway/grpc_adapter"
	"cs3219-project-ay2223s1-g33/gateway/prefix_router"
	"cs3219-project-ay2223s1-g33/gateway/static"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"cs3219-project-ay2223s1-g33/gateway/wsproxy"
	"errors"
	"fmt"
	"log"
	"net/http"
)

type pipelineHandler struct {
	pipe util.PipeInput
}

func main() {
	log.Printf("Starting GRPC Gateway [V%d.%d.%d]\n", util.VersionMajor, util.VersionMinor, util.VersionRevision)
	config := loadConfig()

	if config == nil {
		log.Fatalln("Gateway not configured")
	}

	log.Printf("Gateway Listening on port %d\n", config.Port)
	if err := run(config); err != nil {
		log.Fatalln(err)
	}

	log.Println("GRPC Gateway Death")
}

func run(config *GatewayConfiguration) error {
	staticServeHandler := resolveStaticHandler(config)
	proxyMiddleware := wsproxy.NewWSProxyMiddleware(config.CollabServiceUrl)

	grpcMiddleware := grpc_adapter.NewGRPCMiddleware(
		config.UserServiceUrl,
		config.MatchingServiceUrl,
		config.HistoryServiceUrl,
	)
	if grpcMiddleware == nil {
		return errors.New("Failed to register gateway routes")
	}
	defer grpcMiddleware.Dispose()

	authMiddleware := auth.NewAuthMiddleware(config.SessionServiceUrl)
	if authMiddleware == nil {
		return errors.New("Failed to register authentication layer")
	}
	defer authMiddleware.Dispose()

	prefixRouter := prefix_router.NewPrefixRouter("/api", authMiddleware, staticServeHandler)
	authMiddleware.PipeTo(proxyMiddleware)
	proxyMiddleware.PipeTo(grpcMiddleware)

	handler := buildPipelineHandler(prefixRouter)
	// Start HTTP server (and proxy calls to gRPC server endpoint)
	return http.ListenAndServe(fmt.Sprintf(":%d", config.Port), handler)
}

func resolveStaticHandler(config *GatewayConfiguration) util.PipeInput {
	if config.StaticServerUrl != "" {
		return static.NewStaticContentProxy(config.StaticServerUrl)
	} else if config.StaticFolderPath != "" {
		return static.NewStaticContentServer(config.StaticFolderPath)
	} else {
		return static.NewStaticContentMissingEndpoint()
	}
}

func buildPipelineHandler(input util.PipeInput) http.Handler {
	return &pipelineHandler{
		pipe: input,
	}
}

func (handler *pipelineHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	err := handler.pipe.Receive(&util.HTTPContext{
		Request:  req,
		Response: resp,
	})
	if err != nil {
		log.Println(err)
		resp.WriteHeader(500)
		resp.Write([]byte("Internal Server Error"))
	}
}
