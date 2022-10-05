# Stage 1 : Builder
FROM node:alpine

WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Install protobuff dependencies
COPY package.json package-lock.json ./
RUN npm install

# Generate protobuff & database schema
RUN mkdir -p /app/matching-service matching-service/src/proto
COPY proto proto/
COPY scripts scripts/

COPY matching-service/proto-emit.cfg matching-service
RUN npm run-script gen-proto

FROM node:alpine
WORKDIR /app/matching-service

# Install project dependencies
COPY matching-service/package.json matching-service/package-lock.json .
RUN npm install

COPY matching-service .
COPY matching-service/src matching-service/src
COPY --from=0 /app/matching-service/src/proto/ ./src/proto/

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
