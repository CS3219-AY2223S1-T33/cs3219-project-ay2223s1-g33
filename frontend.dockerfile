# Stage 1 : Builder
FROM node:alpine as builder

WORKDIR /usr/app

# Patch alpine to run bash and grpc
RUN apk add --no-cache bash && apk add libc6-compat &&  apk add nginx

# Generate protobuff
COPY proto proto/
COPY scripts scripts/
RUN mkdir -p /usr/app/frontend
COPY frontend/src frontend/src
COPY package.json package-lock.json ./

# Install protobuff dependencies
RUN npm install
RUN npm run-script gen-proto

WORKDIR /usr/app/frontend

# Install project dependencies
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install

COPY frontend .

# Build project
RUN npm run build


# Stage 2 : Compiler
FROM nginx:alpine

COPY ./frontend.nginx.conf /etc/nginx/nginx.conf

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from the stage 1
COPY --from=builder /usr/app/frontend/build /usr/share/nginx/html

#EXPOSE 3000 80
#ENTRYPOINT ["nginx", "-g", "daemon off;"]