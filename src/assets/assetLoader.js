// Auto-load images from assets directories using Vite's import.meta.glob
export function loadAssets(scene) {
    const exesModules = import.meta.glob('./assets/exes/*.{png,jpg,jpeg,gif}', {
        eager: true,
        as: 'url'
    });
    const travisModules = import.meta.glob('./assets/travis/*.{png,jpg,jpeg,gif}', {
        eager: true,
        as: 'url'
    });
    const exesKeys = [];
    const travisKeys = [];
    let idx = 0;
    for (const url of Object.values(exesModules)) {
        const key = `ex-${idx++}`;
        scene.load.image(key, url);
        exesKeys.push(key);
    }
    idx = 0;
    for (const url of Object.values(travisModules)) {
        const key = `travis-${idx++}`;
        scene.load.image(key, url);
        travisKeys.push(key);
    }
    return { exes: exesKeys, travis: travisKeys };
}
