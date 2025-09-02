# GitHub Pages Deployment Guide

## Overview
This project is now configured to work both locally and when deployed to GitHub Pages with **automatic deployment** via GitHub Actions.

## Build Process
The build process:
1. Compiles TypeScript to JavaScript
2. Bundles all code using Vite
3. Copies the `assets/` folder to `dist/assets/`
4. Generates correct paths for GitHub Pages compatibility

## Build Commands
```bash
# Development (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build (localhost:4173)
npm run preview

# Clean build folder
npm run clean
```

## Automatic Deployment
✅ **GitHub Actions workflow is configured!**
- Automatically runs on every push to `main` branch
- Installs dependencies, builds, and deploys to GitHub Pages
- No manual intervention required

## GitHub Pages Setup
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy from the `dist/` folder

## File Structure After Build
```
dist/
├── index.html          # Main HTML file with correct paths
├── assets/
│   ├── main-*.js      # Bundled JavaScript
│   ├── background/     # Background images
│   ├── travis/        # Player images
│   ├── exes/          # Obstacle images
│   ├── taylor/        # Win screen images
│   ├── donald/        # Lose screen images
│   └── BGM/           # Background music
```

## Key Changes Made
- ✅ Asset paths changed from absolute (`/assets/...`) to relative (`assets/...`)
- ✅ Vite configured with `base: '/Run-travis-run/'` for GitHub Pages
- ✅ Build script includes asset copying
- ✅ TypeScript compiled to JavaScript
- ✅ All assets properly bundled and copied
- ✅ GitHub Actions workflow for automatic deployment
- ✅ No manual dist/ folder pushing required

## Testing
- **Local Development**: `npm run dev` → `http://localhost:5173`
- **Production Preview**: `npm run preview` → `http://localhost:4173`
- **GitHub Pages**: Automatically deployed from `dist/` folder

## How It Works
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Installs dependencies
   - Runs `npm run build`
   - Deploys `dist/` folder to GitHub Pages
3. Game is live at: `https://Jdhroov.github.io/Run-travis-run/`

The game will now work perfectly on both localhost and GitHub Pages with automatic deployment! 🎮
