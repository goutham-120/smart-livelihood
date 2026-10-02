FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy server application code
COPY . .

# Set default production environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/index.js"]
