package auth

import (
	"cs3219-project-ay2223s1-g33/gateway/mocks"
	pb "cs3219-project-ay2223s1-g33/gateway/proto"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestAuthAgent(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionClient := mocks.NewMockSessionServiceClient(ctrl)
	authAgent := authAgent{
		sessionServer: "ASDF",
		conn:          nil,
		sessionClient: sessionClient,
	}

	gomock.InOrder(
		// Expired
		sessionClient.EXPECT().ValidateToken(gomock.Any(), gomock.Eq(&pb.ValidateTokenRequest{
			SessionToken: "aaa",
			RefreshToken: "bbb",
		})).Return(&pb.ValidateTokenResponse{
			ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED,
		}, nil),

		// Invalid
		sessionClient.EXPECT().ValidateToken(gomock.Any(), gomock.Eq(&pb.ValidateTokenRequest{
			SessionToken: "ccc",
			RefreshToken: "ddd",
		})).Return(&pb.ValidateTokenResponse{
			ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED,
		}, nil),

		// Internal
		sessionClient.EXPECT().ValidateToken(gomock.Any(), gomock.Eq(&pb.ValidateTokenRequest{
			SessionToken: "eee",
			RefreshToken: "fff",
		})).Return(&pb.ValidateTokenResponse{
			ErrorCode: pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED,
		}, nil),

		// Call error
		sessionClient.EXPECT().ValidateToken(gomock.Any(), gomock.Any()).
			Return(nil, errors.New("Test error")),

		// Success
		sessionClient.EXPECT().ValidateToken(gomock.Any(), gomock.Eq(&pb.ValidateTokenRequest{
			SessionToken: "ggg",
			RefreshToken: "hhh",
		})).Return(&pb.ValidateTokenResponse{
			Email:           "UserA",
			Nickname:        "AAAA",
			NewSessionToken: "asdf",
			ErrorCode:       pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR,
		}, nil),
	)

	a, b, c, err := authAgent.ValidateToken("aaa", "bbb")
	assert.Equal(t, "", a)
	assert.Equal(t, "", b)
	assert.Equal(t, "", c)
	assert.Equal(t, "Expired Token", err.Error())

	a, b, c, err = authAgent.ValidateToken("ccc", "ddd")
	assert.Equal(t, "", a)
	assert.Equal(t, "", b)
	assert.Equal(t, "", c)
	assert.Equal(t, "Expired Token", err.Error())

	a, b, c, err = authAgent.ValidateToken("eee", "fff")
	assert.Equal(t, "", a)
	assert.Equal(t, "", b)
	assert.Equal(t, "", c)
	assert.Equal(t, "Expired Token", err.Error())

	a, b, c, err = authAgent.ValidateToken("zzz", "yyy")
	assert.Equal(t, "", a)
	assert.Equal(t, "", b)
	assert.Equal(t, "", c)
	assert.Equal(t, "Test error", err.Error())

	a, b, c, err = authAgent.ValidateToken("ggg", "hhh")
	assert.Equal(t, "UserA", a)
	assert.Equal(t, "AAAA", b)
	assert.Equal(t, "asdf", c)
	assert.Nil(t, err)

}
