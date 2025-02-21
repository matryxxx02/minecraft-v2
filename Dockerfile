FROM node:22-alpine3.21 as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "server.js"]

FROM node:22-alpine3.21 AS production

WORKDIR /app

COPY --from=builder /app ./

RUN npm ci --only=production

CMD ["npm", "start"]