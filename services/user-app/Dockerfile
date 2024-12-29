FROM node:18

WORKDIR /user-app

COPY package*.json ./

RUN npm install \
    && npm install -g expo/ngrok

COPY . ./

CMD ["npx", "expo", "start", "--tunnel"]
