package handlers_test

import (
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service/handlers"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func assertCreateTokenResponse(
	t *testing.T,
	handler server.ApiHandler[pb.CreateTokenRequest, pb.CreateTokenResponse],
	email string,
	nickname string,
	errorCode pb.CreateTokenErrorCode,
) *pb.CreateTokenResponse {
	req := &pb.CreateTokenRequest{
		Email:    email,
		Nickname: nickname,
	}
	resp, err := handler.Handle(req)
	assert.Nil(t, err)
	assert.Equal(t, errorCode, resp.ErrorCode)
	return resp
}

func TestCreateTokenHandlerSuccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewCreateTokenHandler(sessionAgent, refreshAgent)

	refData := token.TokenData{
		Email:    "aaa",
		Nickname: "bbb",
	}

	gomock.InOrder(
		sessionAgent.EXPECT().CreateToken(gomock.Eq(&refData)).Return("def", nil),
		refreshAgent.EXPECT().CreateToken(gomock.Eq(&refData)).Return("abc", nil),
	)

	resp := assertCreateTokenResponse(t, handler, "aaa", "bbb", pb.CreateTokenErrorCode_CREATE_TOKEN_NO_ERROR)
	assert.Equal(t, "abc", resp.RefreshToken)
	assert.Equal(t, "def", resp.SessionToken)
}

func TestCreateTokenHandlerBadRequest(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewCreateTokenHandler(sessionAgent, refreshAgent)
	assertCreateTokenResponse(t, handler, "", "", pb.CreateTokenErrorCode_CREATE_TOKEN_BAD_REQUEST)
	assertCreateTokenResponse(t, handler, "aaa", "", pb.CreateTokenErrorCode_CREATE_TOKEN_BAD_REQUEST)
	assertCreateTokenResponse(t, handler, "", "aaa", pb.CreateTokenErrorCode_CREATE_TOKEN_BAD_REQUEST)
}

func TestCreateTokenHandlerError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	gomock.InOrder(
		sessionAgent.EXPECT().CreateToken(gomock.Any()).Return("", errors.New("Test Error")),
		sessionAgent.EXPECT().CreateToken(gomock.Any()).Return("abc", nil),
		refreshAgent.EXPECT().CreateToken(gomock.Any()).Return("", errors.New("Test Error")),
	)

	handler := handlers.NewCreateTokenHandler(sessionAgent, refreshAgent)
	assertCreateTokenResponse(t, handler, "aaa", "bbb", pb.CreateTokenErrorCode_CREATE_TOKEN_ERROR_INTERNAL)
	assertCreateTokenResponse(t, handler, "aaa", "bbb", pb.CreateTokenErrorCode_CREATE_TOKEN_ERROR_INTERNAL)
}
