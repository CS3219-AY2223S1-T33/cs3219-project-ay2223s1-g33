#!/bin/sh

kubectl scale deploy -l scaleType=execute-elastic --replicas=$1
