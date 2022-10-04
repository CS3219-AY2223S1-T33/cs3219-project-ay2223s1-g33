# Stage 1 : Builder
FROM node:alpine

RUN mkdir -p /app/user-service
WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Generate protobuff & database schema
COPY proto proto/
COPY user-service/proto-emit.cfg user-service/
COPY scripts scripts/
COPY db db/
COPY user-service/src user-service/src
COPY package.json package-lock.json ./


# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto
RUN npm run-script sync-schema

WORKDIR /app/user-service

# Install project dependencies
COPY user-service/package.json .
COPY user-service/package-lock.json .
RUN npm install

COPY user-service .

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
