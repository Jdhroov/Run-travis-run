import Phaser from 'phaser'
import { loadAssets, AssetCatalog } from '../assets/assetLoader'

export type GameResult = 'win' | 'lose' | 'playing'

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isDucking = false
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
  private bgMusic!: Phaser.Sound.BaseSound

  constructor() { super('PlayScene') }

  preload() {
    // Load only assets that actually exist
    this.load.image('bg', '/assets/background/stadium.jpg')
    this.load.image('player', '/assets/travis/travis.jpeg')
    this.load.image('taylor', '/assets/taylor/taylor.jpeg')
    this.load.image('donald', '/assets/donald/donald.png')
    // auto-load all exes images
    this.catalog = loadAssets(this)
    
    // Load background music from BGM folder
    this.load.audio('bgMusic', '/assets/BGM/y2mate.com - Taylor Swift  Paper Rings Official Audio.mp3')
  }

  create() {
    const { width, height } = this.scale

    // Reset state for clean restarts
    this.isDucking = false
    this.timeLeft = 60
    this.speed = 300
    this.obstacleTimer = 0
    this.result = 'playing'

    // Wait for audio to be fully loaded before playing
    this.sound.once('unlocked', () => {
      console.log('Audio unlocked, attempting to play background music...')
      this.playBackgroundMusic()
    })

    // If audio is already unlocked, play immediately
    if (this.sound.locked) {
      console.log('Audio is locked, waiting for user interaction...')
    } else {
      console.log('Audio is unlocked, playing background music immediately...')
      this.playBackgroundMusic()
    }

    // Generate placeholder textures in tests/dev if not present
    const makeRect = (key: string, w: number, h: number, color = 0xffffff) => {
      if (this.textures.exists(key)) return
      const g = this.make.graphics({ x: 0, y: 0 })
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

    // Background music will be played by playBackgroundMusic method

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

    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // Handle keyboard input for audio unlocking
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (this.sound.locked && !this.bgMusic) {
        console.log('Keyboard input detected, attempting to unlock audio...')
        this.playBackgroundMusic()
      }
    })

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchStartY = p.y
      // quick tap jump
      this.triggerJump()
      
      // Try to unlock audio on first user interaction
      if (this.sound.locked && !this.bgMusic) {
        console.log('User interaction detected, attempting to unlock audio...')
        this.playBackgroundMusic()
      }
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

    this.timerText = this.add.text(width - 120, 16, String(this.timeLeft), { color: '#c2185b' })

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.result !== 'playing') return
      this.timeLeft -= 1
      this.timerText.setText(String(this.timeLeft))
      if (this.timeLeft <= 0) this.win()
    }})
  }

  private triggerJump() {
    if (!this.player.body.blocked.down || this.isDucking || this.result !== 'playing') return
    try { this.sound.play('jump') } catch {}
    this.player.setVelocityY(-600)
  }

  private startDuck() {
    if (!this.player.body.blocked.down || this.result !== 'playing') return
    try { this.sound.play('duck') } catch {}
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

    // Positioning
    if (spawnAir) {
      // Air obstacle at head-height
      const airY = height - 120
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

    this.physics.add.overlap(this.player, ex, () => this.lose(), undefined, this)
  }

  private increaseDifficulty(delta: number) {
    this.speed += delta * 0.02
    this.obstacleTimer += delta
    if (this.obstacleTimer > Math.max(300, 1200 - this.timeLeft)) {
      this.obstacleTimer = 0
      this.spawnObstacle()
    }
  }

  private win() {
    if (this.result !== 'playing') return
    this.result = 'win'
    // Stop background music
    if (this.bgMusic) this.bgMusic.stop()
    try { this.sound.play('win') } catch {}
    this.scene.start('GameOverScene', { result: 'win' })
  }

  private lose() {
    if (this.result !== 'playing') return
    this.result = 'lose'
    // Stop background music
    if (this.bgMusic) this.bgMusic.stop()
    try { this.sound.play('hit') } catch {}
    this.scene.start('GameOverScene', { result: 'lose' })
  }

  update(_: number, delta: number) {
    if (this.result !== 'playing') return

    if (this.cursors.space?.isDown) this.triggerJump()
    if (this.cursors.down?.isDown) this.startDuck()
    if (this.cursors.down?.isUp) this.endDuck()

    this.increaseDifficulty(delta)

    // parallax scroll
    if (this.bgFar) this.bgFar.tilePositionX += this.speed * 0.0008 * delta
    if (this.bgNear) this.bgNear.tilePositionX += this.speed * 0.0012 * delta
    if (this.groundScroll) this.groundScroll.tilePositionX += this.speed * 0.002 * delta
  }

  private playBackgroundMusic() {
    try {
      console.log('Attempting to play background music...')
      this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.3 })
      console.log('Background music added successfully:', this.bgMusic)
      
      // Check if audio is loaded
      if (this.bgMusic.isPlaying) {
        console.log('Background music is already playing')
      } else {
        const playResult = this.bgMusic.play()
        console.log('Play result:', playResult)
        if (playResult) {
          console.log('Background music started successfully')
        } else {
          console.log('Failed to start background music')
        }
      }
    } catch (error) {
      console.error('Error playing background music:', error)
    }
  }
}
