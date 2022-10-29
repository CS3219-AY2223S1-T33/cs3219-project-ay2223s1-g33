package prefix_router

import (
	"cs3219-project-ay2223s1-g33/gateway/util"
	"strings"
)

type prefixRouter struct {
	prefix        string
	matchedPipe   util.PipeInput
	otherwisePipe util.PipeInput
}

func NewPrefixRouter(
	prefix string,
	matchedPipe util.PipeInput,
	otherwisePipe util.PipeInput,
) util.PipeInput {
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
