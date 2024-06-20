FROM node:16-alpine as builder

WORKDIR /app

ENV PUBLIC_URL https://staging.chilledbutter.com/tva
ENV REACT_APP_TOKEN_ENDPOINT https://api.staging.chilledbutter.com/public/tva-token
ENV REACT_APP_DISABLE_TWILIO_CONVERSATIONS true 

RUN npm config set unsafe-perm true

COPY ./package.json ./yarn.lock ./
RUN yarn install && yarn cache clean --force

COPY ./ ./
RUN yarn build

FROM nginx:1.21-alpine

RUN apk add --no-cache curl

COPY ./docker/staging/nginx/conf.d /etc/nginx/conf.d

WORKDIR /app

COPY --from=builder /app/build ./public
