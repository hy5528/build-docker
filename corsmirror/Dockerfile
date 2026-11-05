FROM --platform=$BUILDPLATFORM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8788
CMD ["npm","run","dev"]

