FROM node:18

WORKDIR /admin-web-ui

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 5173

CMD ["npx", "vite", "--host"]
