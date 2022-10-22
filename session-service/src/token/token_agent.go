package token

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist"
	"time"
)

type TokenAgent interface {
	CreateToken(data *TokenData) (string, error)
	ValidateToken(token string) (*TokenData, error)
	BlacklistToken(token string) error
	UnblacklistToken(token string) error
}

type tokenAgent struct {
	blacklistWriter  blacklist.TokenBlacklistWriter
	blacklistQuerier blacklist.TokenBlacklistQuerier
	jwtAgent         JwtAgent
}

func CreateTokenAgent(
	secret string,
	tokenValidity time.Duration,
	blacklistWriter blacklist.TokenBlacklistWriter,
	blacklistQuerier blacklist.TokenBlacklistQuerier,
) TokenAgent {
	return &tokenAgent{
		blacklistWriter:  blacklistWriter,
		blacklistQuerier: blacklistQuerier,
		jwtAgent:         CreateJwtAgent(secret, tokenValidity),
	}
}

func (agent *tokenAgent) CreateToken(data *TokenData) (string, error) {
	return agent.jwtAgent.CreateToken(data)
}

func (agent *tokenAgent) ValidateToken(token string) (*TokenData, error) {
	tokenData, issuedAt, err := agent.jwtAgent.VerifyToken(token)
	if err != nil {
		return nil, err
	}

	isBlacklisted, err := agent.blacklistQuerier.IsTokenBlacklisted(&blacklist.IssuedToken{
		Username:  tokenData.Email,
		Timestamp: uint64(issuedAt),
	})
	if err != nil {
		return nil, err
	}

	if isBlacklisted {
		return nil, InvalidTokenError{}
	}

	return tokenData, nil
}

func (agent *tokenAgent) BlacklistToken(token string) error {
	tokenData, issuedAt, err := agent.jwtAgent.VerifyToken(token)
	if err != nil {
		return err
	}

	return agent.blacklistWriter.AddToken(&blacklist.IssuedToken{
		Username:  tokenData.Email,
		Timestamp: uint64(issuedAt),
	})
}

func (agent *tokenAgent) UnblacklistToken(token string) error {
	tokenData, issuedAt, err := agent.jwtAgent.VerifyToken(token)
	if err != nil {
		return err
	}

	return agent.blacklistWriter.RemoveToken(&blacklist.IssuedToken{
		Username:  tokenData.Email,
		Timestamp: uint64(issuedAt),
	})
}
