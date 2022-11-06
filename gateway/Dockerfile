FROM golang:alpine3.16
RUN apk add make
WORKDIR /build
COPY src/ ./src/
COPY makefile .
RUN make build

FROM alpine:3.16
RUN apk add libc6-compat 

WORKDIR /app
COPY --from=0 /build/dist/backend .

ENTRYPOINT /app/gateway
