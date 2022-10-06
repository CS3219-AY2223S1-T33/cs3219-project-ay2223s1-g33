# Stage 1 : Builder
FROM node:alpine

WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Install protobuff dependencies
COPY package.json package-lock.json ./
RUN npm install

# Generate protobuff & database schema
RUN mkdir -p /app/question-service question-service/src/proto question-service/src/db
COPY proto proto/
COPY scripts scripts/
COPY db db/
COPY question-service/proto-emit.cfg question-service
RUN npm run-script gen-proto
RUN npm run-script sync-schema

FROM node:alpine
WORKDIR /app/question-service

# Install project dependencies
COPY question-service/package.json question-service/package-lock.json ./
RUN npm install

COPY question-service .
COPY question-service/src ./src/
RUN true
COPY --from=0 /app/question-service/src/proto/ ./src/proto/
RUN true
COPY --from=0 /app/question-service/src/db/ ./src/db/

# Build project
RUN npm run-script build

ENTRYPOINT npm run-script start
