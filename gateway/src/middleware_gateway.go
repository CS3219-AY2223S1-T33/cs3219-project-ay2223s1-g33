package main

import (
	"context"
	gw "cs3219-project-ay2223s1-g33/gateway/proto"
	"fmt"
	"log"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

func AttachGatewayMiddleware(ctx context.Context, config *GatewayConfiguration) (http.Handler, error) {
	marshalerOpts := runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.HTTPBodyMarshaler{
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
	})

	forwardResponseOpts := runtime.WithForwardResponseOption(gatewayResponseModifier)
	mux := runtime.NewServeMux(marshalerOpts, forwardResponseOpts)

	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	log.Printf("Proxying to User-BFF on %s\n", config.UserBFFServer)
	err := gw.RegisterUserBFFServiceHandlerFromEndpoint(ctx, mux, config.UserBFFServer, opts)
	if err != nil {
		return nil, err
	}

	log.Printf("Proxying to Matching on %s\n", config.MatchingServer)
	err = gw.RegisterQueueServiceHandlerFromEndpoint(ctx, mux, config.MatchingServer, opts)
	if err != nil {
		return nil, err
	}

	return mux, nil
}

func gatewayResponseModifier(ctx context.Context, response http.ResponseWriter, _ proto.Message) error {
	md, ok := runtime.ServerMetadataFromContext(ctx)
	if !ok {
		return fmt.Errorf("Failed to extract ServerMetadata from context")
	}

	mapCookieMetadata(md, response)
	return nil
}

func mapCookieMetadata(md runtime.ServerMetadata, response http.ResponseWriter) {
	values := md.HeaderMD.Get("Set-Cookie")
	if len(values) == 0 {
		return
	}

	md.HeaderMD.Delete("Set-Cookie")
	for _, value := range values {
		response.Header().Add("Set-Cookie", value)
	}
}
