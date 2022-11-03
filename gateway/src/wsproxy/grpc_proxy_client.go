package wsproxy

import (
	"context"
	"crypto/x509"
	"errors"
	"io"
	"log"
	"sync"
	"time"

	pb "cs3219-project-ay2223s1-g33/gateway/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

type ProxyWorker interface {
	CloseObservable
	Closeable
	Pipeable
	io.WriteCloser

	Connect() (io.WriteCloser, error)
}

type proxyWorker struct {
	server          string
	certificate     *x509.CertPool
	sessionUsername string
	sessionNickname string
	roomToken       string

	closeListener func()
	pipeTarget    io.WriteCloser

	mutex              sync.Mutex
	deathSignalChannel chan bool
	isOpen             bool
	conn               *grpc.ClientConn
	stream             pb.CollabTunnelService_OpenStreamClient
}

func CreateProxyClient(
	server string,
	certificate *x509.CertPool,
	roomToken string,
	sessionUsername string,
	sessionNickname string,
) ProxyWorker {
	return &proxyWorker{
		server:             server,
		sessionUsername:    sessionUsername,
		sessionNickname:    sessionNickname,
		roomToken:          roomToken,
		deathSignalChannel: make(chan bool, 2),
		isOpen:             false,
		certificate:        certificate,
	}
}

func (worker *proxyWorker) PipeTo(pipeTarget io.WriteCloser) {
	worker.pipeTarget = pipeTarget
}

func (worker *proxyWorker) SetCloseListener(listener CloseObserver) {
	worker.closeListener = listener
}

func (worker *proxyWorker) Connect() (io.WriteCloser, error) {
	worker.mutex.Lock()
	defer worker.mutex.Unlock()

	var clientCreds credentials.TransportCredentials
	if worker.certificate == nil {
		clientCreds = insecure.NewCredentials()
	} else {
		clientCreds = credentials.NewClientTLSFromCert(worker.certificate, "")
	}

	opts := []grpc.DialOption{grpc.WithTransportCredentials(clientCreds)}
	conn, err := grpc.Dial(worker.server, opts...)
	if err != nil {
		return nil, errors.New("Failed to dial downstream")
	}
	worker.conn = conn

	client := pb.NewCollabTunnelServiceClient(conn)
	ctx := worker.buildContextWithHeaders()

	stream, err := client.OpenStream(ctx)
	if err != nil {
		return nil, err
	}

	worker.stream = stream
	worker.isOpen = true
	go worker.handleConnection()

	return worker, nil
}

func (worker *proxyWorker) buildContextWithHeaders() context.Context {
	headers := metadata.Pairs(
		ProxyHeaderRoomToken, worker.roomToken,
		ProxyHeaderUsername, worker.sessionUsername,
		ProxyHeaderNickanme, worker.sessionNickname,
	)

	return metadata.NewOutgoingContext(context.Background(), headers)
}

func (worker *proxyWorker) Write(data []byte) (n int, err error) {
	if worker.conn == nil || worker.stream == nil {
		return 0, errors.New("Connection not established")
	}

	err = worker.stream.Send(&pb.CollabTunnelRequest{
		Data: data,
	})

	if err != nil {
		return 0, err
	}

	return len(data), nil
}

func (worker *proxyWorker) writeHeartbeat() error {
	if worker.conn == nil || worker.stream == nil {
		return errors.New("Connection not established")
	}

	return worker.stream.Send(&pb.CollabTunnelRequest{
		Flags: int32(pb.CollabTunnelRequestFlags_COLLAB_REQUEST_FLAG_HEARTBEAT),
	})
}

func (worker *proxyWorker) Close() error {
	worker.mutex.Lock()
	defer worker.mutex.Unlock()

	if !worker.isOpen {
		return nil
	}

	log.Printf("Closing %s GRPC Client\n", worker.sessionUsername)
	close(worker.deathSignalChannel)

	err := worker.conn.Close()
	if worker.closeListener != nil {
		worker.closeListener()
	}
	worker.isOpen = false

	return err
}

func (worker *proxyWorker) handleConnection() {
	defer worker.Close()
	go worker.runHeartbeatWorker(worker.deathSignalChannel)

	for worker.isOpen {
		message, err := worker.stream.Recv()
		if err == io.EOF {
			return
		}
		if err != nil {
			log.Printf("GRPC Receive Error: %v\n", err)
			return
		}

		if worker.pipeTarget == nil {
			continue
		}

		if worker.checkIsUnauthorized(message.Flags) {
			log.Printf("Unauthorized room token for user %s\n", worker.sessionUsername)
			return
		}

		if worker.checkIsHeartbeat(message.Flags) {
			continue
		}

		worker.pipeTarget.Write(message.Data)
	}
}

func (worker *proxyWorker) checkIsUnauthorized(flags int32) bool {
	return worker.isFlagSet(flags, int32(pb.CollabTunnelResponseFlags_COLLAB_RESPONSE_FLAG_UNAUTHORIZED))
}

func (worker *proxyWorker) checkIsHeartbeat(flags int32) bool {
	return worker.isFlagSet(flags, int32(pb.CollabTunnelResponseFlags_COLLAB_RESPONSE_FLAG_HEARTBEAT))
}

func (worker *proxyWorker) isFlagSet(flags int32, targetFlag int32) bool {
	return flags&targetFlag == targetFlag
}

func (worker *proxyWorker) runHeartbeatWorker(deathSignal <-chan bool) {
	log.Printf("Starting Heartbeat Worker for %s\n", worker.sessionUsername)
	isAlive := true
	for isAlive {
		select {
		case <-deathSignal:
			isAlive = false
			break
		case <-time.After(20 * time.Second):
			err := worker.writeHeartbeat()
			if err != nil {
				log.Println("Failed to write heartbeat")
				isAlive = false
				break
			}
		}
	}
	log.Printf("Heartbeat Worker death for %s\n", worker.sessionUsername)
}
