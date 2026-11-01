# DAYTONE work ledger

This file tracks requested behavior separately from work that has been verified on the public site. A local build is not a release.

## Current release goals

- [x] Main page opens on Music with the paper calendar and other rooms available in the same daily spread.
- [x] Home, Following, Library navigation; Film, Art, Books, Daily Life, and Forum can receive posts.
- [x] Daily Top 5, monthly/weekly rankings, all-time chart, song gallery, all-song list, votes, six reactions, comments, and private groups.
- [x] Title-only song sharing; audio or platform link and personal cover are optional.
- [x] Expand built-in music genres from 14 to 34, grouped by family; publish form, follow controls, chart selection, and database validation share the same IDs.
- [x] Add ten selectable baseline visual styles per music chart; each chart stores its own local choice.
- [x] Two-finger horizontal gesture switches the whole daily room; vertical reading and the room selector's own scrolling stay independent.
- [x] Add visible YouTube and Bilibili search links for every song on the daily spread, gallery, and full song cards.
- [x] Verify the genre, chart design, and video search release on the published GitHub Pages URL.
- [x] Keep album details separate from the playback source: selecting catalog metadata no longer silently creates an Apple Music listening link.
- [x] Require an unambiguous title and artist match before automatic artist/cover selection; retry the Chinese storefront when the first storefront has no exact match.
- [x] Make an unlinked song's listening options appear immediately; older Apple Music links open as a direct source instead of a slow preview frame.
- [x] Label cover and card actions as "Play" only when this site has an embeddable source or uploaded audio; otherwise show "Find". Show cover thumbnails beside catalog matches before a contributor chooses one.
- [x] Add source search shortcuts to the publish form, using the entered song and artist; the contributor can review and paste a specific YouTube, Bilibili, or SoundCloud version.
- [x] Wait for a returning member's nickname to load before opening the song form, avoiding a mistaken nickname prompt on a fast click after refresh.

## Next product passes

1. **Playback and posting:** Make the cover's first click start available audio or a confirmed embedded video with a stable small player. At posting, present several YouTube/Bilibili candidate videos so the contributor can choose the correct version. Show exactly what is playable on DAYTONE and where a platform opens in a new tab. Auto-match artist and album artwork from reliable metadata, with contributor review and override. Apply the same flow to older songs and playlists.
2. **Navigation and interaction:** Test a Mac two-finger swipe on a physical trackpad. Tune gesture thresholds, animation, loading state, and focus behavior against vertical reading and horizontal selector scrolling. Keep shortcuts visible without repeating the same list in several places. Make notification items open their exact post or reply.
3. **Visual design:** Research and document specific album, cinema, print, and editorial references. Build ten genuinely distinct designs for each music category, including chart, calendar, gallery, type, and accent choices; the present ten designs are shared base templates, not this finished library. Let visitors choose a default design and room display mode, with an accessible high-contrast option.
4. **Community and discovery:** Improve playlist imports and long-term lists; category browse, language charts, Following, private groups, replies, saves, search, and user profiles. Preserve per-category daily publishing limits and edit rights. Evaluate which features help a visitor find and discuss a song instead of adding redundant controls.
5. **Administration and release:** Improve the owner's moderation view, quick posting tools, and a secure way to work with the owner's multiple accounts; maintain clear account boundaries. Audit privacy, storage, performance, keyboard access, mobile layout, and GitHub Pages deployment. Do not describe generated sample activity as independent real visitors.

## Release checks

- Local syntax/build and desktop visual check.
- Verify migrated genre IDs in Supabase without weakening existing access rules.
- Publish the exact source files to `pengyulu07-stack/Kevin` and verify the public URL with a fresh page load.
- Report completed items, remaining limits, and an approximate percentage for the full requested product. Do not count research or a prototype as a finished feature.
