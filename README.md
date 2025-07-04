[![Live App](https://img.shields.io/badge/Visit%20App-sellerctrl--ai.lovable.app-orange?style=for-the-badge)](https://sellerctrl-ai.lovable.app/scraper)

# SellerCtrl Scraper AI

SellerCtrl Scraper AI is a smart Amazon product data extractor powered by OpenAI. It scrapes detailed data using ASINs — including title, image, price, buybox winner, link, reviews, bullet points, rank, and more.

## Project Structure

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

## Tool Overview
- **Backend**: Node.js server (`backend/server.cjs`) launching scrapers
- **Scraping**: Uses Puppeteer and Python with BeautifulSoup to parse Amazon/Noon pages
- **Frontend**: React, Vite, Tailwind CSS and shadcn-ui
- **Usage**: Submit an ASIN to get product details including title, price, image and buy box

**Important:** SellerCtrl Scraper AI is proprietary software. The code in this repository is provided for reference only and is **not** licensed for public installation or redistribution.

## Getting Started

### Run on Lovable
Visit the [Lovable Project](https://lovable.dev/projects/77be9585-29f7-4d03-94b0-0ce9b51d6b84) and start prompting.

### Run locally (for internal development only)
SellerCtrl Scraper AI is not an open source project. Running the code locally is intended only for the SellerCtrl team and contributors.
Create a `.env` file with `GEMINI_API_KEY` and other variables (see SETUP.md) before starting the backend.

## 🔗 Try it Live
[https://sellerctrl-ai.lovable.app/scraper](https://sellerctrl-ai.lovable.app/scraper)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/77be9585-29f7-4d03-94b0-0ce9b51d6b84) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable. These instructions are intended for authorized SellerCtrl developers only.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env file with GEMINI_API_KEY and other settings (see SETUP.md).

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 6: Start the API server in another terminal
npm run backend

# Optionally, start the scraping server
npm run scraper-server

# Tip: you can run frontend and API together with
# npm start
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Node.js, Express, Puppeteer, Python, FastAPI
- **Database**: Redis (for job queues)
- **Deployment**: Docker, Render

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend` - Start Node.js backend server
- `npm run scraper-server` - Start advanced scraper with queue system
- `npm start` - Run frontend and backend together
- `npm run dev:full` - Start both frontend and scraper server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## How can I deploy this project?

This project is now a live production tool with a hosted frontend. Simply open [Lovable](https://lovable.dev/projects/77be9585-29f7-4d03-94b0-0ce9b51d6b84) and click on **Share -> Publish** to deploy your updates.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to **Project > Settings > Domains** and click **Connect Domain**.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
