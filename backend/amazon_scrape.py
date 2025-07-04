import json
import sys
from typing import Any, Dict

import requests
from bs4 import BeautifulSoup


def fetch_page(url: str) -> str:
    """Download HTML for the given Amazon product URL."""
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
    data: Dict[str, Any] = {}

    if options.get("title"):
        title = soup.find(id="productTitle")
        if title:
            data["title"] = title.get_text(strip=True)

    if options.get("price"):
        price = soup.select_one(
            "#priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice"
        )
        if price:
            data["price"] = price.get_text(strip=True)

    if options.get("image"):
        image = soup.select_one("#landingImage, #imgTagWrapperId img")
        if image and image.get("src"):
            data["image"] = image["src"]

    if options.get("buybox"):
        buybox = soup.select_one("#buybox")
        if buybox:
            data["buybox"] = buybox.get_text(strip=True)

    if options.get("link"):
        data["link"] = url

    return data


def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Usage: python amazon_scrape.py <ASIN> '<options_json>'",
            file=sys.stderr,
        )
        sys.exit(1)

    asin = sys.argv[1]
    try:
        options: Dict[str, Any] = json.loads(sys.argv[2])
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON: {exc}"}))
        sys.exit(1)

    url = f"https://www.amazon.eg/dp/{asin}"

    try:
        html = fetch_page(url)
        data = extract_fields(html, options, url)
        print(json.dumps(data, ensure_ascii=False))
    except Exception as exc:  # pragma: no cover - network dependent
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()

