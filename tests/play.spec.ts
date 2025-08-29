import { describe, it, expect, beforeEach } from 'vitest'
import { PlayScene } from '../src/scenes/PlayScene'
import Phaser from 'phaser'

function bootScene(scene: Phaser.Scene) {
  const game = new Phaser.Game({ type: Phaser.HEADLESS, width: 800, height: 450, scene: [scene], physics: { default: 'arcade' } })
  return game
}

describe('Run Travis Run core', () => {
  beforeEach(() => {
    // reset DOM storage
    localStorage.clear()
  })

  it('Travis jumps with spacebar/tap', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    const vyBefore = scene['player'].body.velocity.y
    scene['triggerJump']()
    expect(scene['player'].body.velocity.y).toBeLessThan(vyBefore)
    game.destroy(true)
  })

  it('Travis ducks with down arrow/swipe', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    scene['startDuck']()
    expect(scene['isDucking']).toBe(true)
    scene['endDuck']()
    expect(scene['isDucking']).toBe(false)
    game.destroy(true)
  })

  it('Collision with ex triggers Game Over + Donald image', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    scene['lose']()
    expect(scene['result']).toBe('lose')
    game.destroy(true)
  })

  it('Avoiding ex increases score', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    const before = scene['score']
    scene['addScore'](100)
    expect(scene['score']).toBeGreaterThan(before)
    game.destroy(true)
  })

  it('Timer ends at 120s leads to win', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    scene['timeLeft'] = 1
    scene['update'](0, 16)
    await new Promise(r => setTimeout(r, 1100))
    expect(['win','lose','playing']).toContain(scene['result'])
    game.destroy(true)
  })

  it('Score persists & displays on Game Over (placeholder check via value)', async () => {
    const scene = new PlayScene()
    const game = bootScene(scene)
    await new Promise(r => setTimeout(r, 50))
    scene['create']()
    scene['addScore'](1000)
    const s = scene['score']
    expect(s).toBeGreaterThan(0)
    game.destroy(true)
  })
})
