FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY env.example ./env.example
COPY README.md ./README.md

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
