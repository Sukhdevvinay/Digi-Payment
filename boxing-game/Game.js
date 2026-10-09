class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.players = [];
    this.punches = [];
    this.round = 1;
    this.timeLimit = 60;
    this.timeLeft = 60;
    this.running = false;
    this.winner = null;
  }

  reset() {
    this.players = [
      new Boxer({
        id: 1,
        name: 'Player 1',
        x: 120,
        color: '#1d9bf0',
        controls: { left: 'a', right: 'd', punch: 'q', defend: 'e' }
      }),
      new Boxer({
        id: 2,
        name: 'Player 2',
        x: 620,
        color: '#f04a4a',
        controls: { left: 'ArrowLeft', right: 'ArrowRight', punch: 'p', defend: 'o' }
      })
    ];

    this.punches = [];
    this.round = 1;
    this.timeLeft = this.timeLimit;
    this.running = false;
    this.winner = null;

    this.updatePlayerUI();
    this.updateRoundUI();
    this.updateStatus('Press Start');
  }

  start() {
    this.running = true;
    this.updateStatus('Fight!');
  }

  updateStatus(text) {
    const statusElement = document.getElementById('statusDisplay');
    if (statusElement) {
      statusElement.textContent = text;
    }
  }

  updateRoundUI() {
    const roundElement = document.getElementById('roundDisplay');
    const timeElement = document.getElementById('timeDisplay');
    if (roundElement) roundElement.textContent = `Round ${this.round}`;
    if (timeElement) timeElement.textContent = `${Math.ceil(this.timeLeft)}s`;
  }

  updatePlayerUI() {
    const p1 = this.players[0];
    const p2 = this.players[1];

    const p1HealthFill = document.getElementById('player1HealthFill');
    const p2HealthFill = document.getElementById('player2HealthFill');
    const p1Stats = document.getElementById('player1Stats');
    const p2Stats = document.getElementById('player2Stats');

    if (p1HealthFill) p1HealthFill.style.width = `${p1.health}%`;
    if (p2HealthFill) p2HealthFill.style.width = `${p2.health}%`;
    if (p1Stats) p1Stats.textContent = `Health: ${Math.round(p1.health)} | Energy: ${Math.round(p1.energy)}`;
    if (p2Stats) p2Stats.textContent = `Health: ${Math.round(p2.health)} | Energy: ${Math.round(p2.energy)}`;
  }

  handleKey(key) {
    if (!this.running) {
      return;
    }

    const p1 = this.players[0];
    const p2 = this.players[1];

    if (key === 'a') p1.move(-1);
    if (key === 'd') p1.move(1);
    if (key === 'q') {
      const punch = p1.punch();
      if (punch) this.punches.push(punch);
    }
    if (key === 'e') p1.defend();

    if (key === 'ArrowLeft') p2.move(-1);
    if (key === 'ArrowRight') p2.move(1);
    if (key === 'p') {
      const punch = p2.punch();
      if (punch) this.punches.push(punch);
    }
    if (key === 'o') p2.defend();
  }

  checkPunchCollision(punch) {
    const target = this.players.find(player => player.id !== punch.ownerId);
    if (!target) return;

    const hit =
      punch.x < target.x + target.width &&
      punch.x + punch.width > target.x &&
      punch.y < target.y + target.height &&
      punch.y + punch.height > target.y;

    if (hit && !punch.hit) {
      target.takeDamage(punch.damage);
      punch.hit = true;
      punch.active = false;
    }
  }

  checkWinner() {
    const p1 = this.players[0];
    const p2 = this.players[1];

    if (p1.health <= 0 || p2.health <= 0) {
      this.running = false;
      this.winner = p1.health > p2.health ? 'Player 1' : 'Player 2';
      this.showResult(this.winner);
      return true;
    }

    return false;
  }

  showResult(winner) {
    const modal = document.getElementById('resultModal');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    if (resultTitle) resultTitle.textContent = 'Fight Over';
    if (resultMessage) resultMessage.textContent = `${winner} wins!`;
    if (modal) modal.classList.remove('hidden');
  }

  update(dt) {
    if (!this.running) {
      return;
    }

    this.players.forEach(player => player.update(dt));

    this.punches.forEach(punch => {
      punch.update(dt);
      this.checkPunchCollision(punch);
    });

    this.punches = this.punches.filter(punch => punch.active);
    this.timeLeft = Math.max(0, this.timeLeft - dt);

    if (this.timeLeft <= 0) {
      this.running = false;
      const p1 = this.players[0];
      const p2 = this.players[1];
      this.winner = p1.health === p2.health ? 'Draw' : p1.health > p2.health ? 'Player 1' : 'Player 2';
      this.showResult(this.winner);
      this.updateStatus(this.winner === 'Draw' ? 'Draw game!' : `${this.winner} wins by time!`);
    }

    this.updatePlayerUI();
    this.updateRoundUI();

    if (!this.checkWinner()) {
      this.updateStatus('Fight!');
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#1d3d2b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#7d8f7b';
    this.ctx.fillRect(0, 320, this.canvas.width, 100);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 320);
    this.ctx.lineTo(this.canvas.width, 320);
    this.ctx.stroke();

    this.players.forEach(player => player.draw(this.ctx));
    this.punches.forEach(punch => punch.draw(this.ctx));
  }
}
