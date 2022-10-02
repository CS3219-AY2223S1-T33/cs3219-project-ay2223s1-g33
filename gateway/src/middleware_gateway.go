package main

import (
	"context"
	gw "cs3219-project-ay2223s1-g33/gateway/proto"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
)

func AttachGatewayMiddleware(ctx context.Context, config *GatewayConfiguration) (http.Handler, error) {
	marshaller := &runtime.JSONPb{
		MarshalOptions: protojson.MarshalOptions{
			Multiline:       true,
			UseEnumNumbers:  true,
			EmitUnpopulated: true,
		},
		UnmarshalOptions: protojson.UnmarshalOptions{
			DiscardUnknown: true,
		},
	}

	marshalerOpts := runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.HTTPBodyMarshaler{
		Marshaler: marshaller,
	})

	incomingHeaderOpts := runtime.WithIncomingHeaderMatcher(gatewayIncomingHeaderMatcher)
	outgoingHeaderOpts := runtime.WithOutgoingHeaderMatcher(gatewayOutgoingHeaderMatcher)
	mux := runtime.NewServeMux(marshalerOpts, incomingHeaderOpts, outgoingHeaderOpts)

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

func gatewayIncomingHeaderMatcher(key string) (string, bool) {
	if strings.HasPrefix(strings.ToLower(key), "x-") {
		return fmt.Sprintf("grpc-%s", key), true
	}
	return runtime.DefaultHeaderMatcher(key)
}

func gatewayOutgoingHeaderMatcher(key string) (string, bool) {
	if strings.ToLower(key) == "set-cookie" {
		return key, true
	}
	return "", false
}
