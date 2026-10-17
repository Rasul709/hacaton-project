FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY database/seeds.json ./database/seeds.json

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/src/index.js"]
