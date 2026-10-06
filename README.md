# Tianshuo Xu — personal homepage

A static research homepage for GitHub Pages at https://tianshuo-xu.github.io/.

## Content

- Profile with education and research interests.
- ReMind and Motion Forcing, with switchable video demonstrations from the official project pages.
- Research internships at Applied Intuition, Huawei, and MEGVII.
- Eight selected publications, including first and equal-contribution author markers, with topic filters.
- Click-to-email button, Google Scholar, and GitHub contact links. The email address is decoded only on click to reduce simple crawler harvesting; this is not a guarantee against automated extraction.

## Editing

- `index.html`: profile, experience, papers, links, and project summaries.
- `script.js`: video URLs, captions, publication filters, and mobile navigation.
- `styles.css`: typography and desktop/mobile layout.
- `assets/portrait.jpg`: the supplied original portrait.

The homepage serves compact, edited showcase videos in `assets/demos/`. ReMind combines eight complete examples into two chapters at original speed. Each Motion Forcing clip keeps two control images visible above synchronized results. `assets/demos/sources.json` records the original official project URLs.

## Local preview

```sh
python3 scripts/serve_preview.py
```

Open http://localhost:8765. The preview server supports byte-range requests so video seeking and chapter jumps work locally. No build step or package installation is required. GitHub Pages should serve the root of the `main` branch. `.nojekyll` enables direct static publishing.

### Rebuild showcase videos

Install FFmpeg separately, then run `python3 scripts/build_demos.py`. Downloaded inputs are cached in `.media-cache/` (ignored by Git). An optional `--cache /path` or `--proxy http://host:port` can be supplied. The build preserves full source sequences and playback speed, strips audio, and produces H.264 MP4s plus JPEG posters. If the ReMind chapter duration changes, update the `data-start` value of the occlusion chapter in `index.html` to match `remind_chapter_start` in `sources.json`.
