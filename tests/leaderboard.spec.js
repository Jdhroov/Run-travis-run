import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardScene } from '../src/scenes/LeaderboardScene';
import Phaser from 'phaser';
describe('Leaderboard & submission', () => {
    beforeEach(() => localStorage.clear());
    it('Optional login form appears after Game Over (navigating to leaderboard)', async () => {
        const scene = new LeaderboardScene();
        const game = new Phaser.Game({ type: Phaser.HEADLESS, width: 800, height: 450, scene: [scene] });
        await new Promise(r => setTimeout(r, 50));
        scene['create']({ score: 123 });
        const form = Array.from(document.getElementsByTagName('form'))[0];
        expect(form).toBeTruthy();
        game.destroy(true);
    });
    it('Submitting score updates leaderboard (local storage)', async () => {
        const scene = new LeaderboardScene();
        const game = new Phaser.Game({ type: Phaser.HEADLESS, width: 800, height: 450, scene: [scene] });
        await new Promise(r => setTimeout(r, 50));
        scene['create']({ score: 456 });
        const form = Array.from(document.getElementsByTagName('form'))[0];
        const inputs = form.querySelectorAll('input');
        inputs[0].value = 'Tester';
        form.dispatchEvent(new Event('submit'));
        const raw = localStorage.getItem('rtr:scores');
        expect(raw && JSON.parse(raw).length).toBeGreaterThan(0);
        game.destroy(true);
    });
});
