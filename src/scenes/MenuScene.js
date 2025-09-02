import Phaser from 'phaser';
export class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    preload() {
        if (!this.textures.exists('bg')) {
            this.load.image('bg', 'assets/background/stadium.jpg');
        }
    }
    create() {
        const { width, height } = this.scale;
        if (this.textures.exists('bg')) {
            const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-10);
            bg.displayWidth = width;
            bg.displayHeight = height;
        }
        this.add.text(width / 2, height / 2 - 40, 'Run Travis Run', { fontFamily: 'sans-serif', fontSize: '40px', color: '#c2185b' }).setOrigin(0.5);
        const playBtn = this.add.text(width / 2, height / 2 + 20, 'Tap/Press to Start', { fontSize: '20px', color: '#c2185b' }).setOrigin(0.5).setInteractive();
        playBtn.on('pointerdown', () => this.scene.start('PlayScene'));
        const leaderboardBtn = this.add.text(width / 2, height / 2 + 60, '🏆 View Leaderboard', { fontSize: '18px', color: '#c2185b' }).setOrigin(0.5).setInteractive();
        leaderboardBtn.on('pointerdown', () => this.scene.start('LeaderboardScene', {}));
        this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('PlayScene'));
        this.input.keyboard?.on('keydown-L', () => this.scene.start('LeaderboardScene', {}));
    }
}
