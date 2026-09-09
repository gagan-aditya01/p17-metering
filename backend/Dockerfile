FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "server.js"]
