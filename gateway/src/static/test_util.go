package static

import (
	"cs3219-project-ay2223s1-g33/gateway/mocks"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"net/http"
	"net/url"

	"github.com/golang/mock/gomock"
)

type stubHandler struct {
}

func (h *stubHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(r.URL.Path))
}

func makeContext(
	u string,
	ctrl *gomock.Controller,
) (*util.HTTPContext, *mocks.MockResponseWriter) {
	uri, _ := url.Parse(u)
	mockResp := mocks.NewMockResponseWriter(ctrl)
	return &util.HTTPContext{
		Request: &http.Request{
			URL:    uri,
			Header: map[string][]string{},
		},
		Response: mockResp,
	}, mockResp
}
