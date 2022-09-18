package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

func AttachStaticServe(config *GatewayConfiguration, mux http.Handler) http.Handler {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		if path == "/" || strings.HasPrefix(path, "/static") {
			resp, err := http.Get(fmt.Sprintf("http://%s%s", config.StaticServer, path))
			if err != nil {
				w.WriteHeader(404)
				return
			}

			data, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				w.WriteHeader(404)
				return
			}

			w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
			w.WriteHeader(resp.StatusCode)
			w.Write(data)
			return
		}
		mux.ServeHTTP(w, r)
	})
	return handler
}
