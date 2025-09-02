import Phaser from 'phaser';
export class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }
    preload() {
        if (!this.textures.exists('bg')) {
            this.load.image('bg', 'assets/background/stadium.jpg');
        }
        // Preload Taylor win image
        if (!this.textures.exists('taylor-win')) {
            this.load.image('taylor-win', 'assets/taylor/taylor.jpeg');
        }
    }
    create(data) {
        const { width, height } = this.scale;
        if (this.textures.exists('bg')) {
            const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-10);
            bg.displayWidth = width;
            bg.displayHeight = height;
        }
        const msg = data.result === 'win' ? 'You won! 💍' : 'Game Over!';
        this.add.text(width / 2, 40, msg, { color: '#c2185b', fontSize: '28px' }).setOrigin(0.5, 0);
        const keyImage = data.result === 'win' ? 'taylor-win' : 'donald';
        if (!this.textures.exists(keyImage)) {
            if (data.result === 'win')
                this.load.image('taylor-win', '/assets/taylor/taylor.jpeg');
            this.load.start();
        }
        const centerY = height / 2;
        this.add.image(width / 2, centerY, data.result === 'win' ? 'taylor-win' : 'donald').setScale(0.5);
        this.input.keyboard?.once('keydown-R', () => this.scene.start('PlayScene'));
        this.input.once('pointerdown', () => this.scene.start('PlayScene'));
        this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('PlayScene'));
        this.add.text(width / 2, height - 40, 'Press R/Space or Tap to Restart', { color: '#c2185b' }).setOrigin(0.5);
    }
}
