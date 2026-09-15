#!/usr/bin/env python3
"""
Fetch publications from Semantic Scholar and update publications cache.
Run this script to refresh publications data.
Usage: python3 fetch_publications.py
"""

import urllib.request
import json
import os
import re
import tempfile
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError

AUTHOR_ID = "3227042"  # Aryabrata Basu on Semantic Scholar
REPOSITORY_ROOT = os.path.dirname(__file__)
CACHE_FILES = (
    os.path.join(REPOSITORY_ROOT, "publications_cache.json"),
    os.path.join(REPOSITORY_ROOT, "docs", "publications_cache.json"),
)
AUTHOR_PROFILE_URL = f"https://www.semanticscholar.org/author/Aryabrata-Basu/{AUTHOR_ID}"
SCHOLAR_PROFILE_URL = "https://scholar.google.com/citations?user=ZOgedfAAAAAJ&hl=en"

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

def fetch_author_stats():
    url = (
        f"https://api.semanticscholar.org/graph/v1/author/{AUTHOR_ID}"
        f"?fields=paperCount,citationCount,hIndex"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=20)
    data = json.loads(resp.read())
    return {
        "paperCount": int(data.get("paperCount") or 0),
        "citationCount": int(data.get("citationCount") or 0),
        "hIndex": int(data.get("hIndex") or 0),
    }

def fetch_google_scholar_stats():
    last_error = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                SCHOLAR_PROFILE_URL,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; publication-metrics-updater/1.0)",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            )
            resp = urllib.request.urlopen(req, timeout=20)
            html = resp.read().decode("utf-8", "ignore")
            table_match = re.search(r'<table id="gsc_rsb_st".*?</table>', html, re.DOTALL)
            if not table_match:
                raise ValueError("Google Scholar stats table was not found in the profile page")
            table = table_match.group(0)

            def extract_metric(label):
                pattern = (
                    r'<tr>\s*<td class="gsc_rsb_sc1">.*?'
                    + re.escape(label)
                    + r'.*?</td>\s*<td class="gsc_rsb_std">\s*([0-9,]+)\s*</td>'
                )
                match = re.search(pattern, table, re.DOTALL)
                if not match:
                    raise ValueError(f"Could not parse Google Scholar metric: {label}")
                return int(match.group(1).replace(",", ""))

            return {
                "citationCount": extract_metric("Citations"),
                "hIndex": extract_metric("h-index"),
                "i10Index": extract_metric("i10-index"),
            }
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            last_error = error
            if attempt < 2:
                time.sleep(2 ** attempt)
    raise last_error

def compute_i10_index(papers):
    return sum(1 for paper in papers if int(paper.get("citations") or 0) >= 10)

def load_cached_google_stats():
    try:
        with open(CACHE_FILES[0]) as cache_file:
            stats = json.load(cache_file).get("stats", {})
    except (FileNotFoundError, json.JSONDecodeError):
        return None

    required_fields = ("citationCount", "hIndex", "i10Index", "lastUpdated")
    if not all(field in stats for field in required_fields):
        return None
    return stats

def build_cache(papers, author_stats, scholar_stats, cached_google_stats):
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
    derived_citations = sum(int(paper.get("citations") or 0) for paper in cleaned)
    i10_index = compute_i10_index(cleaned)
    last_updated = datetime.now(timezone.utc).isoformat()
    if scholar_stats:
        stats = {
            "paperCount": int(author_stats.get("paperCount") or len(cleaned)),
            "citationCount": int(scholar_stats["citationCount"]),
            "hIndex": int(scholar_stats["hIndex"]),
            "i10Index": int(scholar_stats["i10Index"]),
            "source": "Google Scholar",
            "profileUrl": SCHOLAR_PROFILE_URL,
            "lastUpdated": last_updated,
        }
    elif cached_google_stats:
        stats = {
            "paperCount": int(author_stats.get("paperCount") or len(cleaned)),
            "citationCount": int(cached_google_stats["citationCount"]),
            "hIndex": int(cached_google_stats["hIndex"]),
            "i10Index": int(cached_google_stats["i10Index"]),
            "source": "Google Scholar (last successful snapshot)",
            "profileUrl": SCHOLAR_PROFILE_URL,
            "lastUpdated": cached_google_stats["lastUpdated"],
        }
    else:
        stats = {
            "paperCount": int(author_stats.get("paperCount") or len(cleaned)),
            "citationCount": int(author_stats.get("citationCount") or derived_citations),
            "hIndex": int(author_stats.get("hIndex") or 0),
            "i10Index": i10_index,
            "source": "Semantic Scholar",
            "profileUrl": AUTHOR_PROFILE_URL,
            "lastUpdated": last_updated,
        }

    cache = {
        "last_updated": last_updated,
        "author": "Aryabrata Basu",
        "semantic_scholar_id": AUTHOR_ID,
        "source_profile_url": SCHOLAR_PROFILE_URL,
        "stats": stats,
        "total": len(cleaned),
        "papers": cleaned,
    }
    return cache

def write_cache(cache):
    for cache_file in CACHE_FILES:
        directory = os.path.dirname(cache_file)
        file_descriptor, temporary_path = tempfile.mkstemp(
            dir=directory,
            prefix=".publications_cache.",
            suffix=".json",
        )
        try:
            with os.fdopen(file_descriptor, "w") as output:
                json.dump(cache, output, indent=2)
                output.write("\n")
                output.flush()
                os.fsync(output.fileno())
            os.replace(temporary_path, cache_file)
        except (OSError, TypeError, ValueError):
            if os.path.exists(temporary_path):
                os.unlink(temporary_path)
            raise

if __name__ == "__main__":
    print("Fetching publications from Semantic Scholar...")
    try:
        papers = fetch_publications()
        author_stats = fetch_author_stats()
        cached_google_stats = load_cached_google_stats()
        try:
            scholar_stats = fetch_google_scholar_stats()
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            scholar_stats = None
            print(f"⚠ Google Scholar metrics could not be refreshed: {error}")
        cache = build_cache(papers, author_stats, scholar_stats, cached_google_stats)
        write_cache(cache)
        print(f"✓ Saved {cache['total']} publications to {', '.join(CACHE_FILES)}")
        print(f"  Last updated: {cache['last_updated']}")
        print(
            "  Stats: "
            f"{cache['stats']['citationCount']} citations, "
            f"h-index {cache['stats']['hIndex']}, "
            f"i10-index {cache['stats']['i10Index']}"
        )
    except (HTTPError, URLError, TimeoutError, ValueError, KeyError, OSError, json.JSONDecodeError) as error:
        print(f"✗ Error: {error}")
        if any(os.path.exists(cache_file) for cache_file in CACHE_FILES):
            print("  Existing cache files were preserved.")
