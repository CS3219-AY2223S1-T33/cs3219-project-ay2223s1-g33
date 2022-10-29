package handlers_test

import (
	"cs3219-project-ay2223s1-g33/session-service/blacklist"
	"cs3219-project-ay2223s1-g33/session-service/mocks"
	pb "cs3219-project-ay2223s1-g33/session-service/proto"
	"cs3219-project-ay2223s1-g33/session-service/server"
	"cs3219-project-ay2223s1-g33/session-service/service/handlers"
	"cs3219-project-ay2223s1-g33/session-service/token"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func assertAddBlacklistResponse(
	t *testing.T,
	handler server.ApiHandler[pb.AddBlacklistRequest, pb.AddBlacklistResponse],
	session string,
	refresh string,
	user *pb.UserTimestampPair,
	errorCode pb.AddBlacklistErrorCode,
) {
	req := &pb.AddBlacklistRequest{
		SessionToken: session,
		RefreshToken: refresh,
		UserBefore:   user,
	}
	resp, err := handler.Handle(req)
	assert.Nil(t, err)
	assert.Equal(t, errorCode, resp.ErrorCode)
}

func TestAddBlacklistHandlerSuccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)
	chronoBlacklist := mocks.NewMockTokenBlacklistWriter(ctrl)

	handler := handlers.NewAddBlacklistHandler(sessionAgent, refreshAgent, chronoBlacklist)

	gomock.InOrder(
		refreshAgent.EXPECT().BlacklistToken(gomock.Eq("bbb")).Return(nil),
		sessionAgent.EXPECT().BlacklistToken(gomock.Eq("aaa")).Return(nil),
		chronoBlacklist.EXPECT().AddToken(gomock.Eq(&blacklist.IssuedToken{
			Username:  "ccc",
			Timestamp: 1234,
		})).Return(nil),
		refreshAgent.EXPECT().BlacklistToken(gomock.Eq("bbb")).Return(nil),
		sessionAgent.EXPECT().BlacklistToken(gomock.Eq("aaa")).Return(nil),
		chronoBlacklist.EXPECT().AddToken(gomock.Eq(&blacklist.IssuedToken{
			Username:  "ccc",
			Timestamp: 1234,
		})).Return(nil),
	)
	assertAddBlacklistResponse(t, handler, "aaa", "bbb", &pb.UserTimestampPair{
		Username:  "ccc",
		Timestamp: 1234,
	}, pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR)

	assertAddBlacklistResponse(t, handler, "", "bbb", nil, pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR)
	assertAddBlacklistResponse(t, handler, "aaa", "", nil, pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR)
	assertAddBlacklistResponse(t, handler, "", "", &pb.UserTimestampPair{
		Username:  "ccc",
		Timestamp: 1234,
	}, pb.AddBlacklistErrorCode_ADD_BLACKLIST_NO_ERROR)
}

func TestAddBlacklistHandlerError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	sessionAgent := token.NewMockTokenAgent(ctrl)
	refreshAgent := token.NewMockTokenAgent(ctrl)
	chronoBlacklist := mocks.NewMockTokenBlacklistWriter(ctrl)

	handler := handlers.NewAddBlacklistHandler(sessionAgent, refreshAgent, chronoBlacklist)

	gomock.InOrder(
		refreshAgent.EXPECT().BlacklistToken(gomock.Eq("bbb")).Return(errors.New("Test Wrror")),
		sessionAgent.EXPECT().BlacklistToken(gomock.Eq("aaa")).Return(errors.New("Test Error")),
		chronoBlacklist.EXPECT().AddToken(gomock.Eq(&blacklist.IssuedToken{
			Username:  "ccc",
			Timestamp: 1234,
		})).Return(errors.New("Test error")),
	)
	assertAddBlacklistResponse(t, handler, "", "bbb", nil, pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL)
	assertAddBlacklistResponse(t, handler, "aaa", "", nil, pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL)
	assertAddBlacklistResponse(t, handler, "", "", &pb.UserTimestampPair{
		Username:  "ccc",
		Timestamp: 1234,
	}, pb.AddBlacklistErrorCode_ADD_BLACKLIST_ERROR_INTERNAL)
}
