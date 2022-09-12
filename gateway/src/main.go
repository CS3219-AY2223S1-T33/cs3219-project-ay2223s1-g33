package main

import (
	"context"
	"log"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"

	gw "cs3219-project-ay2223s1-g33/gateway/gateway"
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

	mux := runtime.NewServeMux(runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.HTTPBodyMarshaler{
		Marshaler: &runtime.JSONPb{
			MarshalOptions: protojson.MarshalOptions{
				Multiline:       true,
				UseEnumNumbers:  true,
				EmitUnpopulated: true,
			},
			UnmarshalOptions: protojson.UnmarshalOptions{
				DiscardUnknown: true,
			},
		},
	}))

	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	log.Printf("Proxying to User-BFF on %s\n", config.UserBFFServer)
	err := gw.RegisterUserBFFServiceHandlerFromEndpoint(ctx, mux, config.UserBFFServer, opts)
	if err != nil {
		return err
	}

	log.Printf("Proxying to Matching on %s\n", config.MatchingServer)
	err = gw.RegisterQueueServiceHandlerFromEndpoint(ctx, mux, config.MatchingServer, opts)
	if err != nil {
		return err
	}

	// Start HTTP server (and proxy calls to gRPC server endpoint)
	return http.ListenAndServe(":5000", mux)
}
