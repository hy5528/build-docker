FROM --platform=$BUILDPLATFORM node:20-alpine 
# install dependencies and build tools
RUN apk update && apk add --no-cache npm wget curl git 

WORKDIR /app


RUN npm install \
&& npm start \
&& npm run build
 



EXPOSE 80 
CMD ["npx"]

