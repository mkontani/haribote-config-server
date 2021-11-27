FROM node:14-alpine

WORKDIR /app
COPY . /app/

STOPSIGNAL SIGTERM

CMD exec /app/app.js
