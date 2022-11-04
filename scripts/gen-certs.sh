#!/bin/bash

openssl req -x509 -days 365 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -subj  "/C=SG/O=CS3219 Peerprep/CN=peerprep.grpc.internal" \
    -addext "subjectAltName = DNS:peerprep.grpc.internal,DNS:user-service,DNS:session-service,DNS:question-service,DNS:history-service,DNS:collab-service,DNS:matching-service"

printf "Copy the following into the env sample\n\n"

sed -z 's/\n/\\n/g' cert.pem
printf "\n\n"
sed -z 's/\n/\\n/g' key.pem
printf "\n\n"