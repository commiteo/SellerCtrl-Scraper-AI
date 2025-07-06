# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Copy package files
COPY package*.json ./

# Install Node.js dependencies (including devDependencies for build)
RUN npm install

# Copy backend Python files
COPY backend/ ./backend/

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig*.json ./
COPY components.json ./

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3001 3002

# Start the application
CMD ["npm", "run", "dev:full"] 