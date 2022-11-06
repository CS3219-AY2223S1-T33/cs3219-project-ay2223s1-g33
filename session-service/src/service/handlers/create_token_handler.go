package handlers

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"log"
)

type createTokenHandler struct {
	sessionAgent token.TokenAgent
	refreshAgent token.TokenAgent
}

func NewCreateTokenHandler(sessionAgent token.TokenAgent, refreshAgent token.TokenAgent) server.ApiHandler[pb.CreateTokenRequest, pb.CreateTokenResponse] {
	return &createTokenHandler{
		sessionAgent: sessionAgent,
		refreshAgent: refreshAgent,
	}
}

func (handler *createTokenHandler) Handle(req *pb.CreateTokenRequest) (*pb.CreateTokenResponse, error) {
	if req.GetEmail() == "" || req.GetNickname() == "" {
		return &pb.CreateTokenResponse{
			ErrorCode: pb.CreateTokenErrorCode_CREATE_TOKEN_BAD_REQUEST,
		}, nil
	}

	tokenData := &token.TokenData{
		Email:    req.GetEmail(),
		Nickname: req.GetNickname(),
	}

	sessionToken, err := handler.sessionAgent.CreateToken(tokenData)
	if err != nil {
		log.Println(err)
		return &pb.CreateTokenResponse{
			ErrorCode: pb.CreateTokenErrorCode_CREATE_TOKEN_ERROR_INTERNAL,
		}, nil
	}

	refreshToken, err := handler.refreshAgent.CreateToken(tokenData)
	if err != nil {
		log.Println(err)
		return &pb.CreateTokenResponse{
			ErrorCode: pb.CreateTokenErrorCode_CREATE_TOKEN_ERROR_INTERNAL,
		}, nil
	}

	log.Printf("Issued token for %s\n", req.GetEmail())
	return &pb.CreateTokenResponse{
		SessionToken: sessionToken,
		RefreshToken: refreshToken,
		ErrorCode:    pb.CreateTokenErrorCode_CREATE_TOKEN_NO_ERROR,
	}, nil
}
