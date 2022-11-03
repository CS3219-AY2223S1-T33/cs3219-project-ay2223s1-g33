package static

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"net/http"
)

type staticContentMissingEndpoint struct {
	serveHandler http.Handler
}

func NewStaticContentMissingEndpoint() util.PipeInput {
	return &staticContentMissingEndpoint{}
}

func (server *staticContentMissingEndpoint) Receive(httpCtx *util.HTTPContext) error {
	httpCtx.Response.WriteHeader(404)
	httpCtx.Response.Write([]byte("Not Found"))
	return nil
}
