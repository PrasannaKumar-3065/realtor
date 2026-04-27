# India Real Estate Showcase - Setup Guide

This is a full-stack monorepo project with a React frontend and Node.js/Express backend.

## 📦 Project Structure

```
├── artifacts/
│   ├── realestate-landing/    # Main React frontend (Vite)
│   ├── mockup-sandbox/        # Component playground
│   └── api-server/            # TypeScript API wrapper
├── server/                     # Node.js/Express backend
├── lib/                        # Shared libraries
└── scripts/                    # Utility scripts
```

## ✅ Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **pnpm**: v10+ (package manager - required, NOT npm)

### Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all workspace dependencies + server dependencies
pnpm install

# (This also installs dependencies for the server/node_modules)
```

**Already done? Skip to step 2.**

### 2. Run Development Mode (Both Frontend + Backend)

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

The terminal will show both services running side-by-side with color-coded output.

---

## 🎯 Individual Commands

### Run Only Backend
```bash
pnpm dev:backend
```
- Backend server runs on http://localhost:3001
- Check health: `curl http://localhost:3001/api/health`

### Run Only Frontend
```bash
pnpm dev:frontend
```
- Frontend runs on http://localhost:5173
- Hot reload enabled with Vite

### Build for Production
```bash
pnpm build
```
- Builds TypeScript libraries and frontend

### Production Run
```bash
pnpm start
```
- Starts server in production mode on port 3001
- Serves built frontend assets

---

## 🗂️ Environment Configuration

### Frontend (.env files)
Located in: `artifacts/realestate-landing/`

```env
PORT=5173           # Frontend dev server port
BASE_PATH=/         # Base URL path (/)
API_PORT=3001       # Backend API port
```

### Backend (.env file)
Located in: `server/.env`

```env
PORT=3001           # Backend server port
NODE_ENV=development
```

These are already configured. Modify if you need different ports.

---

## 📋 Workspace Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Run frontend + backend together |
| `pnpm dev:frontend` | Run only frontend |
| `pnpm dev:backend` | Run only backend |
| `pnpm build` | Build for production |
| `pnpm build:frontend` | Build only frontend |
| `pnpm start` | Run production server |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm typecheck:libs` | Check library types only |

---

## 🐛 Troubleshooting

### Error: "Use pnpm instead"
You tried using `npm install`. **Use `pnpm install` instead.**

### Frontend won't start - PORT environment variable error
The `.env` file might be missing. Check:
```bash
ls artifacts/realestate-landing/.env
```

If missing, it will be recreated on next `pnpm install`.

### Backend crashes - "Cannot find module 'dotenv'"
Install server dependencies:
```bash
cd server && npm install
```

### Port 3001 or 5173 already in use
Kill existing processes:
```bash
# Kill backend
lsof -ti:3001 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9
```

Or change the port in `.env` files.

---

## 🌐 API Endpoints

When both are running:

- Health Check: `GET http://localhost:3001/api/health`
- Properties: `GET http://localhost:3001/api/:agency/properties`
- Config: `GET http://localhost:3001/api/:agency/config`
- File Uploads: `POST http://localhost:3001/api/upload`

Frontend proxies all `/api/*` requests to backend (configured in Vite).

---

## 📝 Notes

- **Frontend** uses: React, Vite, TypeScript, Tailwind CSS, Radix UI, Leaflet
- **Backend** uses: Express.js, CORS, Multer for file uploads, Dotenv for config
- **Monorepo package manager**: pnpm workspaces
- **TypeScript**: Configured throughout with strict mode

---

## 🔧 Development Tips

1. **Hot Reload**: Changes to React components automatically reload in browser
2. **API Development**: Modify backend files in `server/` and restart `pnpm dev:backend`
3. **Component Testing**: Use `artifacts/mockup-sandbox/` to develop components in isolation
4. **Type Checking**: Run `pnpm typecheck` before committing

---

**Everything set up and running? Great! Happy coding! 🎉**
