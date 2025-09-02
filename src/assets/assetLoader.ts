export type AssetCatalog = {
  exes: string[]
  travis: string[]
}

// Auto-load images from assets directories using Vite's import.meta.glob
export function loadAssets(scene: Phaser.Scene): AssetCatalog {
  const exesModules = (import.meta as any).glob('./assets/exes/*.{png,jpg,jpeg,gif}', {
    eager: true,
    as: 'url'
  }) as Record<string, string>
  const travisModules = (import.meta as any).glob('./assets/travis/*.{png,jpg,jpeg,gif}', {
    eager: true,
    as: 'url'
  }) as Record<string, string>

  const exesKeys: string[] = []
  const travisKeys: string[] = []
  let idx = 0
  for (const url of Object.values(exesModules)) {
    const key = `ex-${idx++}`
    scene.load.image(key, url)
    exesKeys.push(key)
  }
  idx = 0
  for (const url of Object.values(travisModules)) {
    const key = `travis-${idx++}`
    scene.load.image(key, url)
    travisKeys.push(key)
  }

  return { exes: exesKeys, travis: travisKeys }
}


