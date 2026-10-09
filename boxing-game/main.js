const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

function hideModal() {
  const modal = document.getElementById('resultModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

startBtn.addEventListener('click', () => {
  hideModal();
  game.start();
});

resetBtn.addEventListener('click', () => {
  hideModal();
  game.reset();
});

playAgainBtn.addEventListener('click', () => {
  hideModal();
  game.reset();
});

document.addEventListener('keydown', (event) => {
  const key = event.key;
  if (['a', 'd', 'q', 'e', 'ArrowLeft', 'ArrowRight', 'p', 'o'].includes(key)) {
    event.preventDefault();
    game.handleKey(key);
  }
});

game.reset();

let lastTime = performance.now();

function gameLoop(timestamp) {
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  game.update(delta);
  game.render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
