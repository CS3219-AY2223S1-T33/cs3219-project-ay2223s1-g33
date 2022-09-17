package server

import (
	"fmt"
	"net"

	"google.golang.org/grpc"
)

type ApiServer interface {
	Start() error
	RegisterService(registerable RegisterableService) error
}

type apiServer struct {
	port       int
	grpcServer *grpc.Server
}

func CreateApiServer(port int, options ...grpc.ServerOption) ApiServer {
	grpcServer := grpc.NewServer(options...)
	return &apiServer{
		port:       port,
		grpcServer: grpcServer,
	}
}

func (server *apiServer) RegisterService(registerable RegisterableService) error {
	return registerable.Register(server.grpcServer)
}

func (server *apiServer) Start() error {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", server.port))
	if err != nil {
		return err
	}
	server.grpcServer.Serve(listener)
	return nil
}
