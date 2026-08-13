#!/usr/bin/env python3
"""
Fetch publications from Semantic Scholar and update publications cache.
Run this script to refresh publications data.
Usage: python3 fetch_publications.py
"""

import urllib.request
import json
import os
from datetime import datetime, timezone

AUTHOR_ID = "3227042"  # Aryabrata Basu on Semantic Scholar
CACHE_FILE = os.path.join(os.path.dirname(__file__), "publications_cache.json")

def fetch_publications():
    url = (
        f"https://api.semanticscholar.org/graph/v1/author/{AUTHOR_ID}/papers"
        f"?fields=title,year,venue,authors,citationCount,externalIds,"
        f"publicationTypes,abstract,openAccessPdf&limit=100"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=20)
    data = json.loads(resp.read())
    return data["data"]

def build_cache(papers):
    # Clean and sort papers by year descending
    cleaned = []
    for p in papers:
        doi = p.get("externalIds", {}).get("DOI", "")
        doi_url = f"https://doi.org/{doi}" if doi else ""
        pdf_url = ""
        if p.get("openAccessPdf") and p["openAccessPdf"].get("url"):
            pdf_url = p["openAccessPdf"]["url"]

        pub_types = p.get("publicationTypes") or []
        if "Conference" in pub_types:
            pub_type = "Conference"
        elif "Review" in pub_types:
            pub_type = "Review"
        elif "Book" in pub_types:
            pub_type = "Book Chapter"
        else:
            pub_type = "Journal"

        cleaned.append({
            "title": p.get("title", ""),
            "year": p.get("year") or 0,
            "venue": p.get("venue", ""),
            "authors": [a["name"] for a in p.get("authors", [])],
            "citations": p.get("citationCount", 0),
            "doi_url": doi_url,
            "pdf_url": pdf_url,
            "pub_type": pub_type,
            "abstract": (p.get("abstract") or "")[:400],
        })

    cleaned.sort(key=lambda x: x["year"], reverse=True)

    cache = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "author": "Aryabrata Basu",
        "semantic_scholar_id": AUTHOR_ID,
        "total": len(cleaned),
        "papers": cleaned,
    }
    return cache

if __name__ == "__main__":
    print("Fetching publications from Semantic Scholar...")
    try:
        papers = fetch_publications()
        cache = build_cache(papers)
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
        print(f"✓ Saved {cache['total']} publications to {CACHE_FILE}")
        print(f"  Last updated: {cache['last_updated']}")
    except Exception as e:
        print(f"✗ Error: {e}")
        if os.path.exists(CACHE_FILE):
            print("  Using existing cache file.")
