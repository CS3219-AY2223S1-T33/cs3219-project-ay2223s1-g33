package main

import (
	"cs3219-project-ay2223s1-g33/gateway/auth"
	"cs3219-project-ay2223s1-g33/gateway/proxy"
	"log"
	"net/http"
)

const websocketRoute = "/api/roomws"

func AttachProxyMiddleware(config *GatewayConfiguration, mux http.Handler) (http.Handler, error) {
	proxyManager := proxy.CreateWebsocketProxyManager()
	log.Printf("WS Proxy to Collab on %s\n", config.CollabServer)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && r.URL.EscapedPath() == websocketRoute {
			roomToken := r.URL.Query().Get("room")
			if roomToken == "" {
				w.WriteHeader(400)
				w.Write([]byte("No room token provided"))
				return
			}
			username := r.Header.Get(auth.AuthHeaderUsername)
			nickname := r.Header.Get(auth.AuthHeaderNickname)

			downstreamClient := proxy.CreateProxyClient(config.CollabServer, roomToken, username, nickname)
			downstreamWriter, err := downstreamClient.Start()
			if err != nil {
				log.Println(err)
				log.Println("Failed to connect downstream")
				return
			}

			wsConn, err := proxyManager.UpgradeProtocol(w, r)
			if err != nil {
				log.Println(err)
				log.Println("Failed to upgrade to Websocket")
				return
			}

			downstreamClient.SetUpstream(wsConn)
			wsConn.SetDownstream(downstreamWriter)

			downstreamClient.SetCloseListener(func() {
				wsConn.Close()
			})
			wsConn.SetCloseListener(func() {
				downstreamClient.Close()
			})
			wsConn.ConnectTunnel()
		} else {
			mux.ServeHTTP(w, r)
		}
	})

	return handler, nil
}
