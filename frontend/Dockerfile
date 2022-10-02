# Stage 1 : Builder
FROM node:alpine as builder

RUN mkdir -p /app/frontend
WORKDIR /app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat && apk add gcompat

# Generate protobuff
COPY proto proto/
COPY scripts scripts/
COPY frontend/src frontend/src
COPY package.json package-lock.json ./

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto

WORKDIR /app/frontend

# Install project dependencies
COPY frontend/package.json .
COPY frontend/y-websocket-peerprep-1.4.5.tgz .
RUN npm install

COPY frontend .

# Build project
RUN npm run build

# Stage 2 : NGINX Setup
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./frontend/frontend.nginx.conf /etc/nginx/nginx.conf

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from the stage 1
COPY --from=builder /app/frontend/build /share/nginx/html