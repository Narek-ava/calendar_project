FROM nginx:1.21-alpine

RUN apk add --no-cache curl

COPY ./common/nginx/snippets /etc/nginx/snippets
COPY ./local/nginx/conf.d /etc/nginx/conf.d

WORKDIR /app
