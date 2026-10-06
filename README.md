# Tianshuo Xu — personal homepage

A static research homepage for GitHub Pages at https://tianshuo-xu.github.io/.

## Content

- Profile with education and research interests.
- ReMind and Motion Forcing, with switchable video demonstrations from the official project pages.
- Research internships at Applied Intuition, Huawei, and MEGVII.
- Eight selected publications, including first and equal-contribution author markers, with topic filters.
- Email, Google Scholar, and GitHub contact links.

## Editing

- `index.html`: profile, experience, papers, links, and project summaries.
- `script.js`: video URLs, captions, publication filters, and mobile navigation.
- `styles.css`: typography and desktop/mobile layout.
- `assets/portrait.jpg`: the supplied original portrait.

The videos are served by the original public project sites and GitHub release assets. No copied video files or private research repositories are included. Google Scholar statistics are editorial values from the CV, not a live API feed.

## Local preview

```sh
python3 -m http.server 8765
```

Open http://localhost:8765. No build step or package installation is required. GitHub Pages should serve the root of the `main` branch. `.nojekyll` enables direct static publishing.
