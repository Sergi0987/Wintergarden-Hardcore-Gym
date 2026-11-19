# Hardcore Fitness Winter Garden — website (draft v1)

A new multi-page website for Hardcore Fitness Winter Garden, 1401 Beulah Rd Ste 100.
Plain HTML, CSS and JavaScript. No dependencies; two small Node scripts keep pages and images up to date.

Live draft: https://sergi0987.github.io/Wintergarden-Hardcore-Gym/

## Pages

| Page | File |
|---|---|
| Home (live "next class" clock) | `site/index.html` |
| Classes (Lift, Fight Camp, Booty Camp) | `site/classes.html` |
| Schedule (day tabs + class filter) | `site/schedule.html` |
| Coaches | `site/coaches.html` |
| Events + 60-Day Challenge | `site/events.html` |
| Membership + FAQ | `site/membership.html` |
| Visit + free class form + map | `site/visit.html` |

## Edit the content

Class times, coaches, events and membership options all live in one file:
`site/assets/js/data.js`. After changing it, re-bake the pages:

```bash
npm run bake
```

The bake (`scripts/bake.mjs`) writes the menu, footer, coaches, plans, events, schedule,
search tags, link-preview tags, gym data for Google, `sitemap.xml` and `robots.txt` into the
pages, between `<!-- bake:… -->` markers. Never edit inside those markers by hand.
Shared HTML builders live in `site/assets/js/render.js`, used by both the bake and the browser.

At launch, set `gym.siteUrl` in `data.js` to the real domain and run `npm run bake`.

## Photos and logos

Originals live in `assets-src/` (not published). To add or replace a photo, put the original
JPEG in `assets-src/photos/` and run:

```bash
sh scripts/optimize-images.sh
```

It makes 640/1024/1600px WebP versions plus a JPEG backup, and right-sized WebP logos.
The share image and site icon are rendered from `assets-src/share/*.html`.

## Run it locally

```bash
npm run serve
```

Then open http://localhost:4321. `node scripts/screenshot.mjs` takes full-page desktop and phone
screenshots into `.shots/` (git-ignored).

The free class form needs `site/assets/js/config.local.js` (git-ignored). Copy
`config.local.example.js` and paste the ClubReady key in it.

## Presenting the draft

Pages show dashed **Draft** notes where real info is still needed.
Add `?clean=1` to any URL to hide them (for showing the owner). `?clean=0` brings them back.

The site uses the light palette only (owner's choice). Photo bands, the clock and the
footer stay dark on purpose.

## Free class form

The Visit page has our own styled form. It sends to ClubReady's web lead form
(`apiformsub.asp`) with the same field names as ClubReady's embed, so sign-ups land in the
gym's ClubReady account. The class and time the visitor picks go into the message field.
Settings (endpoint, key, whether the SMS box is required) are in `site/assets/js/data.js` → `signup`.

It is sent as a background request, so visitors stay on our site. (ClubReady's own reply
redirects to an old corporate thank-you page. To change that, set ClubReady's thank-you /
redirect URL to the new site's `thanks.html`.)

This is not an official ClubReady integration: if ClubReady changes their form, sign-ups can
stop arriving. Send a test sign-up after any change, and every few months.

## Still needed from the gym (replace before launch)

- [ ] Real photos of the Winter Garden gym, classes and members (current photos are Unsplash stock, see `docs/PHOTOS.md`)
- [ ] A photo and a 2–3 line bio for each coach
- [x] Owner (Felix Valentin) and head trainer (Rob Roche) confirmed
- [ ] Confirm the other coaches (Sergio, Karen, Jordan, David came from ClassPass listings)
- [x] Real class times
- [ ] Which class (Lift, Fight Camp, Booty Camp) and which coach runs at each time
- [ ] Membership prices and what each option includes
- [ ] Contract / cancellation terms (FAQ answer)
- [ ] Real upcoming events
- [ ] Gym hours, email and social media links
- [x] Free class form connected (ClubReady)

## Deploy

GitHub Pages serves the `gh-pages` branch, which holds only the `site/` folder:

```bash
git subtree push --prefix site origin gh-pages
```

`docs/` holds design notes and is not published.
