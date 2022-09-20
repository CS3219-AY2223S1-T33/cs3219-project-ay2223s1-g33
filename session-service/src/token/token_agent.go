package token

import (
	"fmt"
	"time"
)

type TokenAgent interface {
	CreateToken(data *TokenData) (string, error)
	ValidateToken(token string) (*TokenData, error)
	BlacklistToken(token string) error
	UnblacklistToken(token string) error
}

type tokenAgent struct {
	blacklist TokenBlacklist
	jwtAgent  JwtAgent
}

const blacklistKeyFormat = "%s-%d"

func CreateTokenAgent(secret string, tokenValidity time.Duration, blacklist TokenBlacklist) TokenAgent {
	return &tokenAgent{
		blacklist: blacklist,
		jwtAgent:  CreateJwtAgent(secret, tokenValidity),
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

	blacklistKey := fmt.Sprintf(blacklistKeyFormat, tokenData.Email, issuedAt)
	isBlacklisted, err := agent.blacklist.IsTokenBlacklisted(blacklistKey)
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

	blacklistKey := fmt.Sprintf(blacklistKeyFormat, tokenData.Email, issuedAt)
	return agent.blacklist.AddToken(blacklistKey)
}

func (agent *tokenAgent) UnblacklistToken(token string) error {
	tokenData, issuedAt, err := agent.jwtAgent.VerifyToken(token)
	if err != nil {
		return err
	}

	blacklistKey := fmt.Sprintf(blacklistKeyFormat, tokenData.Email, issuedAt)
	return agent.blacklist.RemoveToken(blacklistKey)
}
