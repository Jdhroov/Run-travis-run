import Phaser from 'phaser';
function getLocalScores() {
    const raw = localStorage.getItem('rtr:scores');
    return raw ? JSON.parse(raw) : [];
}
function saveLocalScore(entry) {
    const list = getLocalScores();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem('rtr:scores', JSON.stringify(list.slice(0, 50)));
}
export class LeaderboardScene extends Phaser.Scene {
    constructor() { super('LeaderboardScene'); }
    create(data) {
        const { width, height } = this.scale;
        // Background
        if (this.textures.exists('bg')) {
            const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-10);
            bg.displayWidth = width;
            bg.displayHeight = height;
        }
        this.add.text(width / 2, 20, '🏆 Leaderboard 🏆', {
            color: '#c2185b',
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        const entries = getLocalScores();
        if (entries.length > 0) {
            this.add.text(width / 2, 80, '🏅 Top Scores:', {
                color: '#c2185b',
                fontSize: '24px'
            }).setOrigin(0.5, 0);
            entries.slice(0, 10).forEach((e, idx) => {
                const medal = idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `${idx + 1}.`;
                this.add.text(width / 2, 120 + idx * 30, `${medal} ${e.name} - ${e.score}`, {
                    color: idx < 3 ? '#ffd700' : '#fff',
                    fontSize: '18px',
                    fontStyle: idx < 3 ? 'bold' : 'normal'
                }).setOrigin(0.5, 0);
            });
        }
        else {
            this.add.text(width / 2, 80, 'No scores yet. Play the game to earn points! 🚀', {
                color: '#c2185b',
                fontSize: '20px'
            }).setOrigin(0.5, 0);
        }
        this.add.text(width / 2, height - 40, 'Press ESC to return to Menu', {
            color: '#c2185b',
            fontSize: '16px'
        }).setOrigin(0.5, 0);
        this.input.keyboard?.once('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }
}
