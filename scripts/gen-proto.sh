#!/bin/bash

OUT_DIR="./generated"
ARGS=("$@")
PROTO_DIR=$1
OUTPUT_DIR=("${ARGS[@]:1}")

echo "Found the following files:";
FILES=`ls ${PROTO_DIR}/*.proto`;
echo $FILES

mkdir -p $OUT_DIR
protoc \
    --plugin=protoc-gen-ts="./node_modules/.bin/protoc-gen-ts" \
    --ts_out="${OUT_DIR}" \
    --ts_opt server_grpc1 \
    --proto_path="${PROTO_DIR}" \
    $FILES

for P in ${OUTPUT_DIR[@]}; do
    mkdir -p $P
    cp $OUT_DIR/*.ts $P
done

rm -r $OUT_DIR
