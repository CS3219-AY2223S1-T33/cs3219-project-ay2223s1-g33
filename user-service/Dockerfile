# Stage 1 : Builder
FROM node:alpine

WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Install protobuff dependencies
COPY package.json package-lock.json ./
RUN npm install

# Generate protobuff & database schema
RUN mkdir -p /app/user-service user-service/src/proto user-service/src/db
COPY proto proto/
COPY scripts scripts/
COPY db db/
COPY user-service/proto-emit.cfg user-service
RUN npm run-script gen-proto
RUN npm run-script sync-schema

FROM node:alpine
WORKDIR /app/user-service

# Install project dependencies
COPY user-service/package.json user-service/package-lock.json ./
RUN npm install

COPY user-service .
COPY user-service/src user-service/src
COPY --from=0 /app/user-service/src/proto ./src/proto/
COPY --from=0 /app/user-service/src/db ./src/db/

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
