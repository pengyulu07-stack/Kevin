# AILLEURS work ledger

This file tracks requested behavior separately from work that has been verified on the public site. A local build is not a release.

## Current release goals

- [x] Main page opens on Music with the paper calendar and other rooms available in the same daily spread.
- [x] Home, Following, Library navigation; Film, Art, Books, Daily Life, and Forum can receive posts.
- [x] Daily Top 5, monthly/weekly rankings, all-time chart, song gallery, all-song list, votes, six reactions, comments, and private groups.
- [x] Title-only song sharing; audio or platform link and personal cover are optional.
- [x] Expand built-in music genres to 44, grouped by family; publish form, follow controls, chart selection, and database validation share the same IDs.
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

### November 9 discovery and navigation pass

- [x] Put appearance, chart designs, language, account/playback, and help under one clear Preferences menu. Keep notifications and account visible.
- [x] Add a visible related-song entry beside songs on the daily spread and full feed; open the existing discussion without a second page.
- [x] In song discussion, show other shares by the same artist first, then score related shares by listener overlap, shared note words, genre and language. Explain each connection.
- [x] Avoid duplicate title-and-artist entries in related lists. When no reliable relationship exists, label the fallback Recent shares rather than calling it a recommendation.
- [x] In Following, recommend songs using liked artists, co-likes and share notes, deduplicate versions, and keep followed-chart new songs separate.
- [ ] Verify these changes on the public GitHub Pages release after publication. Test Following with a signed-in member who has likes.
- [ ] Recommendations still use shares and votes on this site. Cross-platform catalog recommendations, full audio matching, and a complete artist discography are not built.

### November 9 pass

- [x] Search several relevant Apple Music storefronts together, then try MusicBrainz recording metadata when no exact title/artist match is found. Throttle repeated fallback requests within each visitor's browser.
- [x] Show up to six artist/album candidates for ambiguous song names; choosing one fills the artist and previews its cover. A clear title/artist match can fill automatically.
- [x] Filter unrelated search hits, clear the previous cover and results when a title changes, and keep title-only publishing available when neither catalog knows the song. Checked common, ambiguous, and unmatched names in a browser.
- [x] Verify the published page loads the new metadata search control and script version. It is metadata matching, not guaranteed full-track audio; catalog gaps remain, especially for regional releases.

The lookup follows the [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) for storefront results, [MusicBrainz recording search](https://musicbrainz.org/doc/MusicBrainz_API/Search) for a second catalog, and the [Cover Art Archive API](https://musicbrainz.org/doc/Cover_Art_Archive/API) for release artwork. The fallback is throttled according to [MusicBrainz rate guidance](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting). These sources provide metadata and artwork; they do not promise a playable recording.
- [x] Keep a small player on the page for uploaded audio and confirmed SoundCloud tracks or sets, with previous/next controls and a playable-list queue. Verified an older uploaded track plays on the local site.
- [x] Show Play only for a confirmed in-site source; SoundCloud search URLs are labeled Find. Show Play available only when a chart or list has at least one playable item.
- [x] Let a playlist be shared with a source link and title before its tracks are entered. SoundCloud set links can use the in-site player; other platform links open their source.
- [x] Show genre, same-artist, and related DAYTONE shares from a song card; connect Following to liked artists and their songs.
- [x] Add small tilted poster images to each room's daily header, with separate room colors and shorter empty-state text.
- [ ] Verify this release on the public GitHub Pages URL after publication.
- [ ] Automatic title-only artist/cover lookup and exact-version playback remain incomplete. Playlist links are not yet expanded automatically into individual songs.

### November 8 pass

- [x] Put SoundCloud, QQ Music, and NetEase Cloud Music search or source shortcuts beside songs on the daily chart, gallery, and full song cards.
- [x] Separate a cover that can play on this site from a title-only share that must be found on a music service; verify a stored audio share opens the in-page dock.
- [x] Refresh the daily spread and Library after a member publishes a song, post, reply, reaction, or author edit, without requiring a manual browser refresh. Refresh cached daily data when a visitor returns to the tab.
- [x] Keep expanded archive dates open when the daily spread refreshes.
- [ ] Test posting and commenting with two signed-in accounts on the public release. Same-page refresh is implemented, but active cross-user realtime updates are not yet implemented.
- [ ] Automatic title-to-exact-recording matching and in-page playback for QQ Music / NetEase Cloud Music still require supported source access and version confirmation; search shortcuts do not imply playback.

### November 6 pass (published November 7)

- [x] Threaded replies record the parent comment in song and forum discussion; a reply shows the person it addresses. @ inserts a visible mention in the composer.
- [x] Song and forum comments have separate likes; a comment shows when the share's author liked it. Database tables and RLS were migrated.
- [x] Member profiles show public song/post history and follower counts; members can follow each other. Following lists followed members and their recent songs.
- [x] Music discussion offers other DAYTONE shares by the same artist and in the same chart. The artist shortcut scrolls to those recommendations.
- [x] Library distinguishes liked songs from all public shares, with a grid/list switch. Song votes link to Likes. Unconfirmed sources are labeled Find.
- [x] The first dark color pass uses warmer ink and room accents; the hero takes less vertical space, and the 44-chart follow form stays closed until requested.
- [ ] Test the new comment and follow writes with two ordinary accounts; test reply notifications and deep links.
- [ ] Audit responsive layout and design preferences with users. The ten designs are shared templates, not ten bespoke designs for each category.
- [x] Verify public GitHub Pages deployment and a fresh browser load for this pass.
- [x] Make Library covers open listening and titles open the discussion, with visible action labels.

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
