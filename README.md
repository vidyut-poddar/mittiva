# Mittiva — Website & AI Changing Room

This repository contains both the main Mittiva static website and the Next.js AI Changing Room application.

---

## 1. Mittiva Website (Static Site)

Pure HTML / CSS / JS. No build step. Upload as-is.

### Structure
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

### Before going live

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

### Features

- Light + Dark theme (toggle in nav, persisted in `localStorage`, defaults to dark)
- Ambient constellation canvas background (slow drift, **not** pointer-following)
- Scroll-triggered fade-up reveals via IntersectionObserver
- Word-by-word hero headline animation
- Scroll progress indicator at the top
- Mobile-first responsive, mobile menu under 860px
- System font fallback while Google Fonts load asynchronously
- All JS deferred at bottom of `<body>`

### Performance

- No external JS dependencies
- All CSS in one stylesheet (~28kb unminified)
- Google Fonts loaded async with `preload + onload` swap
- SVG logos inline-able if needed
- Constellation canvas respects `prefers-reduced-motion`

### Deploy

Upload the entire folder to any static host:
- GitHub Pages
- Netlify (drag-and-drop the folder)
- Vercel
- Cloudflare Pages

---

## 2. AI Changing Room (Next.js Application)

This is a Next.js project bootstrapped with `create-next-app` that implements an immersive virtual changing room using Gemini and Imagen 4.

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `next/font` to automatically optimize and load Geist, a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
