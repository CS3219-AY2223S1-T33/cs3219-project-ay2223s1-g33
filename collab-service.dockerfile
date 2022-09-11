# Stage 1 : Builder
FROM node:alpine

RUN mkdir -p /app/collab-service
WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat

# Generate protobuff & database schema
COPY proto proto/
COPY scripts scripts/
COPY collab-service/src collab-service/src
COPY package.json package-lock.json ./

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto

WORKDIR /app/collab-service

# Install project dependencies
COPY collab-service/package.json .
COPY collab-service/package-lock.json .
RUN npm install

COPY collab-service .

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
