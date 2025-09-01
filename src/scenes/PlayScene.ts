import Phaser from 'phaser'
import { loadAssets, AssetCatalog } from '../assets/assetLoader'

export type GameResult = 'win' | 'lose' | 'playing'

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isDucking = false
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private timeLeft = 60
  private speed = 300
  private obstacleTimer = 0
  private result: GameResult = 'playing'
  private bgFar!: Phaser.GameObjects.TileSprite
  private bgNear!: Phaser.GameObjects.TileSprite
  private groundScroll!: Phaser.GameObjects.TileSprite
  private touchStartY = 0
  private catalog!: AssetCatalog
  private static readonly OBSTACLE_W = 48
  private static readonly OBSTACLE_H = 48
  private obstacles!: Phaser.Physics.Arcade.Group
  private obstaclePassedCount = 0
  private bgMusic!: Phaser.Sound.BaseSound

  constructor() { super('PlayScene') }

  preload() {
    // Minimal placeholder assets
    this.load.image('bg', '/assets/background/stadium.jpg')
    this.load.image('player', '/assets/travis/placeholder_player.png')
    this.load.image('ground', '/assets/background/ground.png')
    this.load.image('taylor', '/assets/taylor/taylor.png')
    this.load.image('donald', '/assets/donald/donald.png')
    // auto-load all exes images
    this.catalog = loadAssets(this)
    this.load.audio('jump', '/assets/audio/jump.mp3')
    this.load.audio('duck', '/assets/audio/duck.mp3')
    this.load.audio('hit', '/assets/audio/hit.mp3')
    this.load.audio('win', '/assets/audio/win.mp3')
    this.load.audio('bgMusic', '/assets/audio/bg_music.mp3')
  }

  create() {
    const { width, height } = this.scale

    // Reset state for clean restarts
    this.isDucking = false
    this.score = 0
    this.timeLeft = 60
    this.speed = 300
    this.obstacleTimer = 0
    this.result = 'playing'
    this.obstaclePassedCount = 0

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
    // Ground should contrast background so it's visible
    makeRect('ground', Math.max(800, width), 20, 0x14a03a)
    makeRect('taylor', 60, 80, 0xff69b4)
    makeRect('donald', 80, 80, 0xff8800)
    // Ensure a visible fallback obstacle if no images in assets/exes
    makeRect('ex', PlayScene.OBSTACLE_W, PlayScene.OBSTACLE_H, 0x333333)

    // Guard sound in tests
    const originalPlay = this.sound.play.bind(this.sound)
    this.sound.play = ((key: string) => {
      try { return originalPlay(key) } catch { return null as unknown as Phaser.Sound.BaseSound }
    }) as typeof this.sound.play

    // static background image (stadium)
    if (this.textures.exists('bg')) {
      const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-10)
      bg.displayWidth = width
      bg.displayHeight = height
      // Apply Gaussian blur (5px) if postFX is available
      try { (bg as any).postFX?.addBlur?.(5, 5) } catch {}
    }

    // ground
    const ground = this.physics.add.staticImage(0, height - 20, 'ground').setOrigin(0, 1)
    ground.displayWidth = width
    ground.refreshBody()
    this.groundScroll = this.add.tileSprite(0, height - 20, width, 20, 'ground').setOrigin(0, 1)

    // player
    const playerKey = (this.catalog?.travis?.length ?? 0) > 0 ? this.catalog.travis[0] : 'player'
    this.player = this.physics.add.sprite(120, height - 60, playerKey)
      .setCollideWorldBounds(true)
      .setOrigin(0.5, 1)
      .setDepth(1)
    // Normalize visual size
    this.player.setDisplaySize(48, 54)
    // Align feet to ground top
    const groundTopY = height - 20
    this.player.setY(groundTopY)
    // Use full sprite for body to ensure reliable collisions
    ;(this.player.body as Phaser.Physics.Arcade.Body).setSize(
      this.player.displayWidth,
      this.player.displayHeight,
      true
    )
    this.physics.add.collider(this.player, ground)

    // Group for all obstacles with reliable collision detection
    this.obstacles = this.physics.add.group()
    this.physics.add.collider(this.player, this.obstacles, () => this.lose(), undefined, this)

    this.cursors = this.input.keyboard!.createCursorKeys()

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchStartY = p.y
      // quick tap jump
      this.triggerJump()
    })
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const dy = p.y - this.touchStartY
      if (dy > 40) {
        this.startDuck()
        // end duck shortly after swipe
        this.time.delayedCall(250, () => this.endDuck())
      } else {
        this.endDuck()
      }
    })

    this.scoreText = this.add.text(16, 16, 'Score: 0', { color: '#c2185b' })
    this.timerText = this.add.text(width - 120, 16, String(this.timeLeft), { color: '#c2185b' })

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.result !== 'playing') return
      this.timeLeft -= 1
      this.timerText.setText(String(this.timeLeft))
      if (this.timeLeft <= 0) this.win()
    }})

    // Spawn first obstacle after 1 second
    this.time.delayedCall(1000, () => {
      if (this.result === 'playing') this.spawnObstacle()
    })

    // Play background music
    try {
      this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 } as any)
      this.bgMusic.play()
    } catch (error) {
      console.log('Background music not available')
    }
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
    // Shrink physics body to match ducked sprite
    ;(this.player.body as Phaser.Physics.Arcade.Body).setSize(
      this.player.displayWidth,
      this.player.displayHeight * 0.6,
      true
    )
  }

  private endDuck() {
    if (!this.isDucking) return
    this.isDucking = false
    this.player.setScale(1, 1)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setSize(
      this.player.displayWidth,
      this.player.displayHeight,
      true
    )
  }

  private spawnObstacle() {
    const { width, height } = this.scale
    // Fixed distribution: 65% ground, 35% air
    const spawnAir = Math.random() < 0.35

    // Pick a random ex texture from catalog; fallback to placeholder
    const exKey = (this.catalog?.exes?.length ?? 0) > 0
      ? this.catalog.exes[Math.floor(Math.random() * this.catalog.exes.length)]
      : 'ex'
    // Uniform obstacle size
    const ex = this.physics.add.sprite(width + 20, height / 2, exKey)
    ex.setDisplaySize(PlayScene.OBSTACLE_W, PlayScene.OBSTACLE_H)
    ex.setDepth(2).setVisible(true)

    // Positioning
    if (spawnAir) {
      // Air obstacle positioned to collide with player head unless ducking
      const airY = this.player.y - this.player.displayHeight * 0.4
      ex.setY(airY)
    } else {
      // Ground obstacle sits on turf: jump to avoid
      const groundTop = height - 20
      const halfH = (ex.displayHeight || 40) / 2
      ex.setY(groundTop - halfH)
    }

    // Movement and physics
    ex.setVelocityX(-this.speed)
    ex.setGravityY(0)
    ;(ex.body as Phaser.Physics.Arcade.Body).allowGravity = false
    ;(ex.body as Phaser.Physics.Arcade.Body).immovable = true
    ;(ex.body as Phaser.Physics.Arcade.Body).setSize(PlayScene.OBSTACLE_W, PlayScene.OBSTACLE_H, true)

    // Add to group for reliable collision detection
    this.obstacles.add(ex)
    ;(ex as any).passed = false
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
    // Score is now handled by obstacle passing, not time-based
    // Keep this for any additional scoring mechanics
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

    // parallax scroll
    if (this.bgFar) this.bgFar.tilePositionX += this.speed * 0.0008 * delta
    if (this.bgNear) this.bgNear.tilePositionX += this.speed * 0.0012 * delta
    if (this.groundScroll) this.groundScroll.tilePositionX += this.speed * 0.002 * delta

    // Check for passed obstacles and cleanup
    if (this.obstacles) {
      this.obstacles.children.each((child: Phaser.GameObjects.GameObject) => {
        const obstacle = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & { passed?: boolean }
        if (!obstacle.active) return
        
        // Award score when obstacle passes player completely
        if (!obstacle.passed && obstacle.x + obstacle.displayWidth * 0.5 < this.player.x - 50) {
          obstacle.passed = true
          this.obstaclePassedCount++
          this.score = this.obstaclePassedCount
          this.scoreText.setText(`Score: ${this.score}`)
        }
        
        // Remove off-screen obstacles
        if (obstacle.x < -obstacle.displayWidth - 100) {
          obstacle.destroy()
        }
      }, this)
    }
  }
}
