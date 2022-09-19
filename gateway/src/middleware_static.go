package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func AttachStaticServe(server string) http.Handler {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		resp, err := http.Get(fmt.Sprintf("http://%s%s", server, path))
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
	})
	return handler
}
