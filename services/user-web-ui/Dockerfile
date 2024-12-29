FROM node:18

WORKDIR /user-web-ui

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 5174

CMD ["npx", "vite", "--host", "--port", "5174"]
