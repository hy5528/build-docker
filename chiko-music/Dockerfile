FROM --platform=$BUILDPLATFORM node:18-alpine as mmPlayer_builder

# Maintainer
LABEL maintainer="Crazyrico Open Source Software <crazyrico@qq.com>"

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git 

WORKDIR /app


RUN npm install \
&& npm start \
&& npm run build
 



EXPOSE 80 
CMD ["npx"]

