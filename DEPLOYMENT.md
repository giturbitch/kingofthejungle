# Jungle Predators - Deployment Guide

## GitHub Setup ✅
Repository: https://github.com/giturbitch/kingofthejungle
Branch: `main`

All code is automatically synced from this repository.

---

## Lovable ↔ GitHub Auto-Sync

### To Enable GitHub Sync in Lovable:
1. Go to your Lovable project: https://lovable.dev/projects/29c93bd1-59f8-40e3-991a-840e0e0e7dd8
2. Click **Settings** → **Repository**
3. Connect repository: `https://github.com/giturbitch/kingofthejungle`
4. Every change in Lovable will auto-commit to GitHub's `main` branch

---

## Local Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs on `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Output: `dist/` directory

### Preview Build
```bash
npm run preview
```

### Format Code
```bash
npm run format
```

### Lint
```bash
npm run lint
```

---

## Deployment Options

### Option 1: Vercel (Recommended) ⭐
**Easiest auto-deployment on every GitHub push**

1. Go to https://vercel.com/new
2. Import repository: `giturbitch/kingofthejungle`
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

**Your site will be live at:**
```
https://kingofthejungle.vercel.app
```

Every push to `main` triggers automatic deployment.

---

### Option 2: GitHub Pages
1. Enable GitHub Pages in repo settings
2. Source: Deploy from a branch (`main` - `/root`)
3. Push `dist/` folder

---

### Option 3: Netlify
1. Go to https://netlify.com
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

---

## Lovable ↔ Vercel Integration

Once deployed to Vercel:
1. In Lovable, go to **Settings**
2. Add Vercel deployment URL
3. Preview changes live as you build

---

## Environment Variables

Create `.env.local` for local development:
```env
VITE_API_URL=https://api.example.com
```

For production deployments:
- **Vercel**: Add secrets in Project Settings → Environment Variables
- **Netlify**: Add in Site Settings → Build & Deploy → Environment

---

## Smart Contracts

Contracts are in `/contracts`:
- Use Hardhat for testing/deployment
- See `contracts/README.md` for blockchain setup

```bash
cd contracts
npm install
npm run test
npm run deploy
```

---

## Auto-Updates Flow

```
Code Changes in Lovable
        ↓
Auto-commit to GitHub main
        ↓
GitHub Actions CI (lint, build, test)
        ↓
Auto-deploy to Vercel
        ↓
Live at vercel.app
```

---

## Next Steps

1. ✅ GitHub repo setup complete
2. **→ Deploy to Vercel** (5 minutes)
3. Connect Lovable for auto-sync
4. Start building!

---

## Troubleshooting

**Build fails?**
- Check Node.js version: `node --version` (need v18+)
- Clear cache: `rm -rf node_modules && npm install`

**Changes not syncing?**
- Verify Lovable repo connection in Settings
- Check GitHub Actions logs for errors

**Deployment stuck?**
- Check Vercel deployment logs
- Verify environment variables are set
- Check `vite.config.ts` for build issues

