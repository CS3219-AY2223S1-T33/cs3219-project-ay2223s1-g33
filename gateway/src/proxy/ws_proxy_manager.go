package proxy

import (
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type WebsocketProxyManager interface {
	UpgradeProtocol(w http.ResponseWriter, r *http.Request) (WebsocketConnection, error)
}

type WebsocketConnection interface {
	SetDownstream(io.WriteCloser)
	SetCloseListener(func())
	ConnectTunnel() error
	Write(data []byte) (n int, err error)
	Close() error
}

type websocketProxy struct {
	connectionUpgrader *websocket.Upgrader
}

type websocketConnection struct {
	socket         *websocket.Conn
	writeBuffer    chan []byte
	downstream     io.WriteCloser
	closeListener  func()
	hasPumpStarted bool
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

func CreateWebsocketProxyManager() WebsocketProxyManager {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(req *http.Request) bool {
			return true
		},
	}
	return &websocketProxy{
		connectionUpgrader: &upgrader,
	}
}

func (proxy *websocketProxy) UpgradeProtocol(writer http.ResponseWriter, req *http.Request) (WebsocketConnection, error) {
	conn, err := proxy.connectionUpgrader.Upgrade(writer, req, nil)
	if err != nil {
		return nil, err
	}

	return &websocketConnection{
		socket:      conn,
		writeBuffer: make(chan []byte, 10),
	}, nil
}

func (conn *websocketConnection) SetDownstream(writer io.WriteCloser) {
	conn.downstream = writer
}

func (conn *websocketConnection) SetCloseListener(listener func()) {
	conn.closeListener = listener
}

func (conn *websocketConnection) Write(data []byte) (n int, err error) {
	conn.writeBuffer <- data
	return 0, nil
}

func (conn *websocketConnection) Close() error {
	return conn.socket.Close()
}

func (conn *websocketConnection) ConnectTunnel() error {
	if conn.hasPumpStarted {
		return nil
	}

	conn.hasPumpStarted = true
	go conn.startReadPump()
	go conn.startWritePump()
	return nil
}

func (conn *websocketConnection) startReadPump() {
	conn.socket.SetReadLimit(maxMessageSize)
	conn.socket.SetReadDeadline(time.Now().Add(pongWait))
	conn.socket.SetPongHandler(func(string) error {
		conn.socket.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := conn.socket.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Websocket closed: %v", err)
			}
			break
		}
		if conn.downstream != nil {
			conn.downstream.Write(message)
		}
	}
}

func (conn *websocketConnection) startWritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		if conn.closeListener != nil {
			conn.closeListener()
		}
	}()

	for {
		select {
		case message, ok := <-conn.writeBuffer:
			conn.socket.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				conn.socket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := conn.socket.WriteMessage(websocket.BinaryMessage, message)
			if err != nil {
				return
			}

		case <-ticker.C:
			conn.socket.SetWriteDeadline(time.Now().Add(writeWait))
			if err := conn.socket.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
