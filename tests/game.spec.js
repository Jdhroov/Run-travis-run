import { describe, it, expect } from 'vitest';
import { PlayScene } from '../src/scenes/PlayScene';
import { MenuScene } from '../src/scenes/MenuScene';
import { GameOverScene } from '../src/scenes/GameOverScene';
import { LeaderboardScene } from '../src/scenes/LeaderboardScene';
// Mock Phaser for testing
const mockPhaser = {
    Scene: class MockScene {
        constructor() {
            Object.defineProperty(this, "add", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: () => ({ setOrigin: () => { }, setDepth: () => { }, setInteractive: () => { }, on: () => { } })
            });
            Object.defineProperty(this, "input", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { keyboard: { on: () => { }, once: () => { } }, on: () => { }, once: () => { } }
            });
            Object.defineProperty(this, "physics", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { add: { sprite: () => ({ setDisplaySize: () => { }, setVelocityX: () => { }, setGravityY: () => { } }), collider: () => { }, overlap: () => { } } }
            });
            Object.defineProperty(this, "time", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { addEvent: () => { }, delayedCall: () => { } }
            });
            Object.defineProperty(this, "sound", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { add: () => ({ play: () => { } }), play: () => { } }
            });
            Object.defineProperty(this, "make", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { graphics: () => ({ fillStyle: () => { }, fillRect: () => { }, generateTexture: () => { }, destroy: () => { } }) }
            });
            Object.defineProperty(this, "textures", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { exists: () => false }
            });
            Object.defineProperty(this, "load", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { image: () => { }, audio: () => { } }
            });
            Object.defineProperty(this, "scale", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { width: 800, height: 450 }
            });
            Object.defineProperty(this, "scene", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: { start: () => { } }
            });
        }
    }
};
// Mock the Phaser import
vi.mock('phaser', () => mockPhaser);
describe('Game Scenes', () => {
    it('PlayScene can be instantiated', () => {
        const scene = new PlayScene();
        expect(scene).toBeInstanceOf(PlayScene);
    });
    it('MenuScene can be instantiated', () => {
        const scene = new MenuScene();
        expect(scene).toBeInstanceOf(MenuScene);
    });
    it('GameOverScene can be instantiated', () => {
        const scene = new GameOverScene();
        expect(scene).toBeInstanceOf(GameOverScene);
    });
    it('LeaderboardScene can be instantiated', () => {
        const scene = new LeaderboardScene();
        expect(scene).toBeInstanceOf(LeaderboardScene);
    });
});
