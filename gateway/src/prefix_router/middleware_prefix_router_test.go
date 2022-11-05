package prefix_router

import (
	"cs3219-project-ay2223s1-g33/gateway/mocks"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"net/http"
	"net/url"
	"testing"

	"github.com/golang/mock/gomock"
)

func makeContext(u string) *util.HTTPContext {
	uri, _ := url.Parse(u)
	return &util.HTTPContext{
		Request: &http.Request{
			URL: uri,
		},
	}
}

func TestPrefixRouter(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	pipe1 := mocks.NewMockPipeInput(ctrl)
	pipe2 := mocks.NewMockPipeInput(ctrl)

	ctx1 := makeContext("/api/routea")
	ctx2 := makeContext("/static/routeb")
	ctx3 := makeContext("/api/routec/nested/deeply")

	gomock.InOrder(
		pipe1.EXPECT().Receive(ctx1),
		pipe2.EXPECT().Receive(ctx2),
		pipe1.EXPECT().Receive(ctx3),
	)

	middleware := NewPrefixRouter("/api", pipe1, pipe2)
	middleware.Receive(ctx1)
	middleware.Receive(ctx2)
	middleware.Receive(ctx3)
}
