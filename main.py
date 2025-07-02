from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import json
from amazon_scrape import main as scrape_main

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scrape")
async def scrape(request: Request):
    body = await request.json()
    asin = body.get("asin")
    options = body.get("options", {})

    sys.argv = ["amazon_scrape.py", asin, json.dumps(options)]
    try:
        await scrape_main()
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

