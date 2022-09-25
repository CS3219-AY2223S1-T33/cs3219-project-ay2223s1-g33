#!/bin/bash

docker run --name cs3219-project-matchmaker --env REDIS_SERVER=host.docker.internal:6379 cs3219-project/matchmaker
