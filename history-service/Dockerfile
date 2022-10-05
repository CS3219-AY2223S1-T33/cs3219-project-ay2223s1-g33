# Stage 1 : Builder
FROM node:alpine

WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

RUN mkdir -p history-service proto scripts db
RUN mkdir -p history-service/src/proto history-service/src/db

# Generate protobuff & database schema
COPY proto proto/
COPY scripts scripts/
COPY db db/
COPY package.json package-lock.json ./
COPY history-service/proto-emit.cfg history-service

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto
RUN npm run-script sync-schema

WORKDIR /app/history-service

# Install project dependencies
COPY history-service/package.json .
COPY history-service/package-lock.json .
RUN npm install

COPY history-service .
COPY history-service/src history-service/src

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
