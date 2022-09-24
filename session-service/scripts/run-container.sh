#!/bin/bash

docker run --name cs3219-project-session-service --env REDIS_SERVER=host.docker.internal:6379 cs3219-project/session-service
