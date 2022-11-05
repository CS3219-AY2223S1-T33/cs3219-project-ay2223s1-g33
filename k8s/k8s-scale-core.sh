#!/bin/sh

kubectl scale deploy -l scaleType=elastic --replicas=$1
