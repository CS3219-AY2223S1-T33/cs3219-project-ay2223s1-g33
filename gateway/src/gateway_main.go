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

func registerGatewayRoutes(ctx context.Context, config *GatewayConfiguration) (http.Handler, error) {
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

	cookieString, err := getCookieFromServerMetadata(md)
	if err != nil {
		return err
	}

	if cookieString != "" {
		response.Header().Add("Set-Cookie", cookieString)
	}

	return nil
}

func getCookieFromServerMetadata(md runtime.ServerMetadata) (string, error) {
	cookieString := firstMetadataWithName(md, "Set-Cookie")
	return cookieString, nil
}

func firstMetadataWithName(md runtime.ServerMetadata, name string) string {
	values := md.HeaderMD.Get(name)
	if len(values) == 0 {
		return ""
	}
	return values[0]
}
