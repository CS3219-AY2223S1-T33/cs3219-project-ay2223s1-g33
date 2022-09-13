package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"sync"

	pb "cs3219-project-ay2223s1-g33/tunnel/proto"

	"google.golang.org/grpc"
)

type tunnelServer struct {
	pb.UnimplementedTunnelServiceServer
}

var streamA, streamB pb.TunnelService_OpenStreamServer
var lock sync.Mutex
var syncChan chan bool

var (
	port = flag.Int("port", 4002, "The server port")
)

func main() {
	flag.Parse()
	log.Println("Running server")
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	var opts []grpc.ServerOption

	syncChan = make(chan bool)
	grpcServer := grpc.NewServer(opts...)
	pb.RegisterTunnelServiceServer(grpcServer, &tunnelServer{})
	grpcServer.Serve(lis)
}

func (s *tunnelServer) OpenStream(stream pb.TunnelService_OpenStreamServer) error {
	lock.Lock()

	if streamA != nil && streamB != nil {
		return errors.New("Tunnel already saw 2 people")
	}

	if streamA == nil {
		log.Println("Got 1 connection, awaiting other")
		streamA = stream
		lock.Unlock()
		<-syncChan
		runAtoBPump()
		log.Println("Closing A")
	} else {
		log.Println("Got both connection, starting tunnel")
		streamB = stream
		lock.Unlock()
		close(syncChan)
		runBtoAPump()
		log.Println("Closing B")
	}

	return nil
}

func runAtoBPump() {
	for {
		msg, err := streamA.Recv()
		if err == io.EOF {
			log.Println("EOF")
			break
		}
		if err != nil {
			log.Println(err)
			log.Fatal("Error occurred")
		}
		streamB.Send(&pb.TunnelServiceResponse{
			Data: msg.Data,
		})
	}
}

func runBtoAPump() {
	for {
		msg, err := streamB.Recv()
		if err == io.EOF {
			log.Println("EOF")
			break
		}
		if err != nil {
			log.Fatal("Error occurred")
		}
		streamA.Send(&pb.TunnelServiceResponse{
			Data: msg.Data,
		})
	}
}
