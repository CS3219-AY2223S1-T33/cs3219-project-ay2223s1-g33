package static

import "strings"

func shouldRewritePath(path string) bool {
	return !(strings.HasPrefix(path, "/static") ||
		path == "/manifest.json" ||
		path == "/favicon.ico")
}
