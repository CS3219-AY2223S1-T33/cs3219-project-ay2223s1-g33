package auth

import (
	"cs3219-project-ay2223s1-g33/gateway/mocks"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"errors"
	"net/http"
	"net/url"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func makeContext(
	u string,
	ctrl *gomock.Controller,
) (*util.HTTPContext, *mocks.MockResponseWriter) {
	uri, _ := url.Parse(u)
	mockResp := mocks.NewMockResponseWriter(ctrl)
	return &util.HTTPContext{
		Request: &http.Request{
			URL:    uri,
			Method: "POST",
			Header: map[string][]string{},
		},
		Response: mockResp,
	}, mockResp
}

func TestMiddlewarePassthrough(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	authAgent := mocks.NewMockAuthAgent(ctrl)
	downstream := mocks.NewMockPipeInput(ctrl)
	middleware := authMiddleware{
		BasePipeOutput:    util.BasePipeOutput{},
		sessionServiceUrl: "testurl",
		authAgent:         authAgent,
	}
	middleware.PipeTo(downstream)

	ctx1, _ := makeContext(loginRoute, ctrl)
	ctx2, _ := makeContext(registerRoute, ctrl)
	ctx3, _ := makeContext(passwordResetRoute, ctrl)
	ctx4, _ := makeContext(resetTokenConsumeRoute, ctrl)

	gomock.InOrder(
		downstream.EXPECT().Receive(gomock.Eq(ctx1)),
		downstream.EXPECT().Receive(gomock.Eq(ctx2)),
		downstream.EXPECT().Receive(gomock.Eq(ctx3)),
		downstream.EXPECT().Receive(gomock.Eq(ctx4)),
	)

	middleware.Receive(ctx1)
	middleware.Receive(ctx2)
	middleware.Receive(ctx3)
	middleware.Receive(ctx4)
}

func TestMiddlewareSanitization(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	authAgent := mocks.NewMockAuthAgent(ctrl)
	downstream := mocks.NewMockPipeInput(ctrl)
	middleware := authMiddleware{
		BasePipeOutput:    util.BasePipeOutput{},
		sessionServiceUrl: "testurl",
		authAgent:         authAgent,
	}
	middleware.PipeTo(downstream)

	ctx, _ := makeContext("/api/user/profile", ctrl)
	ctx.Request.Header.Add(AuthHeaderNickname, "hijacking")
	ctx.Request.Header.Add(AuthHeaderUsername, "hijacking")
	ctx.Request.Header.Add(AuthHeaderSessionToken, "hijacking")
	ctx.Request.Header.Add(AuthHeaderRefreshToken, "hijacking")

	sanitizeRequest(ctx.Request)
	assert.Equal(t, "", ctx.Request.Header.Get(AuthHeaderNickname))
	assert.Equal(t, "", ctx.Request.Header.Get(AuthHeaderUsername))
	assert.Equal(t, "", ctx.Request.Header.Get(AuthHeaderSessionToken))
	assert.Equal(t, "", ctx.Request.Header.Get(AuthHeaderRefreshToken))
}

func TestMiddlewareAuthInvalid(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	authAgent := mocks.NewMockAuthAgent(ctrl)
	downstream := mocks.NewMockPipeInput(ctrl)
	middleware := authMiddleware{
		BasePipeOutput:    util.BasePipeOutput{},
		sessionServiceUrl: "testurl",
		authAgent:         authAgent,
	}
	middleware.PipeTo(downstream)

	ctx, mock := makeContext("/api/user/profile", ctrl)
	gomock.InOrder(
		mock.EXPECT().WriteHeader(401),
		mock.EXPECT().Write(gomock.Any()),
	)
	middleware.Receive(ctx)

	ctx, mock = makeContext("/api/user/profile", ctrl)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameSessionToken,
		Value: "aaa",
	})
	gomock.InOrder(
		mock.EXPECT().WriteHeader(401),
		mock.EXPECT().Write(gomock.Any()),
	)
	middleware.Receive(ctx)

	ctx, mock = makeContext("/api/user/profile", ctrl)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameRefreshToken,
		Value: "bbb",
	})
	gomock.InOrder(
		mock.EXPECT().WriteHeader(401),
		mock.EXPECT().Write(gomock.Any()),
	)
	middleware.Receive(ctx)

	ctx, mock = makeContext("/api/user/profile", ctrl)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameSessionToken,
		Value: "aaa",
	})
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameRefreshToken,
		Value: "",
	})
	gomock.InOrder(
		mock.EXPECT().WriteHeader(401),
		mock.EXPECT().Write(gomock.Any()),
	)
	middleware.Receive(ctx)
}

func TestMiddlewareAuthDownstream(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	authAgent := mocks.NewMockAuthAgent(ctrl)
	downstream := mocks.NewMockPipeInput(ctrl)
	middleware := authMiddleware{
		BasePipeOutput:    util.BasePipeOutput{},
		sessionServiceUrl: "testurl",
		authAgent:         authAgent,
	}
	middleware.PipeTo(downstream)

	// Case 1 - bad tokens
	ctx, mock := makeContext("/api/user/profile", ctrl)
	gomock.InOrder(
		authAgent.EXPECT().ValidateToken(gomock.Eq("aaa"), gomock.Eq("bbb")).Return("", "", "", errors.New("Test error")),
		mock.EXPECT().WriteHeader(401),
		mock.EXPECT().Write(gomock.Any()),
	)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameSessionToken,
		Value: "aaa",
	})
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameRefreshToken,
		Value: "bbb",
	})
	middleware.Receive(ctx)

	// Case 2 - ok tokens, no refresh
	ctx, mock = makeContext("/api/user/profile", ctrl)
	gomock.InOrder(
		authAgent.EXPECT().ValidateToken(gomock.Eq("ccc"), gomock.Eq("ddd")).Return("userA", "AAAA", "", nil),
		downstream.EXPECT().Receive(ctx),
	)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameSessionToken,
		Value: "ccc",
	})
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameRefreshToken,
		Value: "ddd",
	})
	middleware.Receive(ctx)

	assert.Equal(t, "userA", ctx.Request.Header[AuthHeaderUsername][0])
	assert.Equal(t, "AAAA", ctx.Request.Header[AuthHeaderNickname][0])
	assert.Equal(t, "ccc", ctx.Request.Header[AuthHeaderSessionToken][0])
	assert.Equal(t, "ddd", ctx.Request.Header[AuthHeaderRefreshToken][0])

	// Case 3
	ctx, mock = makeContext("/api/user/profile", ctrl)
	headers := http.Header{}
	gomock.InOrder(
		authAgent.EXPECT().ValidateToken(gomock.Eq("ccc"), gomock.Eq("ddd")).Return("userA", "AAAA", "ASDF", nil),
		mock.EXPECT().Header().Return(headers),
		downstream.EXPECT().Receive(ctx),
	)
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameSessionToken,
		Value: "ccc",
	})
	ctx.Request.AddCookie(&http.Cookie{
		Name:  AuthCookieNameRefreshToken,
		Value: "ddd",
	})
	middleware.Receive(ctx)

	assert.Equal(t, "userA", ctx.Request.Header[AuthHeaderUsername][0])
	assert.Equal(t, "AAAA", ctx.Request.Header[AuthHeaderNickname][0])
	assert.Equal(t, "ASDF", ctx.Request.Header[AuthHeaderSessionToken][0])
	assert.Equal(t, "ddd", ctx.Request.Header[AuthHeaderRefreshToken][0])
	assert.Contains(t, headers["Set-Cookie"][0], "ASDF")
}
