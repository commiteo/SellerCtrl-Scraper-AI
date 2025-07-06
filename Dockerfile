# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files needed for build
COPY . .

# Build the frontend (creates dist/)
RUN npm run build

# Expose ports
EXPOSE 3001 3002

# Start the application
CMD ["npm", "run", "dev:full"] 