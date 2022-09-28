# Stage 1 : Builder
FROM node:alpine

RUN mkdir -p /app/matching-service
WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat

# Generate protobuff & database schema
COPY proto proto/
COPY scripts scripts/
COPY matching-service/src matching-service/src
COPY package.json package-lock.json ./

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto

WORKDIR /app/matching-service

# Install project dependencies
COPY matching-service/package.json .
COPY matching-service/package-lock.json .
RUN npm install

COPY matching-service .

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
