#!/bin/bash

source "$(dirname "$0")/ci-config.sh"
PID_LIST=()

for P in ${DIRECTORIES[@]}; do
    bash ./run-ci-node.sh $P &
    PID="$!"
    PID_LIST+=($!)
done

RET_CODES=()
EXIT_CODE=0

for PID in ${PID_LIST[*]}; do
    CODE=wait $PID
    if ! $CODE; then
        EXIT_CODE=$CODE
    fi
done

exit $EXIT_CODE
