#!/bin/bash

docker pull golang:alpine3.16

CUR_DIR="$(pwd)"

docker run --rm -v $CUR_DIR:/app -w /app golang:alpine3.16 go build -o dist/matchmaker
