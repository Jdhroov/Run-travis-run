import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { PlayScene } from './scenes/PlayScene'
import { GameOverScene } from './scenes/GameOverScene'
import { LeaderboardScene } from './scenes/LeaderboardScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'app',
  backgroundColor: '#0b6623',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1400 }, debug: false }
  },
  scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [MenuScene, PlayScene, GameOverScene, LeaderboardScene]
}

export const createGame = () => new Phaser.Game(config)

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const game = createGame()
}
