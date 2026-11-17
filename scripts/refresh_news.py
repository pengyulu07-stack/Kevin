"""Collect source headlines for the Shanghai-date news desk.

This writes short source briefs, not AI-written articles. The six hand-edited
features in src/news.js remain separate from these automatically refreshed
links. GitHub Actions is scheduled twice daily; actual start time can vary.
"""

from __future__ import annotations

import datetime as dt
import email.utils
import html
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / ("public" if (ROOT / "public").is_dir() else ".") / "news-feed.json"
SHANGHAI = ZoneInfo("Asia/Shanghai")
NOW = dt.datetime.now(dt.timezone.utc)
FEEDS = {
    "music": [("The Guardian", "https://www.theguardian.com/music/rss")],
    "film": [("The Guardian", "https://www.theguardian.com/film/rss")],
    "art": [("The Guardian", "https://www.theguardian.com/artanddesign/rss")],
    "books": [("The Guardian", "https://www.theguardian.com/books/rss")],
    "politics": [
        ("BBC News", "https://feeds.bbci.co.uk/news/politics/rss.xml"),
        ("The Guardian", "https://www.theguardian.com/politics/rss"),
    ],
    "technology": [
        ("BBC News", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
        ("The Guardian", "https://www.theguardian.com/technology/rss"),
    ],
    "earth": [("The Guardian", "https://www.theguardian.com/environment/rss")],
    "space": [("NASA APOD", "https://science.nasa.gov/feed/apod-basic/")],
}
CHINA_FEEDS = [
    ("The Guardian · China", "https://www.theguardian.com/world/china/rss"),
    ("BBC News · China", "https://feeds.bbci.co.uk/news/world/asia/china/rss.xml"),
]
MEDIA = "{http://search.yahoo.com/mrss/}"
TAG = re.compile(r"<[^>]*>")
LOW_SIGNAL = re.compile(r"\b(review|cartoon|letters|live blog|live updates)\b|\blive:|\blive$|(?:^|\s)[–—-]\s*live\b|\bin pictures\b|^share your thoughts\b", re.I)


def clean(value: str, limit: int) -> str:
    value = html.unescape(TAG.sub(" ", value or ""))
    value = re.sub(r"\s+", " ", value).strip()
    value = re.split(r"\b(?:Continue reading|Sign up for the)\b", value, maxsplit=1, flags=re.I)[0].strip()
    if len(value) <= limit:
        return value
    return value[:limit].rsplit(" ", 1)[0].rstrip(" ,;:") + "…"


def safe_url(value: str) -> str:
    parsed = urlparse(value.strip())
    return value.strip() if parsed.scheme == "https" and parsed.hostname else ""


def fetch(url: str) -> bytes:
    return subprocess.check_output(
        ["curl", "-fLsS", "--retry", "2", "--max-time", "18", url],
        stderr=subprocess.DEVNULL,
        timeout=60,
    )


def read_feed(category: str, source: str, url: str) -> list[dict]:
    items = []
    for item in ET.fromstring(fetch(url)).findall(".//item"):
        title = clean(item.findtext("title", ""), 180)
        link = safe_url(item.findtext("link", ""))
        try:
            published = email.utils.parsedate_to_datetime(item.findtext("pubDate", ""))
            if published.tzinfo is None:
                continue
            published = published.astimezone(dt.timezone.utc)
        except (TypeError, ValueError):
            continue
        age = (NOW - published).total_seconds() / 3600
        if not title or not link or not -1 <= age <= 48 or LOW_SIGNAL.search(title):
            continue
        image = ""
        for media in item.findall(MEDIA + "content"):
            candidate = safe_url(media.attrib.get("url", ""))
            if candidate and int(media.attrib.get("width", "0") or 0) >= 460:
                image = candidate
                break
        if not image:
            media = item.find(MEDIA + "thumbnail")
            image = safe_url(media.attrib.get("url", "")) if media is not None else ""
        if not image and source == "NASA APOD":
            image = safe_url(item.findtext("{https://science.nasa.gov/apod/}hdurl", ""))
        summary = clean(item.findtext("description", ""), 260)
        items.append(
            {
                "category": category,
                "source": source,
                "title": title,
                "url": link,
                "published_at": published.isoformat().replace("+00:00", "Z"),
                "image": image,
                "summary": summary,
            }
        )
    return items


def main() -> int:
    result = {}
    failures = []
    for category, sources in FEEDS.items():
        rows = []
        for source, url in sources:
            try:
                rows.extend(read_feed(category, source, url))
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ET.ParseError) as exc:
                failures.append(f"{category}: {source}: {type(exc).__name__}")
        unique = {row["url"]: row for row in sorted(rows, key=lambda row: row["published_at"], reverse=True)}
        result[category] = list(unique.values())[:4]
    china = []
    for source, url in CHINA_FEEDS:
        try:
            china.extend(read_feed("politics", source, url))
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ET.ParseError) as exc:
            failures.append(f"politics: {source}: {type(exc).__name__}")
    china.sort(key=lambda row: row["published_at"], reverse=True)
    if not china:
        print("No recent China report from the checked China feeds; keeping the previous edition.", file=sys.stderr)
        return 1
    china_item = {**china[0], "region": "china"}
    result["politics"] = [china_item] + [row for row in result["politics"] if row["url"] != china_item["url"]][:3]
    # Do not replace a working edition with an empty or mostly failed scrape.
    healthy = sum(bool(rows) for rows in result.values())
    if healthy < 6:
        print(f"Only {healthy}/8 categories have source items; keeping previous edition.", file=sys.stderr)
        print(*failures, sep="\n", file=sys.stderr)
        return 1
    edition = {
        "edition_date": NOW.astimezone(SHANGHAI).date().isoformat(),
        "updated_at": NOW.isoformat().replace("+00:00", "Z"),
        "time_zone": "Asia/Shanghai",
        "kind": "source_briefs",
        "categories": result,
    }
    OUTPUT.write_text(json.dumps(edition, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Published {edition['edition_date']}: " + ", ".join(f"{key}={len(value)}" for key, value in result.items()))
    if failures:
        print("Source failures: " + "; ".join(failures), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
