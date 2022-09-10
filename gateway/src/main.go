package main

import (
	"context"
	"flag"
	"net/http"

	"github.com/golang/glog"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	gw "cs3219-project-ay2223s1-g33/gateway/gateway"
)

var (
	// command-line options:
	userBFFServiceEndpoint  = flag.String("user-bff-endpoint", "localhost:4000", "User BFF Service Endpoint")
	matchingServiceEndpoint = flag.String("matching-endpoint", "localhost:4001", "Matching Service Endpoint")
)

func run() error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// Register gRPC server endpoint
	// Note: Make sure the gRPC server is running properly and accessible
	mux := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := gw.RegisterUserBFFServiceHandlerFromEndpoint(ctx, mux, *userBFFServiceEndpoint, opts)
	if err != nil {
		return err
	}

	err = gw.RegisterQueueServiceHandlerFromEndpoint(ctx, mux, *matchingServiceEndpoint, opts)
	if err != nil {
		return err
	}

	// Start HTTP server (and proxy calls to gRPC server endpoint)
	return http.ListenAndServe(":3000", mux)
}

func main() {
	flag.Parse()
	defer glog.Flush()

	if err := run(); err != nil {
		glog.Fatal(err)
	}
}
