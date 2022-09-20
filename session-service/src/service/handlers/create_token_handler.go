package handlers

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"log"
)

type createTokenHandler struct {
	tokenAgent   token.TokenAgent
	refreshAgent token.TokenAgent
}

func NewCreateTokenHandler(sessionAgent token.TokenAgent, refreshAgent token.TokenAgent) server.ApiHandler[pb.CreateTokenRequest, pb.CreateTokenResponse] {
	return &createTokenHandler{
		tokenAgent:   sessionAgent,
		refreshAgent: refreshAgent,
	}
}

func (handler *createTokenHandler) Handle(req *pb.CreateTokenRequest) (*pb.CreateTokenResponse, error) {
	token, err := handler.tokenAgent.CreateToken(&token.TokenData{
		Email: req.GetEmail(),
	})

	if err != nil {
		log.Println(err)
		return &pb.CreateTokenResponse{
			ErrorCode: pb.CreateTokenErrorCode_CREATE_TOKEN_ERROR_INTERNAL,
		}, nil
	}

	return &pb.CreateTokenResponse{
		Token:     token,
		ErrorCode: pb.CreateTokenErrorCode_CREATE_TOKEN_NO_ERROR,
	}, nil
}
