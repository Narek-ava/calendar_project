FROM node:16.15.0-alpine

RUN apk add --no-cache curl
RUN npm config set unsafe-perm true
RUN chown -R node:node /root

RUN export CYPRESS_CACHE_FOLDER=/app/.cache

USER node

WORKDIR /app

#HEALTHCHECK --interval=5s --timeout=5s --start-period=1s CMD curl --fail http://127.0.0.1:3000/health || exit 1
