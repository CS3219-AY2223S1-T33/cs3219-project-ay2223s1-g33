## Matchmaker Module

This module is the subscriber component of the matchmaking service. There should only be 1 instance of this throughout the entire cluster.

This module is written as a high-performance, low footprint service that has a simple function: Poll the Redis matchmaking queue, match users, push it back onto Redis

## How to Build Golang Apps

You have 2 options, installing Golang on your local system, or use a docker image to perform the build

### Building Natively

This is the simple option, in the root of the matchmaker directory, run `make build`. The binary should appear in the `dist` folder.

### Building with Docker

You can use the Docker Golang image for building too. Run the script located in `scripts/build-golang-app.sh` from the root of the matchmaker directory, that is, `./scripts/build-golang-app.sh`.

## Building Docker Image

To build the alpine-based docker image for running the application, run `./scripts/build-image.sh`.

## Runing Natively

You can also run the app natively after you have built it (assuming your distro of UNIX has similar linking libs, otherwise you need to build natively).

Include a `.env` file in the root of the folder. Its contents should look something like

```
REDIS_SERVER=localhost:6379
```
