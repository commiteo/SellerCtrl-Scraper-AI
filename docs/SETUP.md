# SellerCtrl Scraper AI - Setup Guide

This guide provides setup instructions for the SellerCtrl Scraper AI project.

## Project Structure

The project has been reorganized for better maintainability:

```
asin-amazon-oracle/
├── backend/                 # Backend services and scrapers
│   ├── server.cjs          # Main Node.js server
│   ├── scraper-server.js   # Advanced scraper with queue system
│   ├── main.py             # FastAPI server
│   ├── amazon_puppeteer.cjs # Amazon scraper
│   ├── noon_puppeteer.cjs  # Noon scraper
│   ├── amazon_scrape.py    # Python Amazon scraper
│   ├── noon_scrape.py      # Python Noon scraper
│   ├── solve_captcha.py    # CAPTCHA solver
│   └── requirements.txt    # Python dependencies
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── lib/               # Utilities and configurations
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── package.json           # Node.js dependencies and scripts
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Redis (for queue system)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd asin-amazon-oracle
```

### 2. Install Node.js dependencies
```bash
npm install
```

### 3. Install Python dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Set up Redis (optional, for advanced features)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

## Running the Application

### Development Mode

1. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

2. **Start the backend server (in a separate terminal):**
   ```bash
   npm run backend
   ```

3. **Start the advanced scraper server (optional):**
   ```bash
   npm run scraper-server
   ```

### Production Mode

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start all services:**
   ```bash
   npm run dev:full
   ```

### Using Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run individual services:**
   ```bash
   # Start Redis
   docker-compose up redis
   
   # Start scraper server
   docker-compose up scraper-server
   
   # Start API server
   docker-compose up api-server
   ```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend` - Start Node.js backend server
- `npm run scraper-server` - Start advanced scraper with queue system
- `npm run dev:full` - Start both frontend and scraper server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_PORT=3002
PORT=3001

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Browser Configuration (for Docker)
BROWSER_WS=ws://browser:3000
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Ensure ports 3001, 3002, and 6379 are available
   - Change ports in environment variables if needed

2. **Python dependencies:**
   - Make sure you're using Python 3.8+
   - Try reinstalling: `pip install -r backend/requirements.txt --force-reinstall`

3. **Node.js dependencies:**
   - Clear cache: `npm cache clean --force`
   - Reinstall: `npm run reinstall`

4. **Redis connection:**
   - Ensure Redis is running: `redis-cli ping`
   - Check Redis configuration in environment variables

### Performance Optimization

1. **Use the queue system** for better performance with multiple requests
2. **Enable browser reuse** in Docker environment
3. **Monitor network speed** using the built-in speed checker

## Development Guidelines

1. **Code organization:**
   - Backend code goes in `backend/`
   - Frontend code goes in `src/`
   - Keep components modular and reusable

2. **API endpoints:**
   - Amazon scraping: `POST /api/scrape`
   - Noon scraping: `POST /api/noon-scrape`
   - Job status: `GET /job-status/:id`

3. **Error handling:**
   - Implement proper error handling in all scrapers
   - Use retry mechanisms for failed requests
   - Log errors for debugging

## Deployment

### Render Deployment

The project includes `render.yaml` for easy deployment on Render:

1. Connect your repository to Render
2. Render will automatically detect the configuration
3. Set environment variables in Render dashboard

### Docker Deployment

1. Build the image:
   ```bash
   docker build -t sellerctrl-scraper .
   ```

2. Run the container:
   ```bash
   docker run -p 3001:3001 -p 3002:3002 sellerctrl-scraper
   ```

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the README.md for general information
- Contact the development team for specific issues 