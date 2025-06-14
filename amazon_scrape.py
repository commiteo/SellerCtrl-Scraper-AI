import asyncio
import json
import sys
from typing import Dict, Any

try:
    from crawl4ai import AsyncWebCrawler
except Exception as e:  # library missing or import error
    AsyncWebCrawler = None  # type: ignore

from bs4 import BeautifulSoup


async def fetch_page(url: str) -> str:
    if AsyncWebCrawler is None:
        raise ImportError("crawl4ai library not available")
    crawler = AsyncWebCrawler()
    result = await crawler.crawl(url)
    if isinstance(result, dict):
        return result.get("body", "")
    return result


def extract_fields(html: str, options: Dict[str, Any], url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    data: Dict[str, Any] = {}

    if options.get("title"):
        title = soup.find(id="productTitle")
        if title:
            data["title"] = title.get_text(strip=True)

    if options.get("price"):
        price = soup.select_one("#priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice")
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


async def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python amazon_scrape.py <ASIN> '<options_json>'", file=sys.stderr)
        sys.exit(1)

    asin = sys.argv[1]
    try:
        options: Dict[str, Any] = json.loads(sys.argv[2])
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON: {exc}"}))
        sys.exit(1)

    url = f"https://www.amazon.eg/dp/{asin}"

    try:
        html = await fetch_page(url)
        data = extract_fields(html, options, url)
        print(json.dumps(data, ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
