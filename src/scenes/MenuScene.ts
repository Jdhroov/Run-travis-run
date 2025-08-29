import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }
  create() {
    const { width, height } = this.scale
    this.add.text(width/2, height/2 - 40, 'Run Travis Run', { fontFamily: 'sans-serif', fontSize: '40px', color: '#fff' }).setOrigin(0.5)
    const playBtn = this.add.text(width/2, height/2 + 20, 'Tap/Press to Start', { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setInteractive()
    playBtn.on('pointerdown', () => this.scene.start('PlayScene'))
    this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('PlayScene'))
  }
}
