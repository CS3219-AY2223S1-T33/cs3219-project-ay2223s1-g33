package handlers

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"errors"
	"log"
)

type validateTokenHandler struct {
	tokenAgent token.TokenAgent
}

func CreateValidateTokenHandler(tokenAgent token.TokenAgent) server.ApiHandler[pb.ValidateTokenRequest, pb.ValidateTokenResponse] {
	return &validateTokenHandler{
		tokenAgent: tokenAgent,
	}
}

func (handler *validateTokenHandler) Handle(req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	tokenData, err := handler.tokenAgent.ValidateToken(req.GetToken())

	if err != nil {
		var responseCode pb.ValidateTokenErrorCode
		var expiredErr token.ExpiredTokenError
		var invalidErr token.InvalidTokenError

		switch {
		case errors.As(err, &expiredErr):
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED
		case errors.As(err, &invalidErr):
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID
		default:
			log.Println(err)
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL
		}

		return &pb.ValidateTokenResponse{
			ErrorCode: responseCode,
		}, nil
	}

	return &pb.ValidateTokenResponse{
		Email:     tokenData.Email,
		ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR,
	}, nil
}
