# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy backend Python files
COPY backend/ ./backend/

# Install Python dependencies
RUN pip3 install -r backend/requirements.txt

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