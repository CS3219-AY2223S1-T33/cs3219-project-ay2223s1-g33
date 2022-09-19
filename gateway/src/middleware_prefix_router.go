package main

import (
	"net/http"
	"strings"
)

func AttachPrefixRouter(prefix string, matchedMux http.Handler, otherwiseMux http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.EscapedPath()
		if strings.HasPrefix(path, prefix) {
			matchedMux.ServeHTTP(w, r)
			return
		}
		otherwiseMux.ServeHTTP(w, r)
	})
}
