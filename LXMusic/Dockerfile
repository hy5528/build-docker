# Stage 1: Build Frontend
FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
# Remove electron and electron-builder from package.json
RUN node -e "const fs = require('fs'); const filePath = './package.json'; \
             let rawdata = fs.readFileSync(filePath); let packageJson = JSON.parse(rawdata); \
             if (packageJson.devDependencies) { \
               delete packageJson.devDependencies.electron; \
               delete packageJson.devDependencies['electron-builder']; \
             } \
             if (packageJson.dependencies) { \
               delete packageJson.dependencies.electron; \
             } \
             fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));"
             
RUN npm install

COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "index.js"]
    


