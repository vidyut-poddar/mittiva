# Mittiva — Website

Pure HTML / CSS / JS. No build step. Upload as-is.

## Structure
```
mittiva/
├── index.html          Home
├── about.html          Story of the two brothers
├── services.html       8 products in detail
├── founders.html       Vidyut + Sanskar profiles
├── contact.html        Contact form
├── styles.css          Single shared stylesheet
├── main.js             Theme toggle, scroll reveals, constellation canvas
├── sitemap.xml         Submit to Google Search Console
├── robots.txt          Allow all crawlers
└── assets/             Logo SVGs
```

## Before going live

1. **Formspree** — in `contact.html`, replace `PASTE_FORMSPREE_ENDPOINT_HERE`
   with your actual Formspree form ID (e.g. `https://formspree.io/f/xxxxxxxx`).
   Otherwise the form shows a preview message instead of submitting.

2. **Founder bios** — placeholder copy is wrapped in `<em>[...]</em>` on
   `founders.html`. Replace with real personal/non-professional details.

3. **Founder photos** — placeholder media tiles on `founders.html` and
   `index.html`. Drop in real images (4:5 aspect for cards, square for
   founders page).

4. **Email addresses** — replace `hello@mittiva.io`,
   `vid@mittiva.io`, `sanskar@mittiva.io` if different.

5. **Domain** — site is configured for `mittiva.io`. If you change
   domains, update `sitemap.xml`, `robots.txt`, and all `<link rel="canonical">` tags.

## Features

- Light + Dark theme (toggle in nav, persisted in `localStorage`, defaults to dark)
- Ambient constellation canvas background (slow drift, **not** pointer-following)
- Scroll-triggered fade-up reveals via IntersectionObserver
- Word-by-word hero headline animation
- Scroll progress indicator at the top
- Mobile-first responsive, mobile menu under 860px
- System font fallback while Google Fonts load asynchronously
- All JS deferred at bottom of `<body>`

## Performance

- No external JS dependencies
- All CSS in one stylesheet (~28kb unminified)
- Google Fonts loaded async with `preload + onload` swap
- SVG logos inline-able if needed
- Constellation canvas respects `prefers-reduced-motion`

## Deploy

Upload the entire `mittiva/` folder to any static host:
- GitHub Pages
- Netlify (drag-and-drop the folder)
- Vercel
- Cloudflare Pages
