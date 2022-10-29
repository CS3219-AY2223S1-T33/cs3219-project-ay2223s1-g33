package wsproxy

import (
	"cs3219-project-ay2223s1-g33/gateway/auth"
	"cs3219-project-ay2223s1-g33/gateway/util"
	"log"
	"net/http"
)

type wsProxyMiddleware struct {
	util.BasePipeOutput
	collabServiceUrl string
	proxyManager     WebsocketProxyManager
}

func NewWSProxyMiddleware(downstreamUrl string) util.ThroughPipe {
	log.Printf("WS Proxy on Downstream %s\n", downstreamUrl)
	return &wsProxyMiddleware{
		collabServiceUrl: downstreamUrl,
		proxyManager:     CreateWebsocketProxyManager(),
	}
}

func (middleware *wsProxyMiddleware) Receive(httpCtx *util.HTTPContext) error {
	if !isWSRequest(httpCtx.Request) {
		return middleware.BasePipeOutput.WriteToDownstream(httpCtx)
	}

	req := httpCtx.Request
	resp := httpCtx.Response

	roomToken := req.URL.Query().Get("room")
	if roomToken == "" {
		resp.WriteHeader(400)
		resp.Write([]byte("No room token provided"))
		return nil
	}

	username := req.Header.Get(auth.AuthHeaderUsername)
	nickname := req.Header.Get(auth.AuthHeaderNickname)
	downstreamClient := CreateProxyClient(middleware.collabServiceUrl, roomToken, username, nickname)
	downstreamWriter, err := downstreamClient.Connect()
	if err != nil {
		log.Println("Failed to connect downstream")
		return err
	}

	wsConn, err := middleware.proxyManager.UpgradeProtocol(resp, req)
	if err != nil {
		downstreamClient.Close()
		log.Println("Failed to upgrade to Websocket")
		return err
	}

	downstreamClient.PipeTo(wsConn)
	wsConn.PipeTo(downstreamWriter)

	downstreamClient.SetCloseListener(func() {
		wsConn.Close()
	})
	wsConn.SetCloseListener(func() {
		downstreamClient.Close()
	})

	return wsConn.ConnectTunnel()
}

func isWSRequest(request *http.Request) bool {
	return request.Method == http.MethodGet && request.URL.EscapedPath() == util.WebsocketRoute
}
