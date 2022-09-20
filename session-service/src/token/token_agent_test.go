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

	blacklist := mocks.NewMockTokenBlacklist(ctrl)
	tokenAgent := token.CreateTokenAgent(jwtTestSecret, time.Hour, blacklist)
	testErr := errors.New("Test error")

	createdToken, err := tokenAgent.CreateToken(&token.TokenData{
		Email: testEmail,
	})
	assert.Nil(t, err)
	assert.NotEmpty(t, createdToken)

	gomock.InOrder(
		blacklist.EXPECT().IsTokenBlacklisted(gomock.Eq(createdToken)).Return(false, nil),
		blacklist.EXPECT().IsTokenBlacklisted(gomock.Eq(createdToken)).Return(true, nil),
		blacklist.EXPECT().IsTokenBlacklisted(gomock.Eq(createdToken)).Return(false, testErr),
	)

	data, err := tokenAgent.ValidateToken(createdToken)
	assert.Nil(t, err)
	assert.Equal(t, testEmail, data.Email)

	_, err = tokenAgent.ValidateToken(createdToken)
	assert.IsType(t, token.InvalidTokenError{}, err)

	_, err = tokenAgent.ValidateToken(createdToken)
	assert.Equal(t, testErr, err)

	blacklist.EXPECT().AddToken(gomock.Eq(createdToken))
	tokenAgent.BlacklistToken(createdToken)

	blacklist.EXPECT().RemoveToken(gomock.Eq(createdToken))
	tokenAgent.UnblacklistToken(createdToken)
}
