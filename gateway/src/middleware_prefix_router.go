package main

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"strings"
)

type prefixRouter struct {
	prefix        string
	matchedPipe   util.PipeInput[*util.HTTPContext]
	otherwisePipe util.PipeInput[*util.HTTPContext]
}

func NewPrefixRouter(
	prefix string,
	matchedPipe util.PipeInput[*util.HTTPContext],
	otherwisePipe util.PipeInput[*util.HTTPContext],
) util.PipeInput[*util.HTTPContext] {
	return &prefixRouter{
		prefix:        prefix,
		matchedPipe:   matchedPipe,
		otherwisePipe: otherwisePipe,
	}
}

func (router *prefixRouter) Receive(httpCtx *util.HTTPContext) error {
	path := httpCtx.Request.URL.EscapedPath()
	if strings.HasPrefix(path, router.prefix) {
		return router.matchedPipe.Receive(httpCtx)
	}
	return router.otherwisePipe.Receive(httpCtx)
}
