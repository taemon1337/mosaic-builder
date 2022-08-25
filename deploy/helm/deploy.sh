#!/bin/bash
ACTION=${1:-"upgrade -i"}
RELEASE=${2:-"photo-mosaic"}
RELEASE_ENV=${3:-"gke"}

if [[ "${ACTION}" =~ "template" ]]; then
  helm template \
    --namespace mosaic \
    --create-namespace \
    --set env.GOOGLE_CLIENT_ID=TEST_CLIENT_ID \
    --set env.GOOGLE_CLIENT_SECRET=TEST_CLIENT_SECRET \
    --set env.REDIRECT_URL=https://TEST_REDIRECT_URL \
    --set env.SESSION_SECRET=TEST_SESSION_SECRET \
    --set global.redis.password=TEST_REDIS_PASSWORD \
    ${RELEASE} photo-mosaic
else
  helm ${ACTION} \
    --namespace mosaic \
    --create-namespace \
    -f ${HOME}/values-${RELEASE_ENV}.yaml \
    --set env.GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
    --set env.GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
    --set env.REDIRECT_URL=${REDIRECT_URL} \
    --set env.SESSION_SECRET=${SESSION_SECRET} \
    --set global.redis.password=${REDIS_PASSWORD} \
    ${RELEASE} photo-mosaic
fi
