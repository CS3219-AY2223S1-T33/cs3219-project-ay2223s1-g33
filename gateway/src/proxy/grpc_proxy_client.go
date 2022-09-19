package proxy

import (
	"context"
	"errors"
	"io"
	"log"

	pb "cs3219-project-ay2223s1-g33/gateway/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

type ProxyWorker interface {
	SetUpstream(upstream io.WriteCloser)
	SetCloseListener(func())
	Start() (io.WriteCloser, error)
	Write(data []byte) (n int, err error)
	Close() error
}

type proxyWorker struct {
	server          string
	sessionUsername string
	roomId          string

	conn          *grpc.ClientConn
	stream        pb.CollabTunnelService_OpenStreamClient
	upstream      io.WriteCloser
	closeListener func()
}

func CreateProxyClient(server string, roomId string, sessionUsername string) ProxyWorker {
	return &proxyWorker{
		server:          server,
		sessionUsername: sessionUsername,
		roomId:          roomId,
	}
}

func (worker *proxyWorker) SetUpstream(upstream io.WriteCloser) {
	worker.upstream = upstream
}

func (worker *proxyWorker) SetCloseListener(listener func()) {
	worker.closeListener = listener
}

func (worker *proxyWorker) Start() (io.WriteCloser, error) {
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	conn, err := grpc.Dial(worker.server, opts...)
	if err != nil {
		return nil, errors.New("Failed to dial downstream")
	}
	worker.conn = conn

	client := pb.NewCollabTunnelServiceClient(conn)
	headers := metadata.Pairs(
		"roomId", worker.roomId,
		"username", worker.sessionUsername,
	)

	ctx := metadata.NewOutgoingContext(context.Background(), headers)
	stream, err := client.OpenStream(ctx)
	if err != nil {
		return nil, err
	}
	worker.stream = stream
	go worker.handleConnection()

	return worker, nil
}

func (worker *proxyWorker) Write(data []byte) (n int, err error) {
	if worker.conn == nil {
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

func (worker *proxyWorker) Close() error {
	return worker.conn.Close()
}

func (worker *proxyWorker) handleConnection() {
	defer func() {
		if worker.closeListener != nil {
			worker.closeListener()
		}
	}()
	for {
		message, err := worker.stream.Recv()
		if err == io.EOF {
			return
		}
		if err != nil {
			log.Printf("Failed to receive a data : %v\n", err)
			return
		}

		if worker.upstream != nil {
			if message.Flags|int32(pb.VerifyRoomErrorCode_VERIFY_ROOM_UNAUTHORIZED) ==
				int32(pb.VerifyRoomErrorCode_VERIFY_ROOM_UNAUTHORIZED) {
				log.Println("Unauthorized room token detected")
				worker.upstream.Close()
				worker.Close()
			}
			worker.upstream.Write(message.Data)
		}
	}
}
