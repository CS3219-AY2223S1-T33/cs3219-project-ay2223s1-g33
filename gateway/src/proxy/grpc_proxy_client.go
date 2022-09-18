package proxy

import (
	"context"
	"errors"
	"io"
	"log"

	pb "cs3219-project-ay2223s1-g33/gateway/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type ProxyWorker interface {
	SetUpstream(upstream io.Writer)
	SetCloseListener(func())
	Start() (io.Writer, error)
	Write(data []byte) (n int, err error)
	Close() error
}

type proxyWorker struct {
	server        string
	conn          *grpc.ClientConn
	stream        pb.TunnelService_OpenStreamClient
	upstream      io.Writer
	closeListener func()
}

func CreateProxyClient(server string) ProxyWorker {
	return &proxyWorker{
		server: server,
	}
}

func (worker *proxyWorker) SetUpstream(upstream io.Writer) {
	worker.upstream = upstream
}

func (worker *proxyWorker) SetCloseListener(listener func()) {
	worker.closeListener = listener
}

func (worker *proxyWorker) Start() (io.Writer, error) {
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	conn, err := grpc.Dial(worker.server, opts...)
	if err != nil {
		return nil, errors.New("Failed to dial downstream")
	}
	worker.conn = conn

	client := pb.NewTunnelServiceClient(conn)
	ctx := context.Background()
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

	err = worker.stream.Send(&pb.TunnelServiceRequest{
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
			log.Println("HERE?")
			return
		}
		if err != nil {
			log.Printf("Failed to receive a data : %v\n", err)
			return
		}

		if worker.upstream != nil {
			worker.upstream.Write(message.Data)
		}
	}
}
