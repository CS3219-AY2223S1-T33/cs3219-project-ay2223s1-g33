package server

import (
	"crypto/tls"
	"fmt"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
)

type ApiServer interface {
	Start() error
	RegisterService(registerable RegisterableService) error
}

type apiServer struct {
	port       int
	grpcServer *grpc.Server
}

func CreateApiServerWithCreds(port int, certificate *tls.Certificate, options ...grpc.ServerOption) ApiServer {
	var serverCreds credentials.TransportCredentials
	if certificate == nil {
		serverCreds = insecure.NewCredentials()
	} else {
		serverCreds = credentials.NewServerTLSFromCert(certificate)
	}

	newOpts := options
	newOpts = append(newOpts, grpc.Creds(serverCreds))
	return CreateApiServer(port, newOpts...)
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
