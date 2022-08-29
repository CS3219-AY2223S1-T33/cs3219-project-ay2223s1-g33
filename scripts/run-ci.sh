#!/bin/bash

DIRECTORIES=("matching-service" "user-service")
PROJECT_ROOT=`pwd`

for P in ${DIRECTORIES[@]}; do
    cd $P
    CURRENT=`pwd`
    echo "Entering folder: ${CURRENT}"
    npm test
    
    if [ $? -ne 0 ]; then
        exit 1
    fi
    cd $PROJECT_ROOT
done

exit 0
