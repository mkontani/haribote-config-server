FROM node:14-alpine

WORKDIR /app
COPY . /app/

ENTRYPOINT [ "/app/app.js" ]