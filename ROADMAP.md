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
- [x] Keep pasted playback links separate from catalog metadata. When the member explicitly chooses an Apple Music recording and has not supplied another link or uploaded audio, save that exact track link with the share.
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

### November 16 pass (published and checked in the public browser)

- [x] Split *Mm..Food* into a short introduction and expandable, source-linked chapters on the album concept, production, sleeve and later editions. These are original summaries of checked sources, not copied encyclopedia text.
- [x] Replace the repeated single critic note with a sourced AllMusic/Pitchfork contrast about the disputed middle section; cover edition history in the expandable chapter instead.
- [x] Replace the work page's mixed source menu with titled further reads; keep image licenses with the image captions. Remove the misleading DOOM interview link that was actually about *Madvillainy*.
- [x] Move track preview to a cover hover/focus/touch play control and a compact player below the list. Remove the duplicate per-track Play buttons; retain three embedded YouTube choices in Listen here.
- [x] Replace the visible Forum room in the calendar and cinematic entrance with News. Keep historic forum posts and their routes in Library/notifications instead of deleting member data.
- [x] Add six News categories (Music, Film, Art, Books, Earth, Space), six source-checked on-site stories, large article images, progressive vertical browsing, original-source links and a separate Google search option. The date shown is the article or feature date, not an automatically generated site edition.
- [x] Check the public GitHub Pages page after publication: the News room and article dialog open, all six article bodies contain 301–321 English words, the selected room stays visible in the horizontal selector, and an *Mm..Food* track preview plays on the page through the compact player.
- [ ] Establish a reliable daily collection, verification and editorial publishing workflow. Static six-story seed does not fulfill the daily-update requirement; it must not be presented as automatic news.
- [ ] Expand researched work histories, reviews, and useful further reads beyond *Mm..Food* to other albums, films, art, books and member shares. Six curated examples per room are only the cover selection, not six fully researched work pages.
- [ ] Verify the refreshed site in an actual desktop and mobile browser, including media loading, category controls, modal keyboard navigation and a signed-in photo comment.

### November 16 continuation (published and checked in the public browser)

- [x] Add a version-checking catalog preview step to every music share without an embedded player. Search the Apple catalog for the same title in CN and US, display up to three recording choices with artist and album, and play a selected 30-second sample on site. A search match is not treated as the contributor's chosen version or a full track.
- [x] Add researched, expandable work histories to *Homogenic* and *Kind of Blue*, with titled further reading and a sourced outside interpretation. Their full catalog tracklists and 30-second cover previews remain on the same page.
- [x] Add source-linked depth beyond music: Hokusai's *South Wind, Clear Sky*, *The Picture of Dorian Gray*, and *The Cabinet of Dr. Caligari*. Preserve the original image or film frames, on-site discussion and clear edition/source limits.
- [x] Public browser checks: *Homogenic* loaded 10 tracks and its Hunter preview actually played; *Kind of Blue*, Hokusai, Wilde, and *Caligari* opened their new chapters; the film retained six frames. A user-shared Benny Goodman song returned three distinct version-labeled catalog previews, and clicking one played it in the site dock.
- [x] Keep the contributor's chosen original service link visible in the listening dialog, but fold other-service search shortcuts under one expandable control. The catalog returned no matching preview for the Chinese shares *寄我浮生* and *传奇* in this check; those entries still need an authorized playable version chosen by the contributor.
- [ ] Curate the remaining music albums, films, art and books one by one. Catalog metadata alone does not fulfill the researched-detail requirement; do not generate an unverified creative history from a search result.
- [ ] Provide confirmed full-song or video versions for more music shares at publication, with contributor review of the exact recording. A title match and an iTunes preview are only partial listening access.

### November 16 evening continuation

