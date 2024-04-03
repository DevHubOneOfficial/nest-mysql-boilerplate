FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN rm -rf src

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

