FROM node:16-alpine as builder

WORKDIR /app

# Setup node env    
ENV NODE_OPTIONS=--max-old-space-size=5120

ENV REACT_APP_API_URL https://api.chilledbutter.com
ENV REACT_APP_PUSHER_HOST ws.chilledbutter.com
ENV REACT_APP_PUSHER_PORT 6001
ENV REACT_APP_MAPBOX_TOKEN pk.eyJ1IjoiYWxleGV5azg5IiwiYSI6ImNsOXNkcWtyNDB6bTMzdnA1dGs4NnRoajMifQ.JO4eOsyEmrADviQDHbTzeA

COPY ./package.json ./yarn.lock ./
RUN yarn install && yarn cache clean

COPY ./ ./
RUN yarn build

FROM nginx:1.21-alpine

RUN apk add --no-cache curl

COPY ./docker/production/nginx/conf.d /etc/nginx/conf.d

WORKDIR /app

COPY --from=builder /app/build ./public
