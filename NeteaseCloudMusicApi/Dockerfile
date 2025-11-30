FROM --platform=$BUILDPLATFORM node:18-alpine

RUN apk update && apk add --no-cache bash wget curl git nginx npm

WORKDIR /app

RUN npm install
  

USER node
EXPOSE 3000

CMD ["node", "app.js" ]
