# GitHub Pages Deployment Guide

## Overview
This project is now configured to work both locally and when deployed to GitHub Pages.

## Build Process
The build process:
1. Compiles TypeScript to JavaScript
2. Bundles all code using Vite
3. Copies the `assets/` folder to `dist/assets/`
4. Generates relative paths for GitHub Pages compatibility

## Build Commands
```bash
# Development (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build (localhost:4173)
npm run preview
```

## GitHub Pages Setup
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"

## File Structure After Build
```
dist/
├── index.html          # Main HTML file with relative paths
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
- ✅ Vite configured with `base: './'` for relative paths
- ✅ Build script includes asset copying
- ✅ TypeScript compiled to JavaScript
- ✅ All assets properly bundled and copied

## Testing
- **Local Development**: `npm run dev` → `http://localhost:5173`
- **Production Preview**: `npm run preview` → `http://localhost:4173`
- **GitHub Pages**: Automatically deployed from `dist/` folder

The game should now work perfectly on both localhost and GitHub Pages! 🎮
