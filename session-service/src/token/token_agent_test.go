package token_test

import (
	"cs3219-project-ay2223s1-g33/session-service/mocks"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"errors"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

const (
	jwtTestSecret = "abcedasdfg"
	testEmail     = "test@email.com"
)

func TestTokenAgent(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	blacklistWriter := mocks.NewMockTokenBlacklistWriter(ctrl)
	blacklistQuerier := mocks.NewMockTokenBlacklistQuerier(ctrl)
	tokenAgent := token.CreateTokenAgent(jwtTestSecret, time.Hour, blacklistWriter, blacklistQuerier)
	testErr := errors.New("Test error")

	createdToken, err := tokenAgent.CreateToken(&token.TokenData{
		Email: testEmail,
	})
	assert.Nil(t, err)
	assert.NotEmpty(t, createdToken)

	gomock.InOrder(
		blacklistQuerier.EXPECT().IsTokenBlacklisted(gomock.Any()).Return(false, nil),
		blacklistQuerier.EXPECT().IsTokenBlacklisted(gomock.Any()).Return(true, nil),
		blacklistQuerier.EXPECT().IsTokenBlacklisted(gomock.Any()).Return(false, testErr),
	)

	data, err := tokenAgent.ValidateToken(createdToken)
	assert.Nil(t, err)
	assert.Equal(t, testEmail, data.Email)

	_, err = tokenAgent.ValidateToken(createdToken)
	assert.IsType(t, token.InvalidTokenError{}, err)

	_, err = tokenAgent.ValidateToken(createdToken)
	assert.Equal(t, testErr, err)

	blacklistWriter.EXPECT().AddToken(gomock.Any())
	tokenAgent.BlacklistToken(createdToken)

	blacklistWriter.EXPECT().RemoveToken(gomock.Any())
	tokenAgent.UnblacklistToken(createdToken)
}
