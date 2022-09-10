#!/bin/bash
echo "Generating gateway files"

protoc --proto_path=proto --go_out=gateway/gateway --go_opt=paths=source_relative proto/*.proto
protoc --proto_path=proto --go_out=gateway/gateway --go_opt=paths=source_relative \
    --go-grpc_out=gateway/gateway --go-grpc_opt=paths=source_relative \
    proto/*.proto
protoc -I proto --grpc-gateway_out /gateway/gateway --grpc-gateway_opt logtostderr=true \
    --grpc-gateway_opt paths=source_relative --grpc-gateway_opt generate_unbound_methods=true \
    proto/user-bff-service.proto proto/matching-service.proto
