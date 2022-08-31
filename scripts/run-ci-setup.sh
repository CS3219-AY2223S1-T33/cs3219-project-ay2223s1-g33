#!/bin/bash

source "$(dirname "$0")/ci-config.sh"

for P in ${DIRECTORIES[@]}; do
    cd $P
    CURRENT=`pwd`
    echo "Entering folder: ${CURRENT}"
    npm install
    
    if [ $? -ne 0 ]; then
        exit 1
    fi
    cd $PROJECT_ROOT
done

exit 0
