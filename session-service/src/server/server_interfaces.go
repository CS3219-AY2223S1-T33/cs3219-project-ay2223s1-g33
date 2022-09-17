package server

import "google.golang.org/grpc"

type ApiHandler[R any, V any] interface {
	Handle(request *R) (response *V, err error)
}

type RegisterableService interface {
	Register(grpcServer *grpc.Server) error
}
