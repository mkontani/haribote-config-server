FROM node:12

WORKDIR /app
COPY . /app/

CMD ["npm", "start"]
