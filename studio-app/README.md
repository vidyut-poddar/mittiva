# Mittiva Studio — AI Song Generator

A self-contained web app that generates songs from a text prompt using Google
**Lyria 3 Pro** (and Lyria 3 Clip for 30-second previews). The front-end is a
single static `index.html`; a Vercel serverless function (`api/generate.js`)
holds your API key so it is never exposed to visitors.

## Files

- `index.html` — the studio UI + audio engine (playback, waveform, meters, takes, export)
- `api/generate.js` — serverless proxy that calls Lyria with your key
- `vercel.json` — sets the function timeout to 60s
- `package.json` — project metadata (no dependencies; uses built-in `fetch`)

## Deploy to Vercel (recommended)

1. Get a Gemini API key from https://aistudio.google.com/apikey  (keep it private — do not commit it).
2. Push this `studio-app/` folder to a Git repo (or run `vercel` from inside it).
3. In Vercel: **New Project → import the repo**. If the repo root is the whole
   site, set the project's **Root Directory** to `studio-app`.
4. In **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your key  (Production + Preview)
5. Deploy. Your site is live at `https://<project>.vercel.app`.
6. (Optional) Add a custom domain such as `studio.mittiva.io` in
   **Settings → Domains**, then point a CNAME at Vercel from your DNS.

## Local test

```bash
npm i -g vercel
cd studio-app
vercel dev          # serves index.html and runs /api/generate locally
# set GEMINI_API_KEY when prompted, or in a .env.local file
```

## Notes / limits

- **Cost**: each generation calls the paid Lyria API on your key. Add usage
  limits/billing alerts in Google AI Studio / Cloud, and consider rate-limiting
  the function if the page is public.
- **Timeout**: full Pro songs can take a while. `maxDuration` is 60s (the Vercel
  Hobby max). If long Pro generations time out, upgrade to Vercel Pro and raise
  `maxDuration` in `vercel.json` to e.g. 300.
- **Response size**: the function streams raw MP3 bytes (lyrics ride along in the
  `X-Song-Lyrics` header) to stay under Vercel's 4.5 MB response cap. WAV output
  is intentionally not used for that reason.
- **Compliance**: a heuristic pre-check warns about real artist names, imitation
  phrasing, quoted lyrics, and sensitive topics before sending. Lyria's own
  safety engine is the final authority and its rejection reason is surfaced.
- **Editing**: volume, mute, playback, seek, download, and version takes are
  fully wired. Trim/fade are visual placeholders for a later pass (Lyria can't
  edit an existing render, so those would be client-side Web Audio edits).
