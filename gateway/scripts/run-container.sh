#!/bin/bash

docker run --name cs3219-project-matchmaker --publish 3000:3000 --env USER_BFF_SERVER=host.docker.internal:4000 --env MATCHING_SERVER=host.docker.internal:4001 cs3219-project/gateway