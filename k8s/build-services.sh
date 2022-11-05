#!/bin/bash

docker build -t gcr.io/cs3219-peerprep-366617/session-service ./session-service/
docker build -t gcr.io/cs3219-peerprep-366617/user-service -f ./user-service/Dockerfile .
docker build -t gcr.io/cs3219-peerprep-366617/question-service -f ./question-service/Dockerfile .
docker build -t gcr.io/cs3219-peerprep-366617/history-service -f ./history-service/Dockerfile .
docker build -t gcr.io/cs3219-peerprep-366617/collab-service -f ./collab-service/Dockerfile .
docker build -t gcr.io/cs3219-peerprep-366617/matching-service -f ./matching-service/Dockerfile .

docker build -t gcr.io/cs3219-peerprep-366617/gateway ./gateway
docker build -t gcr.io/cs3219-peerprep-366617/matchmaker ./matchmaker

docker build -t gcr.io/cs3219-peerprep-366617/frontend -f ./frontend/Dockerfile .