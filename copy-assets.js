import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// Copy assets folder to dist
copyDir('assets', 'dist/assets')
console.log('Assets copied to dist folder successfully!')
