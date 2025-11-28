FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


RUN npm run build


ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]
