FROM --platform=$BUILDPLATFORM node:22-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    python3-pip \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python
RUN npm install -g node-gyp

COPY package*.json ./
RUN npm install --production --no-optional

COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "index.js"]
    


