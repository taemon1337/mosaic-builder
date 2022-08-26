#!/bin/bash
ACTION=${1:-"upgrade -i"}
RELEASE=${2:-"photo-mosaic"}

if [[ "${ACTION}" =~ "template" ]]; then
  helm template \
    --namespace mosaic \
    --create-namespace \
    --set env.GOOGLE_CLIENT_ID=TEST_CLIENT_ID \
    --set env.GOOGLE_CLIENT_SECRET=TEST_CLIENT_SECRET \
    --set env.REDIRECT_URL=https://TEST_REDIRECT_URL \
    --set env.CALLBACK_URL=https://TEST_CALLBACK_URL/auth/google/callback \
    --set env.SESSION_SECRET=TEST_SESSION_SECRET \
    --set ingress.enabled=true \
    --set ingress.host=testhost.com \
    --set ingress.service.port.number=3000 \
    --set gke.enabled=true \
    --set gke.managed_certificate.domains=["testhost.com"] \
    --set global.redis.password=TEST_REDIS_PASSWORD \
    ${RELEASE} photo-mosaic
else
  helm ${ACTION} \
    --namespace mosaic \
    --create-namespace \
    --set env.GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
    --set env.GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
    --set env.REDIRECT_URL=${REDIRECT_URL} \
    --set env.CALLBACK_URL=${CALLBACK_URL} \
    --set env.SESSION_SECRET=${SESSION_SECRET} \
    --set ingress.enabled=true \
    --set ingress.host=${MOSAIC_HOSTNAME} \
    --set ingress.service.port.number=3000 \
    --set gke.enabled=true \
    --set gke.managed_certificate.domains=["${MOSAIC_HOSTNAME}"] \
    --set global.redis.password=${REDIS_PASSWORD} \
    ${RELEASE} photo-mosaic
fi
