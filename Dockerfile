FROM node:18

WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/client

RUN npm install && node ./node_modules/@vue/cli-service/bin/vue-cli-service.js build

COPY ./server/package.json ./server/package.json

WORKDIR /usr/src/app/server

RUN npm install

EXPOSE 7000

CMD [ "node", "/usr/src/app/server/app.js" ]
