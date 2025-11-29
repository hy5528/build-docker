FROM --platform=$BUILDPLATFORM node:22-alpine as builder

# install dependencies and build tools
RUN apk update && apk add --no-cache wget curl git 

WORKDIR /app


RUN npm install \
&& npm start \
&& npm run build
 



EXPOSE 80 
CMD ["npx"]

