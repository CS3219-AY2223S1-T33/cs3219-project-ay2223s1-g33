package service

import (
	"context"
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service/handlers"
	"cs3219-project-ay2223s1-g33/session-service/token"

	"google.golang.org/grpc"
)

type SessionService struct {
	pb.UnimplementedSessionServiceServer
	createTokenHandler   server.ApiHandler[pb.CreateTokenRequest, pb.CreateTokenResponse]
	validateTokenHandler server.ApiHandler[pb.ValidateTokenRequest, pb.ValidateTokenResponse]
	addBlacklistHandler  server.ApiHandler[pb.AddBlacklistRequest, pb.AddBlacklistResponse]
}

func CreateSessionService(tokenAgent token.TokenAgent) *SessionService {
	return &SessionService{
		createTokenHandler:   handlers.CreateCreateTokenHandler(tokenAgent),
		validateTokenHandler: handlers.CreateValidateTokenHandler(tokenAgent),
		addBlacklistHandler:  handlers.CreateAddBlacklistHandler(tokenAgent),
	}
}

func (service *SessionService) CreateToken(ctx context.Context, req *pb.CreateTokenRequest) (*pb.CreateTokenResponse, error) {
	return service.createTokenHandler.Handle(req)
}

func (service *SessionService) ValidateToken(ctx context.Context, req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	return service.validateTokenHandler.Handle(req)
}

func (service *SessionService) AddBlacklist(ctx context.Context, req *pb.AddBlacklistRequest) (*pb.AddBlacklistResponse, error) {
	return service.addBlacklistHandler.Handle(req)
}

func (service *SessionService) Register(grpcServer *grpc.Server) error {
	pb.RegisterSessionServiceServer(grpcServer, service)
	return nil
}
