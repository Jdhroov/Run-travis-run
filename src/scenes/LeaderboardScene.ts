import Phaser from 'phaser'

type Entry = { name: string; score: number; email?: string; phone?: string }

function getLocalScores(): Entry[] {
  const raw = localStorage.getItem('rtr:scores')
  return raw ? JSON.parse(raw) : []
}

function saveLocalScore(entry: Entry) {
  const list = getLocalScores()
  list.push(entry)
  list.sort((a,b) => b.score - a.score)
  localStorage.setItem('rtr:scores', JSON.stringify(list.slice(0, 50)))
}

export class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene') }
  create(data: { score?: number }) {
    const { width, height } = this.scale

    // Background
    if (this.textures.exists('bg')) {
      const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-10)
      bg.displayWidth = width
      bg.displayHeight = height
    }

    this.add.text(width/2, 20, '🏆 Leaderboard 🏆', { 
      color: '#c2185b', 
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5,0)

    // Show current score if available
    if (data.score && data.score > 0) {
      this.add.text(width/2, 60, `Your Score: ${data.score}`, { 
        color: '#c2185b', 
        fontSize: '24px' 
      }).setOrigin(0.5,0)
    }

    const form = document.createElement('form')
    form.style.position = 'absolute'
    form.style.left = '50%'
    form.style.top = '120px'
    form.style.transform = 'translateX(-50%)'
    form.style.display = 'flex'
    form.style.flexDirection = 'column'
    form.style.gap = '12px'
    form.style.alignItems = 'center'
    form.style.backgroundColor = 'rgba(0,0,0,0.8)'
    form.style.padding = '20px'
    form.style.borderRadius = '10px'
    form.style.border = '2px solid #c2185b'

    const name = document.createElement('input')
    name.placeholder = 'Your Name'
    name.style.padding = '8px'
    name.style.borderRadius = '5px'
    name.style.border = '1px solid #c2185b'
    name.style.width = '200px'
    
    const email = document.createElement('input')
    email.placeholder = 'Email (optional)'
    email.type = 'email'
    email.style.padding = '8px'
    email.style.borderRadius = '5px'
    email.style.border = '1px solid #c2185b'
    email.style.width = '200px'
    
    const phone = document.createElement('input')
    phone.placeholder = 'Phone (optional)'
    phone.type = 'tel'
    phone.style.padding = '8px'
    phone.style.borderRadius = '5px'
    phone.style.border = '1px solid #c2185b'
    phone.style.width = '200px'
    
    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.textContent = 'Save Score! 🎯'
    submit.style.padding = '10px 20px'
    submit.style.backgroundColor = '#c2185b'
    submit.style.color = 'white'
    submit.style.border = 'none'
    submit.style.borderRadius = '5px'
    submit.style.cursor = 'pointer'
    submit.style.fontSize = '16px'

    form.append(name, email, phone, submit)
    document.body.appendChild(form)

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const score = data.score || 0
      if (score > 0) {
        saveLocalScore({ 
          name: name.value || 'Anonymous', 
          score: score, 
          email: email.value, 
          phone: phone.value 
        })
        alert(`Score ${score} saved successfully! 🎉`)
      }
      form.remove()
      this.scene.restart({})
    })

    const entries = getLocalScores()
    if (entries.length > 0) {
      this.add.text(width/2, 280, '🏅 Top Scores:', { 
        color: '#c2185b', 
        fontSize: '24px' 
      }).setOrigin(0.5,0)
      
      entries.slice(0, 10).forEach((e, idx) => {
        const medal = idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `${idx + 1}.`
        this.add.text(width/2, 320 + idx * 30, `${medal} ${e.name} - ${e.score}`, { 
          color: idx < 3 ? '#ffd700' : '#fff',
          fontSize: '18px',
          fontStyle: idx < 3 ? 'bold' : 'normal'
        }).setOrigin(0.5,0)
      })
    } else {
      this.add.text(width/2, 280, 'No scores yet. Be the first! 🚀', { 
        color: '#c2185b', 
        fontSize: '20px' 
      }).setOrigin(0.5,0)
    }

    this.add.text(width/2, height - 40, 'Press ESC to return to Menu', { 
      color: '#c2185b', 
      fontSize: '16px' 
    }).setOrigin(0.5,0)

    this.input.keyboard?.once('keydown-ESC', () => {
      form.remove()
      this.scene.start('MenuScene')
    })
  }
}
