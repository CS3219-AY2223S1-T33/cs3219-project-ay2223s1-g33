package token

import "time"

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
	isBlacklisted, err := agent.blacklist.IsTokenBlacklisted(token)
	if err != nil {
		return nil, err
	}

	if isBlacklisted {
		return nil, InvalidTokenError{}
	}

	return agent.jwtAgent.VerifyToken(token)
}

func (agent *tokenAgent) BlacklistToken(token string) error {
	return agent.blacklist.AddToken(token)
}

func (agent *tokenAgent) UnblacklistToken(token string) error {
	return agent.blacklist.RemoveToken(token)
}
