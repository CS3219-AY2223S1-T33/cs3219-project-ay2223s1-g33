FROM node:alpine

# Setup protobuff
RUN apk add --no-cache bash
WORKDIR /home/node
COPY proto proto/
COPY scripts scripts/
COPY package.json .
RUN mkdir -p /home/node/frontend
COPY frontend frontend/
RUN npm install --quiet
RUN npm run-script gen-proto

# Setup reactapp
WORKDIR /home/node/frontend
RUN npm install --quiet
#RUN file="$(ls -1 ../frontend)" && echo $file

WORKDIR /home/node
RUN rm -rf !(frontend)
RUN cp frontend/* .
CMD ["ls"]