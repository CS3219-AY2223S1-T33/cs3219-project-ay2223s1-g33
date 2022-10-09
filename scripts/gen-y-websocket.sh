#!/bin/bash

cd y-websocket
VER=`npm pkg get version | sed 's/\"//g'`
PKG_NAME="y-websocket-peerprep-${VER}.tgz"
echo "Generating package"
npm pack --pack-destination ../frontend

cd ../frontend
echo "Installing package"
npm i --force $PKG_NAME

echo "Done"