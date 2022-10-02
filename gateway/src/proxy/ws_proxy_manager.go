package proxy

import (
	"io"
	"log"
	"net/http"
	"sync"
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
	socket        *websocket.Conn
	writeBuffer   chan []byte
	downstream    io.WriteCloser
	closeListener func()

	stateMutex     sync.Mutex
	hasPumpStarted bool
	isAlive        bool
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = 20 * time.Second

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
	conn.stateMutex.Lock()
	defer conn.stateMutex.Unlock()

	if !conn.isAlive {
		return nil
	}

	log.Println("Closing WS Connection")
	close(conn.writeBuffer)
	err := conn.socket.Close()
	conn.isAlive = false

	if conn.closeListener != nil {
		conn.closeListener()
	}
	return err
}

func (conn *websocketConnection) ConnectTunnel() error {
	conn.stateMutex.Lock()
	defer conn.stateMutex.Unlock()

	if conn.hasPumpStarted {
		return nil
	}

	conn.hasPumpStarted = true
	conn.isAlive = true
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

	log.Println("Read Pump Started")
	for conn.isAlive {
		_, message, err := conn.socket.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Websocket unexpectedly closed: %v", err)
			}
			break
		}
		if conn.downstream != nil {
			conn.downstream.Write(message)
		}
	}

	conn.Close()
	log.Println("Read Pump Death")
}

func (conn *websocketConnection) startWritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		log.Println("Write Pump Death")
		conn.Close()
		ticker.Stop()
	}()

	log.Println("Write Pump Started")
	for conn.isAlive {
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
