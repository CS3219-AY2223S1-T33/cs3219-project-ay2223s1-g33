#!/bin/bash

cd $1
CURRENT=`pwd`
echo "Entering folder: ${CURRENT}"
npm run-script lint
if [ $? -ne 0 ]; then
    exit 1
fi

npm test
if [ $? -ne 0 ]; then
    exit 1
fi

npm run-script build
if [ $? -ne 0 ]; then
    exit 1
fi

exit 0
