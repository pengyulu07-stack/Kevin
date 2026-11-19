# Music direction and source check — 19 November 2026

This is the working standard for the music area. A checked catalog entry, an edited story, a usable photograph, and a playable recording are four different claims. Do not combine them into a single “complete” badge.

## What needs an account or key

| Visitor action | Current lawful path | New third-party setup? | Limit |
| --- | --- | --- | --- |
| Search a song title, compare artist/album/cover and sample | Public iTunes Search/Lookup API, with a link and preview attribution to the source | No Google account or YouTube key | Catalog matches are candidates. Apple promotional-content conditions apply; a sample is not a full recording. |
| Play an already identified YouTube video here | YouTube's official iframe player, using a confirmed video ID | No YouTube Data API key | The uploader/platform can disable embedding or restrict a region. A title is not a video ID. |
| Show three *newly searched* YouTube candidate videos in the composer | Official YouTube Data API `search.list`, with an API key held server-side | Yes: Google Cloud project and key | Optional enhancement. Its daily search quota is limited. No billing setup is being requested for this pass; costs must be checked in the exact project before enabling it. |
| Play a supplied SoundCloud or Spotify track in-page | Official SoundCloud widget or Spotify embed | No site-owned search key for a known URL | Availability, account and territorial restrictions still apply. |
| Find album/artist identity and front artwork | Apple catalog; MusicBrainz/Cover Art Archive as a checked alternative | No key for noncommercial MusicBrainz read requests | Respect MusicBrainz rate limits and artwork rights. Do not mistake a release reissue for the original sleeve. |
| Find extra photographs | Commons file pages with author and license checked | No key | Name search is discovery only. A person’s house, a later portrait drawing, or a near-duplicate concert frame is not a useful album photo. |

Sources read: [Apple Search API terms](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html), [YouTube embedded player](https://developers.google.com/youtube/player_parameters), [YouTube search](https://developers.google.com/youtube/data/reference/rest/v3/search/list), [YouTube quota](https://developers.google.com/youtube/data/determine_quota_cost), [SoundCloud oEmbed](https://developers.soundcloud.com/docs/oembed), [Spotify embeds](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed), [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API), [Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive/API), [Commons image metadata](https://www.mediawiki.org/wiki/API:Imageinfo/en).

## Visual and editorial method

1. Look at the *specific edition shown on the page*. Record its art director/photographer when a reliable source names them. Extract a small set of visual facts: dominant and supporting colors, light/dark balance, geometry, texture, typography, and what the image is actually showing.
2. Give the album its own visual rule. Extend one relevant cover element into the page margin or hero area; do not put the same rotated frame or generic ring on ten records. Decorations stay subordinate to the real cover and reading text.
3. Check body text at 4.5:1 and necessary control boundaries at 3:1 against adjacent surfaces. Check hover, focus, narrow screens and the full detail view, not just the cover tile. [W3C text contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [Apple color guidance](https://developer.apple.com/design/human-interface-guidelines/color).
4. Lead with what the songs contain or sound like, then explain a researched making/cover detail. Keep a claim next to its source. “Released in year Y” is metadata, not an introduction.
5. Choose extra photographs by *relationship to this record*: making, recording, cover session, release-era performance, collaborators, then later artist portrait if clearly labeled. One event should not crowd out the gallery. Keep a smaller truthful set if five suitably licensed photos do not exist.

## Three source-backed design cases in this pass

| Album and displayed sleeve | Source observation | Page extension | Story lead |
| --- | --- | --- | --- |
| *Madvillainy*, black-and-white mask with a small orange square | Stones Throw identifies Eric Coleman’s cover photograph and Jeff Jank’s design; its own 2002–03 making record separates studio, Brazil beat-making and later vocal sessions. [Design credit](https://www.stonesthrow.com/store/madvillainy/), [making photos and chronology](https://www.stonesthrow.com/news/making-madvillainy-photos/) | Restrained black/gray paper, one orange registration-like square and photographic edge. No generic picture frame. | Two makers working in different places; hear the compressed samples and shifting short verses before the backstory. |
| *Donuts*, smiling photograph used for CD/digital | Jeff Jank says this image came from Andrew Gura’s MED video footage; the LP also had a different donut-shop drawing. [Jank and Gura](https://www.stonesthrow.com/news/behind-the-smile-j-dilla-donuts/), [release record](https://www.stonesthrow.com/store/donuts/) | Warm near-black with one imperfect paper ring and a small “31” sleeve mark, acknowledging the 31-track sequence without pretending to reproduce the alternate LP drawing. | A rapidly turning sequence of short beats; explain the smiling image and why the CD/LP covers differ. |
| *In Rainbows*, color and liquid mark-making | Stanley Donwood describes failed paint-ball attempts, syringe drawing and a candle accident as the path to the artwork. [Donwood interview](https://www.thamesandhudson.com/blogs/all-news-features/inside-the-work-a-interview-with-radiohead-art-collaborator-stanley-donwood) | Deep blue-black with controlled translucent ink-like color fields, not a stock rainbow icon. | Begin with the record’s ten songs and contrasting intimacy/energy, then the release experiment and the actual image-making process. |

The cover examples and API pages above were read for the facts used here. Other search results were screened for leads; they are not treated as verified article evidence.

## 200-song acceptance and rotation

- Target: 200 distinct **recordings** across source-checked album editions, with title, credited artist, album and edition, track/album ID, cover source, source URL, and whether a 30-second preview actually exists. Duplicate tracks across deluxe editions count once unless there is a meaningful different recording.
- A separate editorial pass adds a concise, sourced reason to listen, an exact playable video or embed where available, and relevant images. These fields stay visibly missing until reviewed; a script must not fabricate them.
- Proposed display model: 100 active recordings drawn from the 200; each day two enter and two leave. This keeps 100 active on any date. Across 30 days there are up to 60 arrivals, so the number of *distinct songs encountered* can be up to 160, not exactly 100. The existing six-cover shelf is independent and currently rotates through 30 albums.
- Daily change is derived from the date in the site’s chosen timezone, not a browser refresh or a new publish. A release date, removed/blocked source, or failed cover loads should trigger an audit instead of silently substituting another version.
- Current state: 30 sourced album cover entries and their live catalog track lists. There is **no checked 200-recording editorial manifest** yet, and no claim that 200 finished song pages exist.

## Next evidence gates

1. Check the three visual cases in desktop and narrow detail views and revise any low-contrast or derivative effect.
2. Audit the other 27 sleeves one by one before calling all 30 visually finished. Record their edition and design source, or label a motif as a direct observation when no maker interview is available.
3. Build and check the 200-recording manifest in small album batches. Log failed album lookups, duplicate versions, missing previews and wrong covers; do not publish unreviewed candidates as recommendations.
4. Run user-side sharing and listening QA without creating a test post under the owner’s name. If a real user confirms a video URL, embed it immediately; YouTube candidate search remains optional.
