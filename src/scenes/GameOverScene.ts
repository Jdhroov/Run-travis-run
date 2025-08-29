import Phaser from 'phaser'

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene') }
  create(data: { result: 'win'|'lose', score: number }) {
    const { width, height } = this.scale

    const msg = data.result === 'win' ? 'You won! 💍' : 'Game Over!'
    this.add.text(width/2, 40, msg, { color: '#fff', fontSize: '28px' }).setOrigin(0.5, 0)

    const keyImage = data.result === 'win' ? 'taylor_travis_photo' : 'donald'
    if (!this.textures.exists(keyImage)) {
      if (data.result === 'win') this.load.image('taylor_travis_photo', '/assets/taylor/taylor_travis_photo.png')
      this.load.start()
    }

    const centerY = height/2
    this.add.image(width/2, centerY, data.result === 'win' ? 'taylor_travis_photo' : 'donald').setScale(0.5)

    this.add.text(width/2, height - 120, `Score: ${data.score}`, { color: '#fff' }).setOrigin(0.5)

    const savePrompt = this.add.text(width/2, height - 80, 'Save your score? (Press S)', { color: '#fff' }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-S', () => {
      this.scene.start('LeaderboardScene', { score: data.score })
    })

    this.input.keyboard?.once('keydown-R', () => this.scene.start('PlayScene'))
    this.add.text(width/2, height - 40, 'Press R to Restart', { color: '#fff' }).setOrigin(0.5)
  }
}
