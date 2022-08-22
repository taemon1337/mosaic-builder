FROM node:alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

RUN apk update --no-cache \
    && apk add vim bash curl

ENV VITE_PUBLIC_BASE_PATH=http://localhost:3000

RUN yarn
COPY . .

EXPOSE 3000

CMD ["yarn", "start", "--host", "0.0.0.0"]
