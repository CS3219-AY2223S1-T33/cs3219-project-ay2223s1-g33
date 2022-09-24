#!/bin/bash

docker pull golang:alpine3.16 --platform linux/amd64

CUR_DIR="$(pwd)"

docker run --rm -v $CUR_DIR:/app -w /app --platform linux/amd64 golang:alpine3.16 sh scripts/build-script.sh
