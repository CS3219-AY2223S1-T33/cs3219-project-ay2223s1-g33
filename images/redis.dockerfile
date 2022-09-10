FROM redis:7-alpine3.16

EXPOSE 6379
ENTRYPOINT redis-server
