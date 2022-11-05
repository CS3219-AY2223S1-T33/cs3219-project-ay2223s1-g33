package static

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"net/http"
	"net/url"
)

type staticContentServer struct {
	serveHandler http.Handler
}

func NewStaticContentServer(serveFolder string) util.PipeInput {
	return &staticContentServer{
		serveHandler: http.FileServer(http.Dir(serveFolder)),
	}
}

func (server *staticContentServer) Receive(httpCtx *util.HTTPContext) error {
	path := httpCtx.Request.URL.EscapedPath()
	req := httpCtx.Request
	resp := httpCtx.Response

	if shouldRewritePath(path) {
		reqCopy := *httpCtx.Request // This is Golang's shallow copy (copy to stack)
		req = &reqCopy
		path, _ := url.Parse("/")
		req.URL = path
	}

	server.serveHandler.ServeHTTP(resp, req)
	return nil
}
