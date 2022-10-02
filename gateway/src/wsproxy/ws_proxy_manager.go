package wsproxy

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
	CloseObservable
	Closeable
	Pipeable
	io.WriteCloser

	ConnectTunnel() error
}

type websocketProxy struct {
	connectionUpgrader *websocket.Upgrader
}

type websocketConnection struct {
	socket        *websocket.Conn
	writeBuffer   chan []byte
	pipeTarget    io.WriteCloser
	closeListener func()

	stateMutex     sync.Mutex
	hasPumpStarted bool
	isAlive        bool
}

const (
	// Data channel parameters
	writeWait       = 10 * time.Second
	maxMessageSize  = 512
	writeBufferSize = 10

	// KeepAlive Parameters, ping period must be smaller than pong wait
	maxPongInterval = 60 * time.Second
	pingInterval    = 20 * time.Second
)

func CreateWebsocketProxyManager() WebsocketProxyManager {
	wsUpgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     checkOrigin,
	}
	return &websocketProxy{
		connectionUpgrader: &wsUpgrader,
	}
}

func checkOrigin(req *http.Request) bool {
	return true
}

func (proxy *websocketProxy) UpgradeProtocol(writer http.ResponseWriter, req *http.Request) (WebsocketConnection, error) {
	conn, err := proxy.connectionUpgrader.Upgrade(writer, req, nil)
	if err != nil {
		return nil, err
	}

	return &websocketConnection{
		socket:      conn,
		writeBuffer: make(chan []byte, writeBufferSize),
	}, nil
}

func (conn *websocketConnection) PipeTo(pipeTarget io.WriteCloser) {
	conn.pipeTarget = pipeTarget
}

func (conn *websocketConnection) SetCloseListener(listener CloseObserver) {
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
	conn.socket.SetReadDeadline(time.Now().Add(maxPongInterval))
	conn.socket.SetPongHandler(func(string) error {
		conn.socket.SetReadDeadline(time.Now().Add(maxPongInterval))
		return nil
	})

	for conn.isAlive {
		_, message, err := conn.socket.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseMessage, websocket.CloseNormalClosure) {
				log.Printf("Websocket unexpectedly closed: %v", err)
			}
			break
		}
		if conn.pipeTarget != nil {
			conn.pipeTarget.Write(message)
		}
	}

	log.Println("WS Read Pump Death")
	conn.Close()
}

func (conn *websocketConnection) startWritePump() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		log.Println("WS Write Pump Death")
		conn.Close()
		ticker.Stop()
	}()

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
