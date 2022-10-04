# Stage 1 : Builder
FROM node:alpine

RUN mkdir -p /app/question-service
WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Generate protobuff & database schema
COPY proto proto/
COPY scripts scripts/
COPY db db/
COPY question-service/src question-service/src
COPY package.json package-lock.json ./
COPY question-service/proto-emit.cfg question-service

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto
RUN npm run-script sync-schema

WORKDIR /app/question-service

# Install project dependencies
COPY question-service/package.json .
COPY question-service/package-lock.json .
RUN npm install

COPY question-service .

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
