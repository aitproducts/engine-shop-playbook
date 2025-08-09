Engine Shop Playbook - MVP

What it is
- Public-data micro reference for engine shops.
- No OEM content. Link-outs to official sites only.

Features
- ADs tab - quick link to FAA and EASA AD search with prefilled terms.
- HazMat tab - small local list with quick link to the official PHMSA HazMat table.
- SDS tab - jump to NIOSH Pocket Guide search.
- ATA tab - searchable list of ATA chapters.

Run it
- Install Node 18+.
- npm install
- npm run dev
- Open http://localhost:5173

Build
- npm run build
- npm run preview

Files to edit
- public/ata_chapters.json
- public/engines.json
- public/hazmat_min.json

Notes
- This app does not store or republish OEM material.
- All deep links open the official sources in a new tab.


Deploy - Netlify (fastest)
- Create a Netlify account.
- New site from Git -> pick your GitHub repo with this project.
- Build command: npm run build
- Publish directory: dist
- Or use this repo's GitHub Action with NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID secrets.

Deploy - Vercel
- Create a Vercel account.
- Import the GitHub repo.
- Framework preset: Vite
- Build command: npm run build
- Output directory: dist
- vercel.json is included so defaults work.


What changed in this patch
- Stable FAA/EASA/NIOSH entry links (no 404s).
- Preset quick-picks for engines and ATA 70-80.
- Recent searches (last 5) saved in localStorage.
- Star favorites (saved in localStorage).
- Copy query text button to paste into FAA/EASA search boxes.
- Open both FAA and EASA with one click.
