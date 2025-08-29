import Phaser from 'phaser'

export type GameResult = 'win' | 'lose' | 'playing'

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isDucking = false
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private timeLeft = 120
  private speed = 300
  private obstacleTimer = 0
  private result: GameResult = 'playing'

  constructor() { super('PlayScene') }

  preload() {
    // Minimal placeholder assets
    this.load.image('player', '/assets/travis/placeholder_player.png')
    this.load.image('ground', '/assets/background/ground.png')
    this.load.image('taylor', '/assets/taylor/taylor.png')
    this.load.image('donald', '/assets/donald/donald.png')
    this.load.image('ex', '/assets/exes/ex.png')
    this.load.audio('jump', '/assets/audio/jump.mp3')
    this.load.audio('duck', '/assets/audio/duck.mp3')
    this.load.audio('hit', '/assets/audio/hit.mp3')
    this.load.audio('win', '/assets/audio/win.mp3')
  }

  create() {
    const { width, height } = this.scale

    // Generate placeholder textures in tests/dev if not present
    const makeRect = (key: string, w: number, h: number, color = 0xffffff) => {
      if (this.textures.exists(key)) return
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(color, 1)
      g.fillRect(0, 0, w, h)
      g.generateTexture(key, w, h)
      g.destroy()
    }
    makeRect('player', 40, 48, 0xffd700)
    makeRect('ground', Math.max(800, width), 20, 0x0b6623)
    makeRect('taylor', 60, 80, 0xff69b4)
    makeRect('donald', 80, 80, 0xff8800)
    makeRect('ex', 40, 40, 0x333333)

    // Guard sound in tests
    const originalPlay = this.sound.play.bind(this.sound)
    this.sound.play = ((key: string) => {
      try { return originalPlay(key) } catch { return null as unknown as Phaser.Sound.BaseSound }
    }) as typeof this.sound.play

    // ground
    const ground = this.physics.add.staticImage(0, height - 20, 'ground').setOrigin(0, 1)
    ground.displayWidth = width

    // player
    this.player = this.physics.add.sprite(120, height - 60, 'player')
      .setCollideWorldBounds(true)
      .setGravityY(0)
    this.physics.add.collider(this.player, ground)

    this.cursors = this.input.keyboard!.createCursorKeys()

    this.input.on('pointerdown', () => this.triggerJump())
    this.input.on('pointerup', () => this.endDuck())
    this.input.on('pointermove', () => {})

    this.scoreText = this.add.text(16, 16, 'Score: 0', { color: '#fff' })
    this.timerText = this.add.text(width - 120, 16, '120', { color: '#fff' })

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.result !== 'playing') return
      this.timeLeft -= 1
      this.timerText.setText(String(this.timeLeft))
      if (this.timeLeft <= 0) this.win()
    }})
  }

  private triggerJump() {
    if (!this.player.body.blocked.down || this.isDucking || this.result !== 'playing') return
    this.sound.play('jump')
    this.player.setVelocityY(-600)
  }

  private startDuck() {
    if (!this.player.body.blocked.down || this.result !== 'playing') return
    this.sound.play('duck')
    this.isDucking = true
    this.player.setScale(1, 0.6)
  }

  private endDuck() {
    if (!this.isDucking) return
    this.isDucking = false
    this.player.setScale(1, 1)
  }

  private spawnObstacle() {
    const { width, height } = this.scale
    const y = Math.random() < 0.5 ? height - 60 : height - 140
    const ex = this.physics.add.sprite(width + 20, y, 'ex')
    ex.setVelocityX(-this.speed)
    this.physics.add.overlap(this.player, ex, () => this.lose(), undefined, this)
  }

  private increaseDifficulty(delta: number) {
    this.speed += delta * 0.02
    this.obstacleTimer += delta
    if (this.obstacleTimer > Math.max(300, 1200 - this.score)) {
      this.obstacleTimer = 0
      this.spawnObstacle()
    }
  }

  private addScore(delta: number) {
    this.score += Math.floor(delta * 0.05)
    this.scoreText.setText(`Score: ${this.score}`)
  }

  private win() {
    if (this.result !== 'playing') return
    this.result = 'win'
    this.sound.play('win')
    this.scene.start('GameOverScene', { result: 'win', score: this.score })
  }

  private lose() {
    if (this.result !== 'playing') return
    this.result = 'lose'
    this.sound.play('hit')
    this.scene.start('GameOverScene', { result: 'lose', score: this.score })
  }

  update(_, delta: number) {
    if (this.result !== 'playing') return

    if (this.cursors.space?.isDown) this.triggerJump()
    if (this.cursors.down?.isDown) this.startDuck()
    if (this.cursors.down?.isUp) this.endDuck()

    this.increaseDifficulty(delta)
    this.addScore(delta)
  }
}
