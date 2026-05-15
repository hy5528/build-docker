FROM --platform=$BUILDPLATFORM node:22-alpine 
ENV GOPROXY=https://goproxy.cn,direct
RUN apt update && apt install -y jq && apt clean

WORKDIR /cyp
COPY package.json .
RUN npm i
COPY index.js .
COPY app ./app
EXPOSE 8080
ENTRYPOINT ["node", "."]
