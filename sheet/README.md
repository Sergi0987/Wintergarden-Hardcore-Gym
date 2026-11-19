# The gym's Google Sheet

The website's **Schedule, Coaches, Events and Prices** can come from a Google Sheet the gym edits.
Changes show on the site within a few minutes (Google takes a moment to update its published copy). If the sheet can't be reached, or a row is
broken, the site keeps working with the last good data (or the built-in data in `data.js`).

## One-time setup (about 5 minutes)

1. **Make the sheet** in the gym's Google account (so the gym owns it), named
   `HCF Winter Garden Website`. If you make it in your own account, transfer ownership to the gym
   later: Share > the gym's account > Owner.
2. **Run the setup:** Extensions > Apps Script. Delete what's there, paste all of
   [`setup-sheet.gs`](setup-sheet.gs), click Save, choose `setUpSheet`, click Run.
   Allow access when Google asks. It builds the tabs, dropdowns and checkboxes, and fills in the
   site's current data. Running it again never overwrites rows that are already there.
3. **Publish it:** File > Share > Publish to web > *Entire document* > *Comma-separated values
   (.csv)* > Publish. Copy the link (it ends in `/pub?output=csv`).
4. **Connect the site:** in `site/assets/js/data.js`, set
   - `sheet.csvBase` to that link, up to and including `/pub`
   - `sheet.tabs` to the tab numbers listed at the bottom of the sheet's **How to** tab

   Then run `npm run bake` (bakes the sheet's data into the pages for Google) and publish.

## Sharing

- Give Felix (and anyone else who updates the site) **Editor** access with Share.
- The published CSV is read-only and public. Everything in the sheet ends up on the website,
  so it must never hold private member information.

## Good to know

- Rows with a misspelled day, a bad time or an unknown class are skipped, not shown broken.
  The browser console lists them (`[sheet] Schedule row 4 skipped …`).
- Coach photos: paste a Google Drive share link (set to "Anyone with the link") in the Coaches
  tab's Photo column. A missing or broken link shows the coach's initials instead. A file name
  like `rob-roche.jpg` uses a photo from `site/assets/img/coaches/` (best quality: optimize it first).
- A coach named on the Schedule but missing from Coaches still shows by name; add them to the
  Coaches tab to give them a card on the Coaches page.
- Re-running `npm run bake` after big changes keeps the baked pages (what Google reads first) up
  to date. Visitors always see the live sheet either way.
- To regenerate `setup-sheet.gs` from the current `data.js`: `node scripts/make-sheet-setup.mjs`.
