package handlers

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist"
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/token"
)

type addBlacklistHandler struct {
	sessionAgent    token.TokenAgent
	refreshAgent    token.TokenAgent
	chronoBlacklist blacklist.TokenBlacklistWriter
}

func NewAddBlacklistHandler(
	sessionAgent token.TokenAgent,
	refreshAgent token.TokenAgent,
	chronoBlacklist blacklist.TokenBlacklistWriter,
) server.ApiHandler[pb.AddBlacklistRequest, pb.AddBlacklistResponse] {
	return &addBlacklistHandler{
		sessionAgent:    sessionAgent,
		refreshAgent:    refreshAgent,
		chronoBlacklist: chronoBlacklist,
	}
}

func (handler *addBlacklistHandler) Handle(req *pb.AddBlacklistRequest) (*pb.AddBlacklistResponse, error) {
	sessionToken := req.GetSessionToken()
	refreshToken := req.GetRefreshToken()
	userBefore := req.GetUserBefore()

	if refreshToken != "" {
		err := handler.refreshAgent.BlacklistToken(refreshToken)
		if err != nil {
			return &pb.AddBlacklistResponse{
				ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL,
			}, nil
		}
	}

	if sessionToken != "" {
		err := handler.sessionAgent.BlacklistToken(sessionToken)
		if err != nil {
			return &pb.AddBlacklistResponse{
				ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL,
			}, nil
		}
	}

	if userBefore != nil {
		err := handler.chronoBlacklist.AddToken(
			&blacklist.IssuedToken{
				Username:  userBefore.GetUsername(),
				Timestamp: userBefore.GetTimestamp(),
			},
		)
		if err != nil {
			return &pb.AddBlacklistResponse{
				ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL,
			}, nil
		}
	}

	return &pb.AddBlacklistResponse{
		ErrorCode: pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR,
	}, nil
}
