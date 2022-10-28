package main

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

type staticContentServer struct {
	downstreamServer string
}

func NewStaticContentServer(server string) util.PipeInput[*util.HTTPContext] {
	return &staticContentServer{
		downstreamServer: server,
	}
}

func (server *staticContentServer) Receive(httpCtx *util.HTTPContext) error {
	path := httpCtx.Request.URL.EscapedPath()

	if server.shouldRewritePath(path) {
		path = "/"
	}

	resp, err := http.Get(fmt.Sprintf("http://%s%s", server, path))
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

func (server *staticContentServer) shouldRewritePath(path string) bool {
	return !(strings.HasPrefix(path, "/static") ||
		path == "/manifest.json" ||
		path == "/favicon.ico")
}
