# DAYTONE

Public site: https://pengyulu07-stack.github.io/Kevin/

DAYTONE is a free music-sharing and discussion site. Its interface is in English. People can choose a date on the paper calendar, enter a daily room, share songs, and start forum conversations. Daily Life, Film, and Art appear as upcoming rooms.

## For visitors

- Create an account with a six-digit ID, password, and nickname. Use the same credentials on another device. There is no email recovery, so keep them safe.
- Share up to three songs per day. Only the song title is required. Artist, note, audio, music link, and cover image are optional.
- Share up to three forum posts per day. Only the forum title is required. A photo, body text, link, and post type are optional.
- Comment with text or a photo and respond with one of six reactions: 👍 👎 🐶 ❤️ 😭 🤮.
- The music gallery shows today's Top 5 songs by 👍 and ❤️ support. Top 1–3 show rotating cover art; Top 4–5 show only title, contributor, and a copy button. The full music list groups songs by contributor.
- The forum entrance shows the Top 3 by discussion activity (two points per comment, one per reaction). The full forum list shows every post from the selected date, newest first.
- Still images up to 15 MB are compressed in the browser to about 1 MB before upload. GIFs must already be under 1 MB. Audio is limited to 8 MB.

Share only audio and images you have permission to publish. External music links depend on the original platform.

## Technical notes

GitHub Pages hosts the static files in the public `main` branch root. Supabase project `wzgsutbopmfbcxhvvqkv` provides Auth, Postgres, and Storage. `public/config.js` contains a browser publishable key; never put a database password or service role key in client code. Database rules are in `schema.sql` and `migrations/`.

Run the local build with `node scripts/build.mjs`, then serve `dist/`. The published site uses the files in `dist/` at the repository root.

Free hosting and storage have limits. The site owner should keep a backup of this source and the database/media. No free provider can guarantee that one URL will work unchanged for ten years.
