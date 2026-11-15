# Daily cover and print sources

The six Music cards shown for a selected date are editorial album discoveries. Their artwork and album links come from the [Apple iTunes Search API](https://performance-partners.apple.com/search-api). Each card opens that same album's Apple Music catalog page; the artwork is loaded from Apple's image service and is not stored in this repository. The static metadata and catalog links are in `src/editorial-covers.js`. These cards do not claim that a particular recording can play on AILLEURS.

The six Film cards rotate among seventeen distinct films. Three earlier poster files and four film stills were documented in the earlier asset pass. Ten further poster sources are:

- *The Gold Rush* (1925): [Wikimedia Commons source and public-domain information](https://commons.wikimedia.org/wiki/File:Gold_rush_poster.jpg).
- *Sunrise: A Song of Two Humans* (1927): [Wikimedia Commons source, license and attribution](https://commons.wikimedia.org/wiki/File:Sunrise_-_A_Song_of_Two_Humans.jpg). The poster scan is attributed there to Breve Storia del Cinema; the reproduction is under CC BY 2.0.
- *Vertigo* (1958): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Vertigomovie_restoration.jpg), a restoration of Saul Bass's poster.
- *The Kid* (1921): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:The_Kid_(1921)_poster.jpg).
- *The Passion of Joan of Arc* (1928): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:The_Passion_of_Joan_of_Arc_(1928)_English_Poster_(cropped).png).
- *Battleship Potemkin* (1925): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Vintage_Potemkin.jpg).
- *A Trip to the Moon* (1902): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Trip-to-moon-1902.jpg).
- *Safety Last!* (1923): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Safety_last_poster.jpg).
- *The Third Man* (1949): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:The_Third_Man_(1949_American_theatrical_poster).jpg).
- *The Night of the Hunter* (1955): [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:The_Night_of_the_Hunter_(1955_poster).jpg).

The film cards open their corresponding image or film source pages. Wikimedia images load from Commons instead of being copied into this repository. Shared members' own uploaded images may appear in the separate date header, but do not replace the six editorial cards. The picks rotate deterministically by calendar date so everyone sees the same selection for a given day. The twenty music and seventeen film candidates are advanced by seven positions each day, giving adjacent dates six different cards. These are visual discoveries, not recommendations inferred from a member's tastes.

The Art room now has twenty selected works from the [Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/). Each selected record was checked for `share_license_status: CC0`, an image URL, an artist or cultural attribution, and a link to its museum record. The room displays six works for the selected day, including paintings, prints, photography, sculpture, and decorative art from several traditions. The images are loaded from the museum's open-access CDN, rather than stored in this repository. Source details for individual works are in `src/editorial-covers.js`.

The Books room now has twenty selected covers with exact title and author metadata checked against the [Open Library Search API](https://openlibrary.org/dev/docs/api/search). Images use the [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers); each card links to the corresponding work record, as Open Library requests for publicly displayed covers. Covers may depict one edition of a work rather than its first edition. These are cover discoveries, not claims that the book can be read on this site. Art and Books each advance their twenty-candidate pool by seven positions per date, so adjacent dates have six different works. The selected room's images also supply the angled prints near the calendar preview.
