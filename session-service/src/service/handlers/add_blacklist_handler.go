package handlers

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
)

type addBlacklistHandler struct {
	sessionAgent token.TokenAgent
	refreshAgent token.TokenAgent
}

func NewAddBlacklistHandler(sessionAgent token.TokenAgent, refreshAgent token.TokenAgent) server.ApiHandler[pb.AddBlacklistRequest, pb.AddBlacklistResponse] {
	return &addBlacklistHandler{
		sessionAgent: sessionAgent,
		refreshAgent: refreshAgent,
	}
}

func (handler *addBlacklistHandler) Handle(req *pb.AddBlacklistRequest) (*pb.AddBlacklistResponse, error) {
	token := req.Token
	err := handler.sessionAgent.BlacklistToken(token)

	if err != nil {
		return &pb.AddBlacklistResponse{
			ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL,
		}, nil
	}

	return &pb.AddBlacklistResponse{
		ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR,
	}, nil
}