- [x] Correct the News room button's accidental page-wide `.welcome` styling so it stays beside Daily Life.
- [x] Set the edition boundary: curated covers begin November 8, while public music shares begin November 17 after the owner asked to open sharing immediately. Hide the 40 earlier song rows from public song lists, charts, library, member profiles and related-song queries. Preserve their 24 votes and 15 comments for owner review in the database.
- [x] Add Politics and Technology to News, alongside Music, Film, Art, Books, Earth and Space. Add a daily source brief list above the edited long reads.
- [x] Collect 2–4 current source briefs per topic from dated RSS, retaining publisher, date, image and original URL. Do not call an RSS excerpt a full edited story.
- [x] Add a signed-in reader link suggestion form. Submissions go privately to the existing owner feedback inbox, with category, URL and optional note.
- [x] Add a scheduled morning collector and document the editorial gate in `NEWS_PIPELINE.md`. The page shows the last successful edition date if today's collection is not available.
- [x] Local browser check: News sits directly beside Daily Life; eight topic tabs appear; Space has two source briefs, and one opens in a site dialog; November 7 shows no cover cards, November 8 shows six; November 16 has no public songs.
- [x] Observe the first scheduled GitHub Actions run on November 17: the source-brief workflow and following Pages build both succeeded. The workflow began at 12:35 Shanghai time, later than the scheduled morning window; verify the public page after this release separately.
- [x] Reserve one Politics brief for a recent China report from the China desk feeds; fail the collector rather than publish a new edition without one. The November 17 local edition includes the China-marked Guardian report on the proposed Xi–Trump–Putin meeting.
- [x] Add on-page likes and comments to source briefs and edited News articles, with in-place updates and author comment deletion. Add a three-story shelf inside each topic, ordered by onsite likes and comments with a clearly labelled date fallback before readers interact. Signed-in write and cross-account checks are still pending.
- [ ] Write and check more 300–450-word original articles, two to four per topic per day. The automatic source briefs are deliberately shorter and do not satisfy the full editorial article target.
- [ ] Complete the remaining deep work pages, contributor-confirmed playback, richer recommendations, calendar and gesture polish, responsive and signed-in end-to-end QA from the existing backlog.

### Full open-work audit, November 17

The short completion report for any single release is not the full product checklist. Earlier song rows may stay in the database; hiding them from the new public edition is sufficient for now. The following items remain open unless a later entry records an actual public check:

**Current priority decision:** The owner deferred the per-topic daily 300–450-word News article target and the separate editorial guarantee for a China politics article during source outages. Keep the existing dated source briefs and their visible edition status, and do not describe the deferred targets as complete. The daily source collector's China brief rule remains a distinct implemented feature.

- [ ] **Daily News:** 2–4 fully researched 300–450-word articles in each topic every day; an editor/reviewer pipeline with source comparison, corrections, licensed images, and a dependable morning publication time. China desk selection needs ongoing editorial classification and a failure alert. Test a signed-in news like, comment, delete, and the resulting Top 3 order from a second account.
- [ ] **Music playback:** contributor-reviewed exact YouTube/Bilibili versions during sharing, a playable on-page choice panel and full-song playback where permitted; distinguish that from 30-second catalog previews and external search. Improve SoundCloud-first source selection, QQ Music/NetEase labels and supported playback, playlists and daily-list imports, play-all queues, and source availability recovery.
- [ ] **Work pages:** source-backed creative histories for the remaining albums, films, artworks and books, including cover authorship, process, stills and artist/author photographs, track lists or book excerpts where licensed, useful outside criticism and member photo discussion. Keep the main path on site with clearly named further reading.
- [ ] **Discovery:** evidence-based similar songs and artists beyond shared genre labels and the site's small vote pool; catalog breadth, same-artist discography, reasons for recommendations, followed artists/charts and a usable daily discovery list. Verify personalized suggestions with signed-in members.
- [ ] **Navigation and design:** physical trackpad gesture testing; safe horizontal room switching without accidental vertical navigation; calendar hover, contrast, date-change and loading polish; mobile and keyboard checks; coherent settings locations and user-visible effects; documented visual references and ten genuinely distinct designs per music category.
- [ ] **Community and freshness:** cross-account posting and comment refresh, realtime updates when another person acts, reply notifications and direct links, profile/follower flows, Library Likes/Following/Your shares/All shares, private-group use, moderation, and photo upload/display/deletion. Confirm each with ordinary accounts instead of treating an implemented button as proof.
- [ ] **Operations:** monitor RSS failures, stale dates, link/image expiry and Pages delay; test privacy, storage, performance and accessibility on desktop and an actual phone. Keep a current source-and-rights record for editorial material.

