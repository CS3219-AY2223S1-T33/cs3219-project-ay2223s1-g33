FROM alpine:3.16
RUN apk add libc6-compat 

WORKDIR /app
COPY dist/session-service .

EXPOSE 4100

ENTRYPOINT /app/session-service
