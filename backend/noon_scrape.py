import json
import sys
from typing import Any, Dict
import requests
from bs4 import BeautifulSoup

def fetch_page(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0 Safari/537.36"
        )
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    return response.text

def extract_fields(html: str, options: Dict[str, Any], url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    data: Dict[str, Any] = {"link": url}

    if options.get("title"):
        el = soup.select_one("span.ProductTitle_title__vjUBn")
        if el:
            data["title"] = el.get_text(strip=True)

    if options.get("price"):
        el = soup.select_one("span.PriceOfferV2_priceNowText__fk5kK")
        if el:
            data["price"] = el.get_text(strip=True)

    if options.get("image"):
        el = soup.select_one("img.imageMagnify")
        if el and el.get("src"):
            data["image"] = el["src"]

    if options.get("seller"):
        el = soup.select_one("strong.PartnerRatingsV2_soldBy__IOCr1")
        if el:
            data["seller"] = el.get_text(strip=True)

    return data

def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Usage: python noon_scrape.py <url> '<options_json>'",
            file=sys.stderr,
        )
        sys.exit(1)

    url = sys.argv[1]
    try:
        options: Dict[str, Any] = json.loads(sys.argv[2])
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON: {exc}"}))
        sys.exit(1)

    try:
        html = fetch_page(url)
        data = extract_fields(html, options, url)
        print(json.dumps(data, ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)

if __name__ == "__main__":
    main() 