### November 17 music sharing continuation

- [x] Add a link-first input for pasted song URLs and copied share messages. Recognize a single direct link and clear `《title》` / `歌手：name` hints without silently guessing ambiguous title–artist order; route playlist links to the existing playlist flow.
- [x] Read public Spotify, SoundCloud and Apple link metadata automatically after typing or pasting, while preserving member-edited title and artist fields. Keep cover selection and catalog candidates reviewable.
- [x] Deploy a signed-in, YouTube-only oEmbed lookup function to retrieve a video's public title, channel and thumbnail without exposing a generic fetch proxy. Show the channel separately from the actual song artist.
- [x] Let a contributor preview an embeddable selected link inside the share form; retain explicit confirmation for a YouTube video version.
- [x] Use an on-site Apple Music embed when the shared Apple link has a supported embed shape. Platform login and licensing may still restrict full playback.
- [x] Make a typed or pasted song title search the Apple catalog automatically; show recording, artist and album choices with an on-page 30-second sample button. A sample does not imply the contributor's exact full-length version.
- [x] Show an optional, attributed Wikipedia background excerpt in the composer and song discussion only when a page matches both title and artist. This is source context, not an invented creation story; songs with no reliable match remain blank.
- [x] Build and deploy a signed-in YouTube Data API search endpoint with up to ten embeddable video choices, click-to-preview and explicit version selection in the composer. The endpoint requires a server-side `YOUTUBE_API_KEY` that is not yet configured; its live UI currently falls back to clearly labeled YouTube and Bilibili search links.
- [ ] Verify a real signed-in publication and second-account view, including the new YouTube lookup, saved cover, category suggestion and same-page refresh. The November 17 date gate has been removed; a production post under the owner's account has not been made solely for testing.

### November 17 sharing opened for owner review

- [x] Remove the November 18 block from the music composer and publication path. Align public songs, archive, library, member profiles, charts and related queries to the November 17 edition. The public browser opens Share a song while signed in as the owner.
- [x] Preserve the exact Apple Music track selected in the song composer when no different source is supplied; the published listening dialog checks that track ID before falling back to title and artist catalog search. A 30-second preview remains distinct from a full recording.
- [x] Add optional, cited Wikipedia introductions inside Film, Art and Books post composers and details when title, creator and work type match. Add the same source path to unresearched system film, album and book detail views. Verified The Third Man in the public Film form and poster detail; a researched introduction is not a substitute for individually edited cover history, stills or criticism.
- [ ] Confirm a published song, generic post, photo comment and News suggestion from separate ordinary accounts, then verify immediate redraw, remote visibility and failure messages. Empty-form and form-opening checks do not prove database writes.
- [ ] Complete per-work editorial research and visual records for all six daily system picks in Music, Film, Art and Books. Several works still have only a catalog summary, cover/poster, one image, or no reviewed outside criticism; their detail pages do not yet match Mm..Food.
- [ ] Configure the server-side YouTube search credential and check candidate, embed and version confirmation on the public share form. Until then, the form offers a labeled YouTube search link and can embed a specific pasted YouTube URL, but does not auto-list video candidates.

### November 18 share quality continuation

