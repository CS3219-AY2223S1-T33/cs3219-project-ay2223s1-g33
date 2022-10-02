#!/bin/bash

cd y-websocket
echo "Generating package"
npm pack --pack-destination ../frontend

cd ../frontend
echo "Installing package"
npm i --force y-websocket-peerprep-1.4.5.tgz

echo "Done"