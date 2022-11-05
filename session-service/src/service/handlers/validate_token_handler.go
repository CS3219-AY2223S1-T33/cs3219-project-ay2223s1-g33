package handlers

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"errors"
	"log"
)

type validateTokenHandler struct {
	sessionAgent token.TokenAgent
	refreshAgent token.TokenAgent
}

var expiredErr token.ExpiredTokenError
var invalidErr token.InvalidTokenError

func NewValidateTokenHandler(sessionAgent token.TokenAgent, refreshAgent token.TokenAgent) server.ApiHandler[pb.ValidateTokenRequest, pb.ValidateTokenResponse] {
	return &validateTokenHandler{
		sessionAgent: sessionAgent,
		refreshAgent: refreshAgent,
	}
}

func (handler *validateTokenHandler) Handle(req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	if req.GetSessionToken() == "" {
		return &pb.ValidateTokenResponse{
			ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID,
		}, nil
	}
	tokenData, err := handler.sessionAgent.ValidateToken(req.GetSessionToken())

	if err != nil && errors.As(err, &expiredErr) {
		return handler.refreshToken(req)
	}

	if err != nil {
		var responseCode pb.ValidateTokenErrorCode
		switch {
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
		Nickname:  tokenData.Nickname,
		ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR,
	}, nil
}

func (handler *validateTokenHandler) refreshToken(req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	refreshTokenData, err := handler.refreshAgent.ValidateToken(req.GetRefreshToken())
	if err != nil {
		var responseCode pb.ValidateTokenErrorCode
		if errors.As(err, &invalidErr) {
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID
		} else if errors.As(err, &expiredErr) {
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED
		} else {
			log.Println(err)
			responseCode = pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL
		}

		return &pb.ValidateTokenResponse{
			ErrorCode: responseCode,
		}, nil
	}

	newSessionToken, err := handler.sessionAgent.CreateToken(refreshTokenData)
	if err != nil {
		return &pb.ValidateTokenResponse{
			ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL,
		}, nil
	}

	return &pb.ValidateTokenResponse{
		Email:           refreshTokenData.Email,
		Nickname:        refreshTokenData.Nickname,
		NewSessionToken: newSessionToken,
		ErrorCode:       pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR,
	}, nil
}
