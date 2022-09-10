#!/bin/bash

docker run --name cs3219-project-matchmaker --env USER_BFF_SERVER=host.docker.internal:4000 --env MATCHING_SERVER=host.docker.internal:4001 cs3219-project/gateway