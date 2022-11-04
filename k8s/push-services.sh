#!/bin/bash

docker push gcr.io/cs3219-peerprep-366617/session-service
docker push gcr.io/cs3219-peerprep-366617/user-service
docker push gcr.io/cs3219-peerprep-366617/question-service
docker push gcr.io/cs3219-peerprep-366617/history-service
docker push gcr.io/cs3219-peerprep-366617/collab-service
docker push gcr.io/cs3219-peerprep-366617/matching-service

docker push gcr.io/cs3219-peerprep-366617/gateway
docker push gcr.io/cs3219-peerprep-366617/matchmaker
