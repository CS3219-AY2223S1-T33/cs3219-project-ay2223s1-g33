package token

import (
	"cs3219-project-ay2223s1-g33/session-service/mocks"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

const (
	jwtTestSecret = "abcdefg"
	testEmail     = "test@email.com"
)

func TestJwtCreateToken(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockClock := mocks.NewMockClock(ctrl)

	baseTimestamp := time.Date(2021, 10, 10, 10, 10, 0, 0, time.Local)
	realNow := time.Now()
	tokenLife := realNow.Sub(baseTimestamp) + time.Hour

	jwtAgent := &jwtAgent{
		secret:        []byte(jwtTestSecret),
		tokenValidity: tokenLife,
		clock:         mockClock,
	}

	data := &TokenData{
		Email: testEmail,
	}
	mockClock.EXPECT().Now().Return(baseTimestamp).Times(1)

	createdToken, err := jwtAgent.CreateToken(data)
	assert.Nil(t, err)
	assert.NotEmpty(t, createdToken)

	t.Log(createdToken)
	token, err := jwt.ParseWithClaims(createdToken, &JwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtAgent.secret, nil
	})
	assert.Nil(t, err)
	casted, ok := token.Claims.(*JwtClaims)
	assert.True(t, ok)
	assert.Equal(t, realNow.Add(time.Hour).Unix(), casted.ExpiresAt.Unix())
	assert.Equal(t, int64(1633831800), casted.NotBefore.Unix())
	assert.Equal(t, int64(1633831800), casted.IssuedAt.Unix())
}

func TestJwtValidateToken(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockClock := mocks.NewMockClock(ctrl)

	baseTimestamp := time.Date(2021, 10, 10, 10, 10, 0, 0, time.Local)
	realNow := time.Now()
	tokenLife := realNow.Sub(baseTimestamp) + time.Hour

	jwtAgent := &jwtAgent{
		secret:        []byte(jwtTestSecret),
		tokenValidity: tokenLife,
		clock:         mockClock,
	}

	data := &TokenData{
		Email: testEmail,
	}
	mockClock.EXPECT().Now().Return(baseTimestamp).Times(1)

	createdToken, err := jwtAgent.CreateToken(data)
	assert.Nil(t, err)
	assert.NotEmpty(t, createdToken)

	decodedData, err := jwtAgent.VerifyToken(createdToken)
	assert.Nil(t, err)
	assert.Equal(t, testEmail, decodedData.Email)
}

func TestJwtBadToken(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockClock := mocks.NewMockClock(ctrl)

	baseTimestamp := time.Date(2021, 10, 10, 10, 10, 0, 0, time.Local)
	realNow := time.Now()
	tokenLife := realNow.Sub(baseTimestamp) - time.Hour

	jwtAgent := &jwtAgent{
		secret:        []byte(jwtTestSecret),
		tokenValidity: tokenLife,
		clock:         mockClock,
	}

	data := &TokenData{
		Email: testEmail,
	}
	mockClock.EXPECT().Now().Return(baseTimestamp).Times(1)

	createdToken, err := jwtAgent.CreateToken(data)
	assert.Nil(t, err)
	assert.NotEmpty(t, createdToken)

	_, err = jwtAgent.VerifyToken(createdToken)
	assert.IsType(t, ExpiredTokenError{}, err)

	_, err = jwtAgent.VerifyToken("gibberish.token.something")
	assert.IsType(t, InvalidTokenError{}, err)
}
