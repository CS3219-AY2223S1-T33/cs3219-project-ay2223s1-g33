#!/bin/bash
echo "Generating Golang Proto files"

protoc --proto_path=proto --go_out=session-service/src/proto --go_opt=paths=source_relative \
    --go-grpc_out=session-service/src/proto --go-grpc_opt=paths=source_relative \
    proto/session-service.proto
