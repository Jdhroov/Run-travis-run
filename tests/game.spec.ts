import { describe, it, expect } from 'vitest'
import { PlayScene } from '../src/scenes/PlayScene'
import { MenuScene } from '../src/scenes/MenuScene'
import { GameOverScene } from '../src/scenes/GameOverScene'
import { LeaderboardScene } from '../src/scenes/LeaderboardScene'

// Mock Phaser for testing
const mockPhaser = {
  Scene: class MockScene {
    constructor() {}
    add = () => ({ setOrigin: () => {}, setDepth: () => {}, setInteractive: () => {}, on: () => {} })
    input = { keyboard: { on: () => {}, once: () => {} }, on: () => {}, once: () => {} }
    physics = { add: { sprite: () => ({ setDisplaySize: () => {}, setVelocityX: () => {}, setGravityY: () => {} }), collider: () => {}, overlap: () => {} } }
    time = { addEvent: () => {}, delayedCall: () => {} }
    sound = { add: () => ({ play: () => {} }), play: () => {} }
    make = { graphics: () => ({ fillStyle: () => {}, fillRect: () => {}, generateTexture: () => {}, destroy: () => {} }) }
    textures = { exists: () => false }
    load = { image: () => {}, audio: () => {} }
    scale = { width: 800, height: 450 }
    scene = { start: () => {} }
  }
}

// Mock the Phaser import
vi.mock('phaser', () => mockPhaser)

describe('Game Scenes', () => {
  it('PlayScene can be instantiated', () => {
    const scene = new PlayScene()
    expect(scene).toBeInstanceOf(PlayScene)
  })

  it('MenuScene can be instantiated', () => {
    const scene = new MenuScene()
    expect(scene).toBeInstanceOf(MenuScene)
  })

  it('GameOverScene can be instantiated', () => {
    const scene = new GameOverScene()
    expect(scene).toBeInstanceOf(GameOverScene)
  })

  it('LeaderboardScene can be instantiated', () => {
    const scene = new LeaderboardScene()
    expect(scene).toBeInstanceOf(LeaderboardScene)
  })
})
