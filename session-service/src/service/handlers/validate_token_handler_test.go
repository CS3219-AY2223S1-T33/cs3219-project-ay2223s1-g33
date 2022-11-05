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

func assertValidateTokenResponse(
	t *testing.T,
	handler server.ApiHandler[pb.ValidateTokenRequest, pb.ValidateTokenResponse],
	session string,
	refresh string,
	errorCode pb.ValidateTokenErrorCode,
) *pb.ValidateTokenResponse {
	req := &pb.ValidateTokenRequest{
		SessionToken: session,
		RefreshToken: refresh,
	}
	resp, err := handler.Handle(req)
	assert.Nil(t, err)
	assert.Equal(t, errorCode, resp.ErrorCode)
	return resp
}

func TestValidateTokenHandlerSuccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(&token.TokenData{
			Email:    "eee",
			Nickname: "fff",
		}, nil),
	)

	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR)
	assert.Equal(t, "eee", resp.Email)
	assert.Equal(t, "fff", resp.Nickname)
}

func TestValidateTokenHandlerFailure(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.InvalidTokenError{}),
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, errors.New("Test error")),
	)

	assertValidateTokenResponse(t, handler, "", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID)
	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID)
	assert.Equal(t, "", resp.Email)
	assert.Equal(t, "", resp.Nickname)
	assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL)
}

func TestValidateTokenHandlerRefreshSuccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.ExpiredTokenError{}),
		refreshAgent.EXPECT().ValidateToken("bbb").Return(&token.TokenData{
			Email:    "eee",
			Nickname: "fff",
		}, nil),
		sessionAgent.EXPECT().CreateToken(gomock.Any()).Return("abc", nil),
	)

	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR)
	assert.Equal(t, "eee", resp.Email)
	assert.Equal(t, "fff", resp.Nickname)
	assert.Equal(t, "abc", resp.NewSessionToken)
}

func TestValidateTokenHandlerRefreshExpired(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.ExpiredTokenError{}),
		refreshAgent.EXPECT().ValidateToken("bbb").Return(nil, token.ExpiredTokenError{}),
	)

	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED)
	assert.Equal(t, "", resp.Email)
	assert.Equal(t, "", resp.Nickname)
	assert.Equal(t, "", resp.NewSessionToken)
}

func TestValidateTokenHandlerRefreshInvalid(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.ExpiredTokenError{}),
		refreshAgent.EXPECT().ValidateToken("bbb").Return(nil, token.InvalidTokenError{}),
	)

	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID)
	assert.Equal(t, "", resp.Email)
	assert.Equal(t, "", resp.Nickname)
	assert.Equal(t, "", resp.NewSessionToken)
}

func TestValidateTokenHandlerRefreshError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)

	handler := handlers.NewValidateTokenHandler(sessionAgent, refreshAgent)
	gomock.InOrder(
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.ExpiredTokenError{}),
		refreshAgent.EXPECT().ValidateToken("bbb").Return(nil, errors.New("Test error")),
		sessionAgent.EXPECT().ValidateToken("aaa").Return(nil, token.ExpiredTokenError{}),
		refreshAgent.EXPECT().ValidateToken("bbb").Return(&token.TokenData{
			Email:    "eee",
			Nickname: "fff",
		}, nil),
		sessionAgent.EXPECT().CreateToken(gomock.Any()).Return("", errors.New("Test error")),
	)

	resp := assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL)
	assert.Equal(t, "", resp.Email)
	assert.Equal(t, "", resp.Nickname)
	assert.Equal(t, "", resp.NewSessionToken)

	resp = assertValidateTokenResponse(t, handler, "aaa", "bbb", pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INTERNAL)
	assert.Equal(t, "", resp.Email)
	assert.Equal(t, "", resp.Nickname)
	assert.Equal(t, "", resp.NewSessionToken)
}
