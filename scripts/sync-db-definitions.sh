#!/bin/bash

SRC_DIR="./db/entities"
OUTPUT_DIR=("$@")

echo "Found the following files:";
FILES=`ls ${SRC_DIR}/*.ts`;
echo $FILES
echo ""
echo "Copy to:"

for P in ${OUTPUT_DIR[@]}; do
    echo $P
    mkdir -p $P
    cp $SRC_DIR/*.ts $P
done
