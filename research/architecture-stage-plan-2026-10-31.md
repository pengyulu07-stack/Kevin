# DAYTONE: five-stage rebuild

## The decision

Music remains the first thing people can use. The calendar is a date filter and archive, not a required entrance. Two presentation modes show the same posts and rankings: **Edition** places the calendar beside the day; **Scenes** starts with a horizontal room strip and puts the calendar farther down. A room click opens its full feed. Dates, votes, and discussion data do not change when the presentation changes.

The first screen should answer three questions without a tutorial: *what is here today, what can I do with a song, and where else can I go?* Each music row therefore exposes listening, support, discussion, and copy as separate actions. A cover is an obvious listening target. The permanent chart stays distinct from a selected day's Top 5 and the month/week chart.

## Work order

1. **Structure and navigation** — two presentation modes; calendar and controls scroll together; direct music actions; room carousel with arrows and native horizontal swipe; compact discussion. This stage is implemented in the local and public site.
2. **Listening path** — let a member select a preferred service, then use a verified service URL when available. Keep guest previews and first-party shared audio. A music account cannot be considered signed in merely because an external page was opened; only a provider-supported authorization flow can confirm that. The service, region, and subscription decide whether full playback is available.
3. **Music discovery** — bring followed charts to the first page, clarify genre versus language, improve title-to-recording matching and artwork metadata, and show permanent charts without repeating the same songs in each opening panel. Make every automatically filled field reviewable before publishing.
4. **Visual collection** — use a small, carefully credited set of real album, film, art, and book imagery with rights appropriate for public display; build distinct page palettes and typography. Add a restrained preset collection and a predictable settings preview before expanding it by genre. User posts and ranking data should remain legible over imagery.
5. **Polish and operation** — account-sync presentation settings, tune motion and keyboard access, test notifications and author moderation, and test with desktop users who have never seen the site. Refine presets and category counts from those observations.

## Evidence behind the first-stage choices

- [GOV.UK Design System: Tabs](https://design-system.service.gov.uk/components/tabs/) recommends tabs for closely related, clearly labelled sections and warns against hiding content users need to compare. DAYTONE keeps the most useful music content on the opening screen; the room strip is navigation, not a tab that silently hides the whole page.
- [W3C WAI: Carousel Tutorial](https://www.w3.org/WAI/tutorials/carousels/) calls for explicit controls and keyboard access. The room strip has previous/next buttons and retains native horizontal scrolling. It does not advance automatically.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) supports turning decorative movement off for visitors who request reduced motion.
- [Apple MusicKit](https://developer.apple.com/musickit/) and [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) document provider-controlled playback and authorization. They do not establish a way for a third-party site to obtain unrestricted full streams from a song title alone.
- [Apple Music Browse](https://music.apple.com/us/room/6456176470) demonstrates a much broader genre taxonomy. Copying every label into the first screen would make selection harder, so the public chart and followed charts remain the entry points while the full taxonomy is designed in stage 3.

This is a design decision ledger, not a claim that hundreds of pages or GitHub repositories have been read in detail. Each later stage should add sources only where they change an implementation decision.
