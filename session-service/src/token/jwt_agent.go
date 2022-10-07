package token

import (
	"cs3219-project-ay2223s1-g33/session-service/util"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSigningMethod = jwt.SigningMethodHS256

type JwtAgent interface {
	CreateToken(data *TokenData) (string, error)
	VerifyToken(token string) (data *TokenData, issuedAt int64, err error)
}

type jwtAgent struct {
	secret        []byte
	tokenValidity time.Duration
	clock         util.Clock
}

type JwtClaims struct {
	User *TokenData `json:"user"`
	jwt.RegisteredClaims
}

func CreateJwtAgent(signingSecret string, tokenValidity time.Duration) JwtAgent {
	return &jwtAgent{
		secret:        []byte(signingSecret),
		tokenValidity: tokenValidity,
		clock:         util.GetRealClock(),
	}
}

func (agent *jwtAgent) CreateToken(data *TokenData) (string, error) {
	timeNow := agent.clock.Now()
	tokenValidUntil := timeNow.Add(agent.tokenValidity)
	token := jwt.NewWithClaims(jwtSigningMethod, JwtClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			NotBefore: jwt.NewNumericDate(timeNow),
			IssuedAt:  jwt.NewNumericDate(timeNow),
			ExpiresAt: jwt.NewNumericDate(tokenValidUntil),
		},
		User: data,
	})

	return token.SignedString(agent.secret)
}

func (agent *jwtAgent) VerifyToken(tokenString string) (*TokenData, int64, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate Algo
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return agent.secret, nil
	})
	if err != nil {
		validationErr, ok := err.(*jwt.ValidationError)
		if !ok {
			return nil, 0, err
		}
		if (validationErr.Errors & jwt.ValidationErrorExpired) == jwt.ValidationErrorExpired {
			return nil, 0, ExpiredTokenError{}
		}
		if (validationErr.Errors & jwt.ValidationErrorSignatureInvalid) == jwt.ValidationErrorSignatureInvalid {
			return nil, 0, InvalidTokenError{}
		}
		return nil, 0, InvalidTokenError{}
	}

	claims, ok := token.Claims.(*JwtClaims)
	if !ok || !token.Valid || claims.User == nil {
		return nil, 0, InvalidTokenError{}
	}

	return claims.User, claims.IssuedAt.Unix(), nil
}
