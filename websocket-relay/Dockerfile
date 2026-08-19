FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.cjs ./

EXPOSE 1234

CMD ["node", "server.cjs"]