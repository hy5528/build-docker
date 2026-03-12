FROM --platform=$BUILDPLATFORM node:22-alpine

RUN apk add --no-cache tini

ENV NODE_ENV=production
USER node

WORKDIR /app

COPY --chown=node:node . ./

RUN yarn --network-timeout=100000

EXPOSE 7749

CMD [ "/sbin/tini", "--", "node", "app.js" ]
