# Workspace

## Overview

Multi-tenant real estate website — 3 agencies on one React+Vite frontend, backed by a shared Express+JSON-file server. Fully standalone: no database server needed, downloads and runs anywhere with Node.js.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite + TailwindCSS + Framer Motion + shadcn/ui + Wouter routing
- **Backend**: Express + JSON file storage (no native deps, no DB server)
- **Image uploads**: multer → `server/uploads/`

## Agencies

| Agency | Route | Admin route | Admin login |
|---|---|---|---|
| Priya Estates | `/` | `/admin` | no login required |
| Prithvi Real Estate | `/prithvi` | `/prithvi/admin` | admin / admin |
| Bhima Homes | `/bhima` | `/bhima/admin` | admin / admin |

## Architecture

### Backend (`server/`)
- `server/index.js` — Express entry point; serves API + static files (prod)
- `server/db.js` — JSON file storage: reads/writes `server/data/{agency}/{section}.json`
- `server/seed-data.js` — Default content for all 3 agencies (runs once on first start)
- `server/routes/properties.js` — CRUD for property listings
- `server/routes/config.js` — CRUD for arbitrary config sections (founder, agents, reviews, contacts, siteInfo, services)
- `server/routes/upload.js` — File upload; saves to `server/uploads/`. Includes `POST /api/upload/360` (50MB limit) for equirectangular panoramas → `server/uploads/360/`.
- `server/uploads/` — Uploaded images directory (`360/` subdir for panoramas)
- `server/data/` — JSON data files (auto-created by seeder)

### Frontend (`artifacts/realestate-landing/`)
- `src/api/client.ts` — Centralized API client (all fetch calls)
- `src/store/dataStore.tsx` — Priya Estates data context (API-backed)
- `src/store/prithviStore.tsx` — Prithvi Real Estate data context (API-backed). Properties include `panoramaScenes: { scenes: { [id]: { title, panorama, hotSpots: [{pitch, yaw, type:"scene", text, sceneId}] } }, firstScene }` for multi-scene 360° tours.
- `src/lib/pannellum.ts` — Lazy CDN loader for Pannellum 2.5.6 (free, MIT) used by 360° viewer/editor.
- `src/components/prithvi/Panorama360Viewer.tsx` — Read-only multi-scene 360° viewer with hotspot scene transitions.
- `src/components/prithvi/Panorama360Editor.tsx` — Admin editor: upload scenes (max 5), rename/delete/set-start, click-to-place hotspots linking scenes.
- Prithvi admin property form has tabbed nav: "Property Details" / "360° Tour Editor".
- Prithvi property listing cards show a `360°` badge (next to ▶ Video) when scenes exist.
- Prithvi property detail page renders the 360° viewer above "Property Info" when scenes exist.
- `src/store/bhimaStore.tsx` — Bhima Homes data context (API-backed)
- Vite proxies `/api` and `/uploads` → `http://localhost:8080` (API server port)

## Replit Workflows

- **API Server** (`artifacts/api-server`): runs `node ../../server/index.js` on PORT=8080
- **Web** (`artifacts/realestate-landing`): Vite dev server on PORT=21606 (→ external :80)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- API health: `curl http://localhost:8080/api/health`

## Standalone Use (outside Replit)

```bash
# Install
cd server && npm install

# Run server (terminal 1)
PORT=3001 node server/index.js

# Run frontend dev (terminal 2)
cd artifacts/realestate-landing
BASE_PATH=/ API_PORT=3001 PORT=5173 npx vite

# --- OR: Production build ---
# Build frontend
cd artifacts/realestate-landing && BASE_PATH=/ npx vite build

# Serve everything from the Express server
PORT=3001 NODE_ENV=production node server/index.js
# → open http://localhost:3001
```
