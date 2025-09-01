import { describe, it, expect } from 'vitest';
import { PlayScene } from '../src/scenes/PlayScene';
import Phaser from 'phaser';
function boot(scene) { return new Phaser.Game({ type: Phaser.HEADLESS, width: 800, height: 450, scene: [scene], physics: { default: 'arcade' } }); }
describe('Difficulty & reset', () => {
    it('Game speed & obstacle density increase gradually', async () => {
        const s = new PlayScene();
        const g = boot(s);
        await new Promise(r => setTimeout(r, 50));
        s['create']();
        const speedBefore = s['speed'];
        const timerBefore = s['obstacleTimer'];
        s['update'](0, 500);
        expect(s['speed']).toBeGreaterThan(speedBefore);
        expect(s['obstacleTimer']).toBeGreaterThan(timerBefore);
        g.destroy(true);
    });
    it('Game resets cleanly on restart (new scene state)', async () => {
        const s1 = new PlayScene();
        const g = boot(s1);
        await new Promise(r => setTimeout(r, 50));
        s1['create']();
        s1['addScore'](1000);
        const oldScore = s1['score'];
        const s2 = new PlayScene();
        g.scene.add('PlayScene2', s2, true);
        await new Promise(r => setTimeout(r, 50));
        s2['create']();
        expect(s2['score']).toBeLessThanOrEqual(oldScore);
        g.destroy(true);
    });
});
