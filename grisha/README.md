# Grisha

A photoreal, first-person POV landing experience for **Grisha** — a high-end fashion boutique in Ballygunge, Kolkata. The user walks through the storefront, past the boutique tree, up to the reception counter, opens the catalogue, and is handed off to the shop funnel.

## Run locally

It's static HTML — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## File layout

| File | Purpose |
|---|---|
| `index.html` | Entry point — loads React + the app |
| `pov-photoreal.css` | All scene styling, transitions, HUD, catalogue |
| `pov-photoreal.jsx` | App state machine, scene definitions, AI-prompt registry |
| `image-slot.js` | `<image-slot>` web component — drag-and-drop image targets |
| `pov-sound.js` | Synthesized SFX (door swell, footstep, page flip, chime) |
| `photos/` | Default scene imagery — overwrite or drop new images onto slots |

## Editing the experience

- **Replace a scene image** — drop a new image onto the slot inside the running app; it persists in localStorage. Or replace the file at `photos/scene-XX-*.png` to ship a new default.
- **Add / reorder / rename scenes** — edit the `SCENES` array near the top of `pov-photoreal.jsx`.
- **Update the catalogue spreads** — `SPREADS` array in `pov-photoreal.jsx`.
- **Tweak transitions** — `pov-photoreal.css`, search for `.scene-layer`, `.ahead`, `.behind`, `.dolly-through`.

## Controls

- **Click / Right Arrow / Space / Enter** — advance forward
- **Left Arrow** — step back
- **★** (bottom right) — open the AI-prompt panel
- **♪** — toggle sound
- **↻** — restart

## GitHub Pages

Push to `main` and enable Pages (Settings → Pages → main branch → `/` root). The site will be live at `https://<owner>.github.io/<repo>/`.
