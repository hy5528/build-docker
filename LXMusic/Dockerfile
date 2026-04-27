FROM --platform=$BUILDPLATFORM node:22-alpine

# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN apk add --no-cache python3 \
    python3-dev \
    python3-pip \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python
RUN npm install -g node-gyp

COPY package*.json ./
RUN npm install 

COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "index.js"]
    


