package auth

import (
	"context"
	pb "cs3219-project-ay2223s1-g33/gateway/proto"
	"errors"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type AuthAgent interface {
	ValidateToken(sessionToken string, refreshToken string) (
		username string,
		nickname string,
		newSessionToken string,
		err error,
	)
	Dispose()
}

type authAgent struct {
	sessionServer string
	conn          *grpc.ClientConn
	sessionClient pb.SessionServiceClient
}

func CreateAuthAgent(sessionServer string) (AuthAgent, error) {
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	conn, err := grpc.Dial(sessionServer, opts...)
	if err != nil {
		return nil, err
	}

	client := pb.NewSessionServiceClient(conn)
	return &authAgent{
		sessionServer: sessionServer,
		conn:          conn,
		sessionClient: client,
	}, nil
}

func (agent *authAgent) ValidateToken(sessionToken string, refreshToken string) (
	username string,
	nickname string,
	newSessionToken string,
	err error,
) {
	ctx := context.Background()
	resp, err := agent.sessionClient.ValidateToken(ctx, &pb.ValidateTokenRequest{
		SessionToken: sessionToken,
		RefreshToken: refreshToken,
	})
	if err != nil {
		return "", "", "", err
	}

	if resp == nil || resp.ErrorCode != pb.ValidateTokenErrorCode_VALIDATE_TOKEN_NO_ERROR {
		if resp.ErrorCode == pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_EXPIRED {
			return "", "", "", errors.New("Expired Token")
		}
		if resp.ErrorCode == pb.ValidateTokenErrorCode_VALIDATE_TOKEN_ERROR_INVALID {
			return "", "", "", errors.New("Invalid Token")
		}
		return "", "", "", errors.New("Internal Error")
	}

	return resp.GetEmail(), resp.GetNickname(), resp.GetNewSessionToken(), nil
}

func (agent *authAgent) Dispose() {
	agent.conn.Close()
}
