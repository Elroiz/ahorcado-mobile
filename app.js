const DIFFICULTY_LEVELS = {
  0: { name: "Fácil", fails: 8, timer: 0 },
  25: { name: "Normal", fails: 6, timer: 35 },
  50: { name: "Difícil", fails: 4, timer: 25 },
  100: { name: "Extremo", fails: 3, timer: 15 }
};

const WORD_LIST = [
  { word: "BOSQUE", hint: "Área densamente poblada de árboles", theme: "Naturaleza" },
  { word: "MONTAÑA", hint: "Elevación natural de terreno", theme: "Naturaleza" },
  { word: "GEISER", hint: "Fuente termal que emite agua caliente y vapor", theme: "Naturaleza" },
  { word: "DEMOCRACIA", hint: "Sistema político basado en el gobierno del pueblo", theme: "Historia y Política" },
  { word: "DICTADURA", hint: "Gobierno autoritario ejercido por una sola persona", theme: "Historia y Política" },
  { word: "MONARQUIA", hint: "Forma de gobierno liderada por un rey o reina", theme: "Historia y Política" },
  { word: "PINTURA", hint: "Arte de representar imágenes con colores", theme: "Arte y Cultura" },
  { word: "ESCULTURA", hint: "Obra de arte tridimensional", theme: "Arte y Cultura" },
  { word: "CINE", hint: "Lugar para ver películas", theme: "Arte y Cultura" },
  { word: "DUENDE", hint: "Criatura mágica pequeña", theme: "Mitología y Fantasía" },
  { word: "VAMPIRO", hint: "Criatura de la noche que se alimenta de sangre", theme: "Mitología y Fantasía" },
  { word: "ZOMBIE", hint: "Muerto viviente", theme: "Mitología y Fantasía" },
  { word: "QUIMICA", hint: "Ciencia que estudia las sustancias y sus transformaciones", theme: "Ciencia y Tecnología" },
  { word: "FISICA", hint: "Ciencia que estudia la naturaleza y sus fenómenos", theme: "Ciencia y Tecnología" },
  { word: "BIOLOGIA", hint: "Ciencia que estudia los seres vivos", theme: "Ciencia y Tecnología" },
  { word: "JUPITER", hint: "Planeta más grande del sistema solar", theme: "Astronomía" },
  { word: "URANO", hint: "Planeta con un eje de rotación inclinado", theme: "Astronomía" },
  { word: "NEPTUNO", hint: "Planeta más alejado del Sol", theme: "Astronomía" },
  { word: "BRILLO", hint: "Producto cosmético que da luminosidad a los labios", theme: "Moda y complementos" },
  { word: "RIMEL", hint: "Producto cosmético para oscurecer y alargar las pestañas", theme: "Moda y complementos" },
  { word: "SOMBRA", hint: "Producto cosmético para colorear los párpados", theme: "Moda y complementos" },
  { word: "KIT", hint: "Conjunto de piezas para una reparación o mejora", theme: "Mundo del motor" },
  { word: "LUBRICANTE", hint: "Producto que reduce fricción en el motor", theme: "Mundo del motor" },
  { word: "MANILLAR", hint: "Parte de la moto para dirigir la dirección", theme: "Mundo del motor" },
  { word: "TIRO", hint: "Acción de lanzar el balón hacia la portería", theme: "Deportes" },
  { word: "FALTA", hint: "Infracción cometida durante el juego", theme: "Deportes" },
  { word: "SANCION", hint: "Castigo impuesto por una falta", theme: "Deportes" }
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
  document.getElementById('next-multi').addEventListener('click', function() {
    const player1 = document.getElementById('multi-player1').value.trim();
    const player2 = document.getElementById('multi-player2').value.trim();
    
    if (!player1 || !player2) {
      showMobileAlert('¡Nombres requeridos!');
      return;
    }
    
    gameState.players = [player1, player2];
    showWordPopup(); // Esto ahora mostrará el popup correctamente
  });
  document.getElementById('confirm-word').addEventListener('click', startMultiGame);
  document.getElementById('restart-button').addEventListener('click', resetGame);

  setupDifficultyButtons();

  document.querySelector('.difficulty-btn[data-difficulty="25"]').click();
});

function showConfig(mode) {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById(`config-${mode}`).classList.remove('hidden');
}

function setupDifficultyButtons() {
  document.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      // Remover selección anterior
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
      
      // Seleccionar nuevo botón
      const selectedButton = e.target;
      selectedButton.classList.add('selected');
      
      // Actualizar dificultad
      gameState.difficulty = parseInt(selectedButton.dataset.difficulty);
    });
  });
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
  document.getElementById('popup-container').classList.remove('hidden');
  document.getElementById('current-player').textContent = `${gameState.players[0]}, escribe la palabra:`;
  document.getElementById('secret-word-input').focus();
}

function startMultiGame() {
  const secretWord = document.getElementById('secret-word-input').value.trim().toUpperCase();
  
  if (!secretWord) {
    showMobileAlert('¡Debes escribir una palabra!');
    return;
  }
  
  if (!/^[A-ZÑ]+$/.test(secretWord)) {
    showMobileAlert('Solo letras permitidas');
    return;
  }
  
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

  const timerElement = document.querySelector('.timer-circle');
  if (difficultyConfig.timer > 0) {
    timerElement.classList.remove('hidden');
    startTimer();
  } else {
    timerElement.classList.add('hidden');
  }
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
    letters.slice(0, 9),   
    letters.slice(9, 18),  
    letters.slice(18, 27)  
  ];

  rows.forEach((row, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = `keyboard-row row-${index + 1}`;
    
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

// En la función startTimer:
function startTimer() {
  const progressCircle = document.querySelector('.progress-circle');
  const circumference = 283;
  const timeLimit = DIFFICULTY_LEVELS[gameState.difficulty].timer;
  
  // Solo si hay temporizador
  if(timeLimit > 0) {
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
}

function showMobileAlert(message) {
  const alert = document.createElement('div');
  alert.className = 'mobile-alert';
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => alert.remove(), 2000);
}

function hideOverlay() {
  document.getElementById('popup-container').classList.add('hidden');
  document.getElementById('secret-word-input').value = '';
}