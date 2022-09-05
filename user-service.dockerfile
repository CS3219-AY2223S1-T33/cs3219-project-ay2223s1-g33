# Stage 1 : Builder
FROM node:alpine

WORKDIR /usr/app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat

# Generate protobuff & database schema
COPY proto proto/
COPY scripts scripts/
COPY db db/
RUN mkdir -p /usr/app/user-service
COPY user-service/src user-service/src
COPY package.json package-lock.json ./

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto
RUN npm run-script sync-schema

WORKDIR /usr/app/user-service

# Install project dependencies
COPY user-service/package.json .
COPY user-service/package-lock.json .
RUN npm install

COPY user-service .

# Build project
RUN npm run build
