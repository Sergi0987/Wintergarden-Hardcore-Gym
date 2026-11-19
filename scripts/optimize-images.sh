#!/bin/sh
# Make web-ready images from the originals in assets-src/: sh scripts/optimize-images.sh
#   photos: assets-src/photos/NAME.jpg -> site/assets/img/photos/NAME-{640,1024,1600}.webp + NAME.jpg (1600 wide backup)
#   logos:  assets-src/logos/NAME.png  -> site/assets/img/NAME.webp, sized for the size it is shown at (x2 for sharp screens)
# Needs cwebp (brew install webp) and ffmpeg. To add a real photo, drop the original in
# assets-src/photos/ and run this again; then use it in a page like the existing photos.
set -eu
cd "$(dirname "$0")/.."
out=site/assets/img/photos
mkdir -p "$out"
for src in assets-src/photos/*.jpg; do
  name=$(basename "$src" .jpg)
  for w in 640 1024 1600; do
    cwebp -quiet -q 72 -m 6 -metadata none -resize "$w" 0 "$src" -o "$out/$name-$w.webp"
  done
  ffmpeg -loglevel error -y -i "$src" -vf "scale=1600:-2" -q:v 7 "$out/$name.jpg"
done
logo() { cwebp -quiet -q 90 -alpha_q 100 -m 6 -resize "$2" 0 "assets-src/logos/$1.png" -o "site/assets/img/$1.webp"; }
logo logo-panel 280         # header, shown ~94px wide
logo logo-panel-black 280   # header (light), shown ~94px wide
logo logo-full 440          # footer, shown 200px wide
logo logo-full-black 720    # stamp on the red band, shown up to 360px wide
echo "Images done."
