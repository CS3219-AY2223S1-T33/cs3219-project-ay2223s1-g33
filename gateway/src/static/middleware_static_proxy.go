package static

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"fmt"
	"io/ioutil"
	"net/http"
)

type staticContentProxy struct {
	downstreamServer string
}

func NewStaticContentProxy(server string) util.PipeInput {
	return &staticContentProxy{
		downstreamServer: server,
	}
}

func (server *staticContentProxy) Receive(httpCtx *util.HTTPContext) error {
	path := httpCtx.Request.URL.EscapedPath()

	if shouldRewritePath(path) {
		path = "/"
	}

	resp, err := http.Get(fmt.Sprintf("http://%s%s", server.downstreamServer, path))
	if err != nil {
		httpCtx.Response.WriteHeader(404)
		return nil
	}

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		httpCtx.Response.WriteHeader(404)
		return nil
	}

	httpCtx.Response.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	httpCtx.Response.WriteHeader(resp.StatusCode)
	httpCtx.Response.Write(data)
	return nil
}
