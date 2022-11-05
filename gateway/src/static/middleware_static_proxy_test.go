package static

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

const (
	htmlData  = `<html><h1>HELLO</h1></html>`
	jsonData  = `{"Dummy String": "AAA"}`
	imageData = `Something image binary`
)

func TestStaticProxy(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	downstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "text/html")
			fmt.Fprint(w, htmlData)
		} else if r.URL.Path == "/static/test.json" {
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprint(w, jsonData)
		} else if r.URL.Path == "/favicon.ico" {
			w.Header().Set("Content-Type", "image/png")
			fmt.Fprint(w, imageData)
		} else {
			w.WriteHeader(404)
			fmt.Fprint(w, "")
		}
	}))
	defer downstream.Close()

	server := staticContentProxy{
		downstreamServer: downstream.URL[7:],
	}

	ctx, mock := makeContext("/", ctrl)
	headers := http.Header{}
	mock.EXPECT().Header().Return(headers).AnyTimes()
	mock.EXPECT().WriteHeader(gomock.Eq(200))
	mock.EXPECT().Write(gomock.Eq([]byte(htmlData)))
	server.Receive(ctx)
	assert.Equal(t, "text/html", headers["Content-Type"][0])

	// Path Rewrite
	ctx, mock = makeContext("/login", ctrl)
	headers = http.Header{}
	mock.EXPECT().Header().Return(headers).AnyTimes()
	mock.EXPECT().WriteHeader(gomock.Eq(200))
	mock.EXPECT().Write(gomock.Eq([]byte(htmlData)))
	server.Receive(ctx)
	assert.Equal(t, "text/html", headers["Content-Type"][0])

	ctx, mock = makeContext("/static/test.json", ctrl)
	headers = http.Header{}
	mock.EXPECT().Header().Return(headers).AnyTimes()
	mock.EXPECT().WriteHeader(gomock.Eq(200))
	mock.EXPECT().Write(gomock.Eq([]byte(jsonData)))
	server.Receive(ctx)
	assert.Equal(t, "application/json", headers["Content-Type"][0])

	ctx, mock = makeContext("/favicon.ico", ctrl)
	headers = http.Header{}
	mock.EXPECT().Header().Return(headers).AnyTimes()
	mock.EXPECT().WriteHeader(gomock.Eq(200))
	mock.EXPECT().Write(gomock.Eq([]byte(imageData)))
	server.Receive(ctx)
	assert.Equal(t, "image/png", headers["Content-Type"][0])

	ctx, mock = makeContext("/static/not/a/route", ctrl)
	headers = http.Header{}
	mock.EXPECT().Header().Return(headers).AnyTimes()
	mock.EXPECT().WriteHeader(gomock.Eq(404))
	mock.EXPECT().Write(gomock.Any())
	server.Receive(ctx)
}
