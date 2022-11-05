#!/bin/sh

secrets="./secrets-db.yaml ./secrets-db-judge.yaml ./secrets-email.yaml ./secrets-grpc-cert.yaml ./secrets-redis.yaml ./secrets-signing.yaml"
configs="./execute-config.yaml ./route-map-gateway-config.yaml ./route-map-internal-config.yaml"

for t in $secrets
do
  if [ ! -f $t ]; then
    echo "The following secret file does not exist:"
    echo $t
    exit 1
    fi
done

for t in $secrets
do
    kubectl apply -f $t
done

for t in $configs
do
    kubectl apply -f $t
done

echo "------ Deploy Ingress Controller ------"
kubectl apply -f ingress-priority
kubectl apply -f ingress-deployment.yaml
echo "#######################################"

echo "------------- Deploy App -------------"
kubectl apply -f redis-deployment.yaml
kubectl apply -f nginx-deployment.yaml
kubectl apply -f deployment.yaml
kubectl apply -f services.yaml
echo "#######################################"

echo "------ Waiting for Ingress Controller ------"
kubectl wait --namespace ingress-nginx \
 --for=condition=ready pod \
 --selector=app.kubernetes.io/component=controller \
 --timeout=90s
echo "#######################################"

echo "------ Deploy Ingress ------"
kubectl apply -f ingress.yaml
echo "#######################################"
