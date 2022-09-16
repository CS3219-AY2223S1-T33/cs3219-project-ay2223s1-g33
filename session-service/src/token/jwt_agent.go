package token

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSigningMethod = jwt.SigningMethodHS256

type JwtAgent interface {
	CreateToken(data *TokenData) (string, error)
	VerifyToken(token string) (*TokenData, error)
}

type jwtAgent struct {
	secret        []byte
	tokenValidity time.Duration
}

type JwtClaims struct {
	User *TokenData `json:"user"`
	jwt.RegisteredClaims
}

func CreateJwtAgent(signingSecret string, tokenValidity time.Duration) JwtAgent {
	return &jwtAgent{
		secret:        []byte(signingSecret),
		tokenValidity: tokenValidity,
	}
}

func (agent *jwtAgent) CreateToken(data *TokenData) (string, error) {
	timeNow := time.Now()
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

func (agent *jwtAgent) VerifyToken(tokenString string) (*TokenData, error) {
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
			return nil, err
		}
		if (validationErr.Errors & jwt.ValidationErrorExpired) == jwt.ValidationErrorExpired {
			return nil, ExpiredTokenError{}
		}
		if (validationErr.Errors & jwt.ValidationErrorSignatureInvalid) == jwt.ValidationErrorSignatureInvalid {
			return nil, InvalidTokenError{}
		}
		return nil, err
	}

	claims, ok := token.Claims.(*JwtClaims)
	if !ok || !token.Valid || claims.User == nil {
		return nil, InvalidTokenError{}
	}

	return claims.User, nil
}
