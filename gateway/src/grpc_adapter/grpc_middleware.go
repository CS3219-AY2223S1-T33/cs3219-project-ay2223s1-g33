package grpc_adapter

import (
	"context"
	gw "cs3219-project-ay2223s1-g33/gateway/proto"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"fmt"
	"log"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
)

type grpcMiddleware struct {
	userServiceUrl     string
	matchingServiceUrl string
	historyServiceUrl  string
	connCtx            context.Context
	cancelCtx          context.CancelFunc
	serveMux           *runtime.ServeMux
}

func NewGRPCMiddleware(
	userServiceUrl string,
	matchingServiceUrl string,
	historyServiceUrl string,
) util.DisposablePipeInput[*util.HTTPContext] {
	ctx, cancel := context.WithCancel(context.Background())
	middleware := &grpcMiddleware{
		userServiceUrl:     userServiceUrl,
		matchingServiceUrl: matchingServiceUrl,
		historyServiceUrl:  historyServiceUrl,
		connCtx:            ctx,
		cancelCtx:          cancel,
	}
	if middleware.initServeMux() != nil {
		return nil
	}
	return middleware
}

func (middleware *grpcMiddleware) Receive(httpCtx *util.HTTPContext) error {
	middleware.serveMux.ServeHTTP(httpCtx.Response, httpCtx.Request)
	return nil
}

func (middleware *grpcMiddleware) Dispose() {
	middleware.cancelCtx()
}

func (middleware *grpcMiddleware) initServeMux() error {
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
	log.Printf("Proxying to User-BFF on %s\n", middleware.userServiceUrl)
	err := gw.RegisterUserServiceHandlerFromEndpoint(middleware.connCtx, mux, middleware.userServiceUrl, opts)
	if err != nil {
		return err
	}

	log.Printf("Proxying to Matching on %s\n", middleware.matchingServiceUrl)
	err = gw.RegisterQueueServiceHandlerFromEndpoint(middleware.connCtx, mux, middleware.matchingServiceUrl, opts)
	if err != nil {
		return err
	}

	log.Printf("Proxying to History on %s\n", middleware.historyServiceUrl)
	err = gw.RegisterHistoryServiceHandlerFromEndpoint(middleware.connCtx, mux, middleware.historyServiceUrl, opts)
	if err != nil {
		return err
	}

	middleware.serveMux = mux
	return nil
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
