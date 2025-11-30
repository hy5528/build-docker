FROM node:18-alpine

RUN apk update && apk add --no-cache bash wget curl git nginx 


RUN git clone https://github.com/lu2009/NeteaseCloudMusicAPI.git app

WORKDIR /app
RUN npm config set registry "https://registry.npmmirror.com/" \
	&& npm install -g npm husky \
	&& npm install --production

EXPOSE 3000

CMD ["node", "app.js" ]
