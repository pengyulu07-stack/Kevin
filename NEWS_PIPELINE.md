# AILLEURS News: daily source desk

## What appears on the site

- Eight topics: music, film, art, books, politics, technology, earth, and space.
- The top list shows two to four recent **source briefs** per topic when the feeds provide them. Each card keeps the publisher, actual publication date, image when supplied, excerpt when usable, and original URL. A source brief is not an AILLEURS-reported article.
- Longer articles live in **Editorial reading**. They are written and checked individually, with the original page and any extended source named. A contributor's suggested URL goes to the owner's feedback inbox for review; it is not published immediately.
- The edition date is computed in Asia/Shanghai. If the scheduled collection fails, the page names the last successful edition instead of labelling old items as today's news.

## Automatic morning sequence

1. GitHub Actions runs `.github/workflows/news.yml` at 06:17 and 10:17 Asia/Shanghai, plus on manual dispatch. The second run gives a recovery opportunity if a source or the first run is delayed. GitHub does not guarantee exact minute execution.
2. `scripts/refresh_news.py` retrieves section RSS from The Guardian and BBC News, and NASA's feed. It accepts only HTTPS story URLs with a valid publication date in the preceding 48 hours, deduplicates by URL, and keeps at most four per topic.
3. If fewer than six topics yield any item, the job fails and leaves the previous edition untouched. Successful results replace `news-feed.json` and commit only when changed.
4. A `GITHUB_TOKEN` commit does not trigger a branch-based GitHub Pages rebuild. The browser therefore reads `news-feed.json` directly from the repository's raw file URL, with the deployed Pages snapshot as a fallback. GitHub's raw file cache can add several minutes before a new edition appears. News checks again after ten minutes or when the tab becomes visible.
5. The owner checks the feed and feedback inbox for misclassification, broken images, changed headlines, claims requiring correction, and candidates for a 300–450-word article.

## Editorial article gate

The automatic feed cannot establish the underlying event, compare independent sources, or write a reliable 300–450-word article from an RSS sentence. An edited article needs the original material read, dates and claims checked, a clear account of what happened and why it matters, evidence limits, an image with a valid source, and links for deeper reading. Do not synthesize or publish a long article solely from the source brief. Reader suggestions remain private until an editor makes a separate publication decision.

## Date boundary for the wider site

Curated album covers, posters, art, and books start on 8 November 2026. Public music shares start on 18 November 2026. Forty earlier song rows, with existing votes and comments, are excluded from public queries and remain in the database for owner review rather than being silently destroyed.
