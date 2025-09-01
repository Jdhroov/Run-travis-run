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
        this.add.text(width / 2, 20, 'Leaderboard', { color: '#fff', fontSize: '28px' }).setOrigin(0.5, 0);
        const form = document.createElement('form');
        form.style.position = 'absolute';
        form.style.left = '50%';
        form.style.top = '120px';
        form.style.transform = 'translateX(-50%)';
        form.style.display = 'flex';
        form.style.gap = '8px';
        const name = document.createElement('input');
        name.placeholder = 'Name';
        const email = document.createElement('input');
        email.placeholder = 'Email';
        const phone = document.createElement('input');
        phone.placeholder = 'Phone';
        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Submit';
        form.append(name, email, phone, submit);
        document.body.appendChild(form);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveLocalScore({ name: name.value || 'Anonymous', score: data.score ?? 0, email: email.value, phone: phone.value });
            form.remove();
            this.scene.restart({});
        });
        const entries = getLocalScores();
        entries.slice(0, 10).forEach((e, idx) => {
            this.add.text(width / 2, 200 + idx * 24, `${idx + 1}. ${e.name} - ${e.score}`, { color: '#fff' }).setOrigin(0.5, 0);
        });
        this.input.keyboard?.once('keydown-ESC', () => {
            form.remove();
            this.scene.start('MenuScene');
        });
    }
}
