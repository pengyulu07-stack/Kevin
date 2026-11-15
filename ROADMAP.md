# AILLEURS work ledger

This file tracks requested behavior separately from work that has been verified on the public site. A local build is not a release.

## Current release goals

- [x] Main page opens on Music with the paper calendar and other rooms available in the same daily spread.
- [x] Home, Following, Library navigation; Film, Art, Books, Daily Life, and Forum can receive posts.
- [x] Daily Top 5, monthly/weekly rankings, all-time chart, song gallery, all-song list, votes, six reactions, comments, and private groups.
- [x] Title-only song sharing; audio or platform link and personal cover are optional.
- [x] Expand built-in music genres to 44, grouped by family; publish form, follow controls, chart selection, and database validation share the same IDs.
- [x] Build ten chart-style experiments; retire their settings entry because the changes were hard to notice in the main reading path.
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

### November 15 source-led work details

- [x] Open the six daily Music, Film, Art and Books cards inside the site instead of immediately leaving for their source pages. Keep the verified source as an explicit link in the detail view.
- [x] For albums, load the catalog track list when available. In the detail view, three verified MM..FOOD videos play in place and other catalog tracks use an in-page preview only when the catalog supplies one. Keep copying a song title as a compact option. Art and Books show their museum/work records in the detail view.
- [x] Cache source-checked text for the twenty Art works because the museum's live API did not return in the published browser. Add a sourced cover story and review entry for MM..FOOD as the first researched album example.
- [x] For The Cabinet of Dr. Caligari, add a BFI-grounded production/design note, the poster and two Commons film stills by default, and three more stills behind an expand control. Show the images in the detail view with a local enlarge control; collect their source record in the top More about menu.
- [x] Show short attributed readings of the Pitchfork and BFI criticism next to member discussion; give the public-domain Dorian Gray a short, expandable preface passage, with source links in the top More about menu.
- [x] Rework the detail layout so the cover, proportionate title, on-page sections, images, tracks and discussion are the main path. Put outside sources under a category-specific More about menu. Show three verified MF DOOM video choices on the page and use an embedded player after a click.
- [x] Change the six daily cover cards' visible and accessible action labels to View details. Their ordinary click opens the work on this site; the source remains available in the detail menu.
- [x] Add one-photo member comments to editorial works using the existing restricted image bucket; allow a photo with or without text, preview it before posting and refresh discussion after posting. The database migration is applied; a full signed-in upload-and-display check is still pending.
- [ ] Curate sourced background and cover-design stories for each work, plus 2–3 verified film stills by default and 5–6 images when expanded. Do not label repeated sizes of one image as process photos.
- [x] Add persistent likes and member comments for editorial works; refresh their counts and discussion in place, and sync their bylines when a member changes nickname. Put sourced Pitchfork and BFI perspectives next to discussion in the two researched examples. Public UI confirmed the like/unlike count; comment submission awaits a non-public test account.
- [ ] Curate attributable criticism for the other works and check quotation rights and source context for book excerpts and reviews. Search links are discovery tools, not curated criticism.
- [x] On the public site, open Music, Film, Art and Books detail views. Confirm the album track list, three MF DOOM choices, actual YouTube playback, film still loading and enlargement, close stopping playback, Chinese copy, and the narrow source menu.
- [ ] Test a signed-in comment with a photo through upload, public display and deletion, then read it from a second visitor session. The form, database constraint and storage path policy are in place, but this end-to-end check has not been done.

### November 9 discovery and navigation pass

- [x] Add six visible, source-linked album covers for each selected Music date and six film posters/stills for each Film date in the space selector. The Music pool contains 20 confirmed album catalog entries, including MF DOOM; the Film pool has 17 distinct films. A seven-position daily step gives neighboring dates six different cards in either room. Keep shared images in the separate date header.
- [x] Give Art and Books their own twenty-item, source-linked image pools and six works for each selected date. Art uses CC0 museum records; Books uses Open Library covers and work links. The selected room also supplies the angled images at the calendar edge, so Art and Books no longer borrow Film imagery.
- [x] Verify the public page on November 15 and 16: Art and Books each show six room-specific works and the next date has no repeated cards. All six images loaded for Art on November 15 and Books on both dates. Check the three-column narrow layout visually and the Chinese heading, then restore the previous language setting.
- [x] Repair the Film/Art/Books/Daily/Forum daily-list renderer so updating its corner prints does not make the whole list show an error.
- [x] Localize the new six-print heading, and the space hint and daily room empty states, in the Chinese interface.
- [x] Verify the published page shows all six Music covers and all six Film prints on November 15, with loaded images; selecting November 16 changes the six Film picks. Check the dark desktop layout and the three-column narrow grid without horizontal overflow. The Film list now shows its normal empty state instead of an error.
- [x] Verify the enlarged November 16 Film selection uses six different posters from November 15 and all six images load on the public page. Switch the public site to Chinese to verify the new dated print heading and room hint, then restore the previous English setting.
- [ ] These curated visual picks are not yet personalized music/film recommendations or proof of in-page playback. Check the enlarged Film pool and several later dates on the published page and a real phone before calling long-term artwork availability verified.

- [x] Keep language, account/playback, and help under Preferences. Remove the two low-value design entries; the cinema entrance still has its own background control when opened.
- [x] Add a visible related-song entry beside songs on the daily spread and full feed; open the existing discussion without a second page.
- [x] In song discussion, show other shares by the same artist first. Put songs with shared note, genre and language signals under Related songs; put co-liked songs under Listeners also supported so a common voter alone is not presented as proof of musical similarity.
- [x] Avoid duplicate title-and-artist entries in related lists. When no reliable relationship exists, label the fallback Recent shares rather than calling it a recommendation.
- [x] In Following, recommend songs using liked artists, co-likes and share notes, deduplicate versions, and keep followed-chart new songs separate.
- [x] Verify the public GitHub Pages release shows Preferences, the daily-spread discovery link, and a related-song list with reasons. No browser errors were observed.
- [ ] Test Following recommendations with a signed-in member who has likes and followed charts; this personalized path has not had a live member check.
- [x] Add a clearly labelled external same-artist shelf from the Apple Music catalog, with direct catalog links and a separate SoundCloud search shortcut. It does not claim that a SoundCloud result is an exact match or that the song plays here.
- [ ] Music similarity still uses shares and votes on this site. External related-artist discovery, full audio matching, and a complete discography are not built.
- [x] Replace the indistinct daily header backdrop with three tilted, individually visible prints. Prefer shared album covers or post images; use sourced film posters and stills as dated fallbacks. Each calendar date selects a different fallback combination, and each image exposes its title/source.
- [x] On the public desktop page, checked that shared covers and the sourced fallback images load, the corner arrangement is legible, and selecting the next calendar date changes the poster. No browser errors appeared in this check.
- [ ] Check the corner arrangement on a narrow/mobile screen and with more than two new shares on one date.

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
