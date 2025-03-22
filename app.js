const DIFFICULTY_LEVELS = {
  0: { name: "Fácil", fails: 8, timer: 0 },
  25: { name: "Normal", fails: 6, timer: 35 },
  50: { name: "Difícil", fails: 4, timer: 25 },
  100: { name: "Extremo", fails: 3, timer: 15 }
};

const WORD_LIST = [
  { word: "DRAGON", hint: "Criatura mitológica", theme: "fantasia" },
  { word: "CASTILLO", hint: "Fortaleza medieval", theme: "medieval" },
  { word: "ESPADA", hint: "Arma blanca", theme: "medieval" },
  { word: "HECHICERO", hint: "Mago poderoso", theme: "fantasia" },
  { word: "CABALLERO", hint: "Guerrero noble", theme: "medieval" }
];

let gameState = {
  mode: null,
  players: [],
  difficulty: 50,
  secretWord: "",
  guessedLetters: [],
  wrongLetters: [],
  attemptsLeft: 0,
  timer: null,
  timeLeft: 0,
  hint: ""
};

// Gestos táctiles
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
    if (deltaX > 0 && gameState.secretWord) {
      resetGame();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('single-player-btn').addEventListener('click', () => showConfig('single'));
  document.getElementById('multi-player-btn').addEventListener('click', () => showConfig('multi'));
  document.getElementById('start-single-game').addEventListener('click', startSingleGame);
  document.getElementById('next-multi').addEventListener('click', setupMultiplayerWord);
  document.getElementById('confirm-word').addEventListener('click', startMultiGame);
  document.getElementById('restart-button').addEventListener('click', resetGame);

  setupDifficultySlider('difficulty', 'difficulty-info');
  setupDifficultySlider('multi-difficulty', 'multi-difficulty-info');
});

function showConfig(mode) {
  gameState.mode = mode;
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById(`config-${mode}`).classList.remove('hidden');
}

function setupDifficultySlider(sliderId, infoId) {
  const slider = document.getElementById(sliderId);
  const info = document.getElementById(infoId);
  const difficultyKeys = Object.keys(DIFFICULTY_LEVELS).map(Number).sort((a, b) => a - b);

  const updateDifficulty = (value) => {
    const closestKey = difficultyKeys.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    gameState.difficulty = closestKey;
    slider.value = closestKey;
    info.textContent = DIFFICULTY_LEVELS[closestKey].name;
  };

  slider.addEventListener('input', (e) => updateDifficulty(parseInt(e.target.value)));
  updateDifficulty(parseInt(slider.value));
}

function startSingleGame() {
  const playerName = document.getElementById('player1-name').value.trim();
  const theme = document.getElementById('theme').value;
  
  if (!playerName) return showMobileAlert('¡Ingresa tu nombre!');
  
  const filteredWords = theme === 'aleatorio' ? WORD_LIST : WORD_LIST.filter(word => word.theme === theme);
  if (filteredWords.length === 0) return showMobileAlert('No hay palabras disponibles');
  
  const selectedWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
  gameState.players = [playerName];
  gameState.secretWord = selectedWord.word.toUpperCase();
  gameState.hint = selectedWord.hint;
  
  initializeGame();
}

function setupMultiplayerWord() {
  const player1 = document.getElementById('multi-player1').value.trim();
  const player2 = document.getElementById('multi-player2').value.trim();
  
  if (!player1 || !player2) return showMobileAlert('Nombres requeridos');
  
  gameState.players = [player1, player2];
  showWordPopup();
}

function showWordPopup() {
  document.getElementById('config-multi').classList.add('hidden');
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('word-popup').style.display = 'block';
  document.getElementById('current-player').textContent = `${gameState.players[0]}:`;
}

function startMultiGame() {
  const secretWord = document.getElementById('secret-word-input').value.trim().toUpperCase();
  if (!secretWord || !/^[A-ZÑ]+$/.test(secretWord)) return showMobileAlert('Palabra inválida');
  
  gameState.secretWord = secretWord;
  hideOverlay();
  initializeGame();
}

function initializeGame() {
  const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
  gameState.attemptsLeft = difficultyConfig.fails;
  gameState.guessedLetters = Array(gameState.secretWord.length).fill('_');
  gameState.wrongLetters = [];
  gameState.timeLeft = difficultyConfig.timer;

  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('game-screen').classList.remove('hidden');
  
  updateHangmanImage();
  updateGameDisplay();
  resetKeyboard();

  if (difficultyConfig.timer > 0) startTimer();
}

function updateGameDisplay() {
  document.getElementById('word-display').textContent = gameState.guessedLetters.join(' ');
  document.getElementById('remaining-attempts').textContent = gameState.attemptsLeft;
  document.getElementById('hint-display').textContent = gameState.mode === 'single' ? `Pista: ${gameState.hint}` : '';
}

function resetKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  
  const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const rows = [
    letters.slice(0, 7),
    letters.slice(7, 14),
    letters.slice(14, 21),
    letters.slice(21, 27)
  ];

  rows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    row.forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      button.dataset.letter = letter;
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!button.disabled) handleLetter(letter);
      });
      rowDiv.appendChild(button);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handleLetter(letter) {
  const button = document.querySelector(`button[data-letter="${letter}"]`);
  button.disabled = true;
  
  if (gameState.secretWord.includes(letter)) {
    button.classList.add('correct');
    gameState.secretWord.split('').forEach((char, i) => {
      if (char === letter) gameState.guessedLetters[i] = letter;
    });
  } else {
    button.classList.add('incorrect');
    gameState.wrongLetters.push(letter);
    gameState.attemptsLeft--;
    updateHangmanImage();
  }
  
  checkGameStatus();
  updateGameDisplay();
}

function updateHangmanImage() {
  const errors = gameState.wrongLetters.length;
  document.getElementById('hangman-container').innerHTML = `
    <img src="img/ahorcado_${String(errors).padStart(2, '0')}.png" class="ahorcado">
  `;
}

function checkGameStatus() {
  if (!gameState.guessedLetters.includes('_')) {
    endGame(true);
  } else if (gameState.attemptsLeft <= 0 || gameState.timeLeft <= 0) {
    endGame(false);
  }
}

function endGame(win) {
  clearInterval(gameState.timer);
  const message = win ? `¡Victoria! ${gameState.secretWord}` : `¡Derrota! ${gameState.secretWord}`;
  showMobileAlert(message);
  resetGame();
}

function resetGame() {
  gameState = {
    mode: null,
    players: [],
    secretWord: "",
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: 0,
    timer: null,
    timeLeft: 0,
    hint: ""
  };
  
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('start-screen').classList.remove('hidden');
}

function startTimer() {
  const progressCircle = document.querySelector('.progress-circle');
  const circumference = 283;
  const timeLimit = DIFFICULTY_LEVELS[gameState.difficulty].timer;
  let timeLeft = timeLimit;
  
  progressCircle.style.strokeDashoffset = circumference;
  
  gameState.timer = setInterval(() => {
    timeLeft--;
    const progress = (timeLeft / timeLimit) * circumference;
    progressCircle.style.strokeDashoffset = progress;
    
    if(timeLeft <= 0) {
      clearInterval(gameState.timer);
      endGame(false);
    }
  }, 1000);
}

function showMobileAlert(message) {
  const alert = document.createElement('div');
  alert.className = 'mobile-alert';
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => alert.remove(), 2000);
}

function hideOverlay() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('word-popup').style.display = 'none';
}