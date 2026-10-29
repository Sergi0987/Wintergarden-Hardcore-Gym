# Hardcore Fitness Winter Garden — website (draft v1)

A new multi-page website for Hardcore Fitness Winter Garden, 1401 Beulah Rd Ste 100.
Plain HTML, CSS and JavaScript. No build step.

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
`site/assets/js/data.js`. Change it there and every page updates.

## Run it locally

```bash
node scripts/serve.mjs
```

Then open http://localhost:4321.

## Presenting the draft

Pages show dashed **Draft** notes where real info is still needed.
Add `?clean=1` to any URL to hide them (for showing the owner). `?clean=0` brings them back.

The site uses the light palette only (owner's choice). Photo bands, the clock and the
footer stay dark on purpose.

## Free class form

The Visit page embeds the gym's ClubReady lead form (iframe in `site/visit.html`).
Sign-ups go straight into ClubReady. The form can't be pre-filled from our site, so when a
visitor clicks a class time, the page shows their pick and asks them to add it to the message box.

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
