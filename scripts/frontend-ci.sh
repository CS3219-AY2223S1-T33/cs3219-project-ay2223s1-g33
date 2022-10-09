#!/bin/bash

command_success() {
	if [ $1 -ne 0 ]; then
		exit 1
	fi
}

PROJECT_ROOT=`pwd`

echo "Generating y-websocket folder"
npm run-script gen-y-websocket

echo "Entering folder: frontend"
cd frontend
npm install

echo "Lint checking"
npm run-script lint
command_success $?

echo "Run tests"
CI=true npm run-script test
command_success $?

echo "Build application"
npm run-script build
command_success $?

echo "End of frontend CI"
cd $PROJECT_ROOT
exit 0

