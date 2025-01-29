FROM node:18

WORKDIR /rest-api

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 1337

CMD ["npm", "run", "simulation", "--host"]
