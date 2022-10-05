# Stage 1 : Builder
FROM node:alpine

WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

RUN mkdir -p history-service history-service/src/proto history-service/src/db

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

FROM node:alpine
WORKDIR /app/history-service
# Install project dependencies
COPY history-service/package.json history-service/package-lock.json .
RUN npm install

COPY history-service .
COPY history-service/src ./src/
COPY --from=0 /app/history-service/src/proto/ ./src/proto/
COPY --from=0 /app/history-service/src/db/ ./src/db/

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start