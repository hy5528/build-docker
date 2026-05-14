FROM --platform=$BUILDPLATFORM node:20-alpine
RUN apt update && apt install -y jq && apt clean

WORKDIR /cyp
COPY package.json .
RUN npm i
COPY index.js .
COPY app ./app
EXPOSE 8580
ENTRYPOINT ["node", "."]