- [x] Show up to ten catalog recording candidates after entering a song title, and require the contributor to select the exact artist and album. Keep the candidates visible for comparison, offer available 30-second iTunes previews, and fill album, cover, genre and an editable factual note only after selection.
- [x] Separate the selected YouTube or Bilibili video from the original music link, keep explicit video confirmation, and prefer the selected video when a listener plays the song here. The server endpoint now requests up to ten YouTube candidates; automatic results still require the missing server-side key.
- [x] Add optional Wikimedia Commons photo candidates of the confirmed artist to the music composer. Up to four credited, license-labeled photos are selected by default when found; the contributor can change the selection, up to six, and the chosen photos appear on the published song discussion. The search only accepts files whose names contain the artist and have a file page and machine-readable license. This is not a guarantee of four suitable photos for every artist or of verified concert/creation context.
- [x] Reuse the credited photo search on system music album pages and show up to five additional artist images when the Commons catalog returns them. For Madvillain, the search uses its two documented members, MF DOOM and Madlib. Album-cover process pictures still require individual research and availability checks.
- [ ] Verify the Commons search, candidate selection, album and video fields, preview, publication and displayed gallery in the public browser. Do not publish a test share under the owner's account without a real choice from the owner.
- [ ] Add a sourced, individually reviewed music introduction that leads with the song's content and compelling features, then its creative context and any meaningful honors. A catalog title/album/year sentence and a Wikipedia excerpt are only a first draft, not an editorially complete note.
- [ ] Verify that each of the six daily system music recommendations actually has at least five distinct, relevant extra photographs. Automated Commons search is an aid, not a substitute for individual selection or a guarantee of five; some album-art process photos may be unavailable under a reusable license.
- [ ] Add the requested day/week music browsing switch while leaving the calendar day-based. Defer the monthly Film/Art/Books redesign until the music sharing path is dependable, per the owner's priority.

- [x] Add local previews for a selected song cover, uploaded song audio and Film/Art/Books/Daily Life photo before submission. Reject unsupported file types and oversize files visibly before the member clicks Publish. Clear previews and release their temporary browser URLs when a form resets or closes.
- [x] Keep the Upload audio choice when catalog matching also finds an Apple track; an automatically suggested catalog link should not replace the member's chosen file.
- [x] Place iTunes preview attribution and a direct Apple Music source beside editorial track previews. The listening dialog also identifies a 30-second preview as a catalog sample, not the full song.
- [ ] Verify local image/audio file previews and removal in the published browser, then complete a real signed-in post, cross-account view and instant refresh check without publishing test content under the owner's identity.
- [ ] Configure and quota-monitor the official YouTube Data API key before claiming four live video choices. Bilibili does not yet have an equivalent vetted candidate source; its search button remains an external search.
- [ ] Replace source excerpts with checked, useful creative histories for individual songs. Wikipedia intros and catalog fields do not establish the origin, recording process or critical context for every song.
- [ ] Improve bulk playlist/day-list import, exact full-length source availability, SoundCloud-first discovery, member-specific auto enrichment and cover checks. This pass handles a single shared song link or copied message, not an entire list.

1. **Playback and posting:** Make the cover's first click start available audio or a confirmed embedded video with a stable small player. At posting, present several YouTube/Bilibili candidate videos so the contributor can choose the correct version. Show exactly what is playable on AILLEURS and where a platform opens in a new tab. Auto-match artist and album artwork from reliable metadata, with contributor review and override. Apply the same flow to older songs and playlists.
2. **Navigation and interaction:** Test a Mac two-finger swipe on a physical trackpad. Tune gesture thresholds, animation, loading state, and focus behavior against vertical reading and horizontal selector scrolling. Keep shortcuts visible without repeating the same list in several places. Make notification items open their exact post or reply.
3. **Visual design:** Research and document specific album, cinema, print, and editorial references. Build ten genuinely distinct designs for each music category, including chart, calendar, gallery, type, and accent choices; the present ten designs are shared base templates, not this finished library. Let visitors choose a default design and room display mode, with an accessible high-contrast option.
4. **Community and discovery:** Improve playlist imports and long-term lists; category browse, language charts, Following, private groups, replies, saves, search, and user profiles. Preserve per-category daily publishing limits and edit rights. Evaluate which features help a visitor find and discuss a song instead of adding redundant controls.
5. **Administration and release:** Improve the owner's moderation view, quick posting tools, and a secure way to work with the owner's multiple accounts; maintain clear account boundaries. Audit privacy, storage, performance, keyboard access, mobile layout, and GitHub Pages deployment. Do not describe generated sample activity as independent real visitors.

## Release checks

- Local syntax/build and desktop visual check.
- Verify migrated genre IDs in Supabase without weakening existing access rules.
- Publish the exact source files to `pengyulu07-stack/Kevin` and verify the public URL with a fresh page load.
- Report completed items, remaining limits, and an approximate percentage for the full requested product. Do not count research or a prototype as a finished feature.
