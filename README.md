# DAYTONE

Public site: https://pengyulu07-stack.github.io/Kevin/

DAYTONE is a free music sharing and discussion site with English and Chinese interface options. Visitors can register with a six-digit ID, password, and nickname; select a date on a paper calendar; share songs and playlists; join private groups; and discuss forum posts. The header's **How to use** button gives a short guide in either language.

## Current features

- Music has a public chart, built-in and member-created category charts, language charts, all-time charts, and private groups. Members can follow up to two charts beside the calendar.
- Each account can share up to eight songs per category and language chart each day. A song can appear in one to three categories. The title is required; artist, note, link, audio, and cover are optional.
- The daily music Top 5 is ranked by support. Top 1–3 show rotating covers, while Top 4–5 show names and copy buttons. All songs remain in the full list.
- Permanent playlists can include a name, cover, platform link, and reviewed track list. Platform links alone cannot reliably import every song, so track names must be pasted or entered.
- Members can create up to three public music categories and can edit their own songs, playlists, forum posts, and replies after publication. Existing reactions and replies stay attached to the edited item.
- Private groups require a code and password and are visible only to joined members. The forum has a daily ranking and a chronological full list.
- Settings cover a rotating or personal entrance background and notification preferences. Daily Life, Film, and Art are shown as future rooms.

Images up to 15 MB are compressed below 1 MB before upload; GIFs must already be below 1 MB. Audio is limited to 8 MB. Share only material you have permission to publish. There is no email password recovery, so members should keep their login details safe.

## Source and hosting

GitHub Pages serves the files in this repository's `main` branch root. Supabase provides Auth, Postgres, and Storage. `config.js` contains a browser publishable key. Never place a database password or service role key in client code. `schema.sql` and `migrations/` document the database rules; the newer migrations have been applied to the live project.

Free hosting and storage have limits. Back up source and database/media. No free provider can guarantee that one URL will work unchanged for ten years.
