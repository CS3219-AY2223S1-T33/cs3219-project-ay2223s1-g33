package static

import (
	"testing"

	"github.com/golang/mock/gomock"
)

func TestStaticServer(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	server := staticContentServer{
		serveHandler: &stubHandler{},
	}

	ctx, mock := makeContext("/testroute", ctrl)
	mock.EXPECT().Write(gomock.Eq([]byte("/")))
	server.Receive(ctx)

	ctx, mock = makeContext("/static/app.css", ctrl)
	mock.EXPECT().Write(gomock.Eq([]byte("/static/app.css")))
	server.Receive(ctx)

	ctx, mock = makeContext("/favicon.ico", ctrl)
	mock.EXPECT().Write(gomock.Eq([]byte("/favicon.ico")))
	server.Receive(ctx)
}
