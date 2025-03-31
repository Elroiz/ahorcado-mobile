// Constantes y Configuración
const DIFFICULTY_LEVELS = {
  0: { name: "Fácil", fails: 10, timer: 0, startImage: 0, points: 1 },
  25: { name: "Normal", fails: 8, timer: 35, startImage: 2, points: 2 },
  50: { name: "Difícil", fails: 6, timer: 25, startImage: 4, points: 5 },
  100: { name: "Extremo", fails: 4, timer: 15, startImage: 6, points: 10 }
};

const DIFFICULTY_ORDER = [0, 25, 50, 100];

const WORD_LIST = [
  { word: "BOSQUE", hint: "Área densamente poblada de árboles", theme: "Naturaleza" },
  { word: "CASTILLO", hint: "Fortaleza medieval con torres", theme: "Historia y Política" },
  { word: "MUSICA", hint: "Arte de combinar sonidos", theme: "Arte y Cultura" },
  { word: "DRAGON", hint: "Criatura mitológica que escupe fuego", theme: "Mitología y Fantasía" },
  { word: "CIENCIA", hint: "Conjunto de conocimientos sobre el mundo", theme: "Ciencia y Tecnología" },
  { word: "COMETA", hint: "Cuerpo celeste con cola luminosa", theme: "Astronomía" },
  { word: "VESTIDO", hint: "Prenda de ropa que cubre el cuerpo entero", theme: "Moda y complementos" },
  { word: "ACELERADOR", hint: "Pedal que controla la velocidad del motor", theme: "Mundo del motor" },
  { word: "BALONMANO", hint: "Deporte de equipo jugado con una pelota y porterías", theme: "Deportes" }
];

const CHARACTERS = {
  daniel: {
    name: 'DANIEL',
    image: 'img/characters/daniel.png'
  },
  maria: {
    name: 'MARIA',
    image: 'img/characters/maria.png'
  },
  aroa: {
    name: 'AROA',
    image: 'img/characters/aroa.png'
  },
  cristian: {
    name: 'CRISTIAN',
    image: 'img/characters/cristian.png'
  }
};

// Estado del juego
const gameState = {
  mode: null,
  players: [],
  singleConfig: {
    difficulty: 50,
    selectedTheme: "aleatorio"
  },
  multiConfig: {
    difficulty: 50
  },
  secretWord: '',
  guessedLetters: [],
  wrongLetters: [],
  attemptsLeft: 0,
  timer: null,
  timeLeft: 0,
  hint: '',
  gameActive: false,
  player1: null,
  player2: null,
  currentPlayer: null,
  scores: {
    daniel: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    maria: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    aroa: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    cristian: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 }
  }
};

// Gestión de eventos táctiles
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = e => {
  const { clientX: touchEndX, clientY: touchEndY } = e.changedTouches[0];
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && 
      !document.getElementById('game-screen').classList.contains('hidden')) {
    if (deltaX > 0) resetGame();
  }
};

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
  showStartScreen();
  
  // Event Listeners del menú
  document.getElementById('home-button').addEventListener('click', () => {
    if (gameState.gameActive) {
      showConfirmDialog('¿Estás seguro de que quieres volver al inicio?<br>Se perderá la partida actual.', () => {
        resetGameState();
        showStartScreen();
        updateMenuSelection('home-button');
      });
    } else {
      resetGameState();
      showStartScreen();
      updateMenuSelection('home-button');
    }
  });
  
  document.getElementById('single-player-button').addEventListener('click', () => {
    if (gameState.gameActive) {
      showConfirmDialog('¿Estás seguro de que quieres cambiar al modo un jugador?<br>Se perderá la partida actual.', () => {
        resetGameState();
        showConfig('single');
        updateMenuSelection('single-player-button');
      });
    } else {
      resetGameState();
      showConfig('single');
      updateMenuSelection('single-player-button');
    }
  });
  
  document.getElementById('multi-player-button').addEventListener('click', () => {
    if (gameState.gameActive) {
      showConfirmDialog('¿Estás seguro de que quieres cambiar al modo dos jugadores?<br>Se perderá la partida actual.', () => {
        resetGameState();
        showConfig('multi');
        updateMenuSelection('multi-player-button');
      });
    } else {
      resetGameState();
      showConfig('multi');
      updateMenuSelection('multi-player-button');
    }
  });
  
  document.getElementById('score-button').addEventListener('click', () => {
    if (gameState.gameActive) {
      showConfirmDialog('¿Estás seguro de que quieres ver el marcador?<br>Se perderá la partida actual.', () => {
        showScoreScreen();
        updateMenuSelection('score-button');
      });
    } else {
      showScoreScreen();
      updateMenuSelection('score-button');
    }
  });
  
  // Event Listeners existentes
  document.getElementById('start-single-game').addEventListener('click', startSingleGame);
  document.getElementById('next-multi').addEventListener('click', handleMultiPlayerSetup);
  document.getElementById('confirm-word').addEventListener('click', startMultiGame);
  
  // Gestos táctiles
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  
  // Configuración inicial
  setupDifficultySlider();
  
  // Seleccionar el botón de inicio por defecto
  updateMenuSelection('home-button');
});

// Funciones de UI
const showConfig = mode => {
  resetAllSelectors();
  
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });
  
  // Mostrar la pantalla de configuración correspondiente
  const configScreen = document.getElementById(`config-${mode}`);
  if (!configScreen) {
    console.error(`No se encontró la pantalla de configuración para el modo ${mode}`);
    return;
  }
  
  configScreen.classList.remove('hidden');
  requestAnimationFrame(() => configScreen.classList.add('active'));
  
  // Actualizar el modo y cargar la configuración correspondiente
  gameState.mode = mode;
  if (mode === 'single') {
    gameState.difficulty = gameState.singleConfig.difficulty;
    gameState.selectedTheme = gameState.singleConfig.selectedTheme;
    setupThemeSlider();
  } else {
    gameState.difficulty = gameState.multiConfig.difficulty;
  }
  
  setupDifficultySlider(mode);
};

const createSlider = (container, options) => {
  const leftBtn = container.querySelector('.left-btn');
  const rightBtn = container.querySelector('.right-btn');
  const track = container.querySelector(options.trackClass);
  const slides = track.querySelectorAll(options.slideClass);
  
  let currentIndex = 0;
  let isAnimating = false;
  
  // Inicializar el valor por defecto
  if (options.onInit) {
    const currentSlide = slides[currentIndex];
    options.onInit(currentSlide, currentIndex);
  }
  
  const updateSlide = (direction) => {
    if (isAnimating) return;
    
    const totalSlides = slides.length;
    const newIndex = (currentIndex + direction + totalSlides) % totalSlides;
    
    if (newIndex === currentIndex) return;
    
    isAnimating = true;
    currentIndex = newIndex;
    
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Actualizar el estado
    const currentSlide = slides[currentIndex];
    if (options.onUpdate) {
      options.onUpdate(currentSlide, currentIndex);
    }
    
    // Limpiar después de la animación
    track.addEventListener('transitionend', () => {
      isAnimating = false;
      track.style.transition = 'none';
    }, { once: true });
  };
  
  leftBtn.addEventListener('click', () => updateSlide(-1));
  rightBtn.addEventListener('click', () => updateSlide(1));
};

// Configuración del slider de dificultad
const setupDifficultySlider = (mode) => {
  const containers = document.querySelectorAll('.difficulty-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.difficulty-slider .difficulty-track',
      slideClass: '.difficulty-slide',
      onInit: (slide, index) => {
        const difficulty = parseInt(slide.dataset.difficulty);
        // Guardar en la configuración correspondiente
        if (mode === 'single') {
          gameState.singleConfig.difficulty = difficulty;
        } else {
          gameState.multiConfig.difficulty = difficulty;
        }
        updateDifficultyDisplay(difficulty);
      },
      onUpdate: (slide, index) => {
        const difficulty = parseInt(slide.dataset.difficulty);
        // Actualizar configuración según modo
        if (mode === 'single') {
          gameState.singleConfig.difficulty = difficulty;
        } else {
          gameState.multiConfig.difficulty = difficulty;
        }
        updateDifficultyDisplay(difficulty);
      }
    });
  });
};

// Función auxiliar para actualizar display
const updateDifficultyDisplay = (difficulty) => {
  document.querySelectorAll('.difficulty-name').forEach(element => {
    element.textContent = DIFFICULTY_LEVELS[difficulty].name.toUpperCase();
  });
};

const setupCharacterSlider = () => {
  const containers = document.querySelectorAll('.character-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.character-track',
      slideClass: '.character-slide',
      onInit: (slide, index) => {
        const character = slide.dataset.character;
        updateCharacterSelection(container, character);
      },
      onUpdate: (slide, index) => {
        const character = slide.dataset.character;
        updateCharacterSelection(container, character);
      }
    });
  });
};

const updateCharacterSelection = (container, character) => {
  const isMultiPlayer = container.closest('#config-multi') !== null;
  const isPlayer2 = container.closest('.input-group:nth-child(2)') !== null;
  
  if (isMultiPlayer) {
    if (isPlayer2) {
      gameState.player2 = CHARACTERS[character];
    } else {
      gameState.player1 = CHARACTERS[character];
    }
  } else {
    gameState.player1 = CHARACTERS[character];
  }
};

// Configuración del slider de tema
const setupThemeSlider = () => {
  const containers = document.querySelectorAll('.theme-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.theme-track',
      slideClass: '.theme-slide',
      onInit: (slide, index) => {
        gameState.selectedTheme = slide.dataset.theme;
      },
      onUpdate: (slide, index) => {
        gameState.selectedTheme = slide.dataset.theme;
      }
    });
  });
};

const handleMultiPlayerSetup = () => {
  if (!gameState.player1 || !gameState.player2) {
    showMobileAlert('Por favor, selecciona un personaje para cada jugador');
    return;
  }
  
  if (gameState.player1.name === gameState.player2.name) {
    showMobileAlert('Los jugadores no pueden elegir el mismo personaje');
    return;
  }
  
  gameState.mode = 'multi';
  gameState.currentPlayer = gameState.player1;
  showPopup();
};

const showPopup = () => {
  const popup = document.getElementById('popup-container');
  const input = document.getElementById('secret-word-input');
  
  // Actualizar imágenes de los jugadores
  const player1Btn = document.querySelector('.player-select-btn[data-player="1"]');
  const player2Btn = document.querySelector('.player-select-btn[data-player="2"]');
  
  player1Btn.querySelector('img').src = gameState.player1.image;
  player2Btn.querySelector('img').src = gameState.player2.image;
  
  // Seleccionar jugador 1 por defecto
  player1Btn.classList.add('selected');
  player2Btn.classList.remove('selected');
  gameState.currentPlayer = gameState.player1;
  document.getElementById('current-player').textContent = `${gameState.player1.name}, ESCRIBE TU PALABRA SECRETA`;
  
  // Agregar event listeners para la selección de jugadores
  player1Btn.addEventListener('click', () => selectPlayer(1));
  player2Btn.addEventListener('click', () => selectPlayer(2));
  
  popup.classList.remove('hidden');
  input.value = ''; // Limpiar el input
  input.focus();
};

const selectPlayer = (playerNumber) => {
  const player1Btn = document.querySelector('.player-select-btn[data-player="1"]');
  const player2Btn = document.querySelector('.player-select-btn[data-player="2"]');
  
  if (playerNumber === 1) {
    player1Btn.classList.add('selected');
    player2Btn.classList.remove('selected');
    gameState.currentPlayer = gameState.player1;
    document.getElementById('current-player').textContent = `${gameState.player1.name}, ESCRIBE TU PALABRA SECRETA`;
  } else {
    player2Btn.classList.add('selected');
    player1Btn.classList.remove('selected');
    gameState.currentPlayer = gameState.player2;
    document.getElementById('current-player').textContent = `${gameState.player2.name}, ESCRIBE TU PALABRA SECRETA`;
  }
};

const hideOverlay = () => {
  document.getElementById('popup-container').classList.add('hidden');
};

const startMultiGame = () => {
  const secretWord = document.getElementById('secret-word-input').value.trim().toUpperCase();
  
  if (!secretWord) {
    showMobileAlert('¡Debes escribir una palabra!');
    return;
  }
  
  if (!/^[A-ZÑ]+$/.test(secretWord)) {
    showMobileAlert('Solo se permiten letras');
    return;
  }
  
  // Resetear el estado del juego antes de inicializar
  resetGameState();
  
  // Configurar la palabra secreta
  gameState.secretWord = secretWord;
  
  // El jugador que escribió la palabra será el que adivina
  // Si el jugador actual es el jugador 1, el jugador 2 adivinará
  // Si el jugador actual es el jugador 2, el jugador 1 adivinará
  if (gameState.currentPlayer === gameState.player1) {
    gameState.currentPlayer = gameState.player2;
  } else {
    gameState.currentPlayer = gameState.player1;
  }
  
  hideOverlay();
  initializeGame();
};

const initializeGame = () => {
  // Obtener dificultad según modo actual
  const currentDifficulty = gameState.mode === 'single' 
    ? gameState.singleConfig.difficulty 
    : gameState.multiConfig.difficulty;

  const difficultyConfig = DIFFICULTY_LEVELS[currentDifficulty];
  if (!difficultyConfig) {
    console.error('Configuración de dificultad no encontrada:', currentDifficulty);
    return;
  }

  // Inicializar estado del juego
  gameState.guessedLetters = Array(gameState.secretWord.length).fill('_');
  gameState.wrongLetters = [];
  gameState.attemptsLeft = difficultyConfig.fails;
  gameState.gameActive = true;
  
  // Configurar elementos del juego
  setupGameElements(difficultyConfig);
  setupTimer(difficultyConfig);
  setupHintButton();
  
  // Actualizar UI
  updateGameUI();
  updateCurrentPlayerAvatar();
};

const updateCurrentPlayerAvatar = () => {
  const playerAvatar = document.getElementById('player-avatar');
  if (playerAvatar && gameState.currentPlayer) {
    playerAvatar.src = gameState.currentPlayer.image;
  }
};

const updateGameUI = () => {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });

  const gameScreen = document.getElementById('game-screen');
  gameScreen.classList.remove('hidden');
  requestAnimationFrame(() => gameScreen.classList.add('active'));
};

const setupGameElements = (difficultyConfig) => {
  updateHangmanImage(difficultyConfig.startImage);
  updateGameDisplay();
  resetKeyboard();
  setupHintButton();
  setupTimer(difficultyConfig);
};

const setupTimer = (difficultyConfig) => {
  const timerDisplay = document.querySelector('.timer-progress');
  const timerContainer = document.querySelector('.timer-container');
  const hourglassIcon = document.querySelector('.hourglass-icon');
  if (!timerDisplay || !timerContainer) return;
  
  const totalTime = difficultyConfig.timer;
  
  // Ocultar el contenedor del temporizador si no hay tiempo límite
  if (totalTime <= 0) {
    timerContainer.style.display = 'none';
    return;
  }
  
  // Mostrar el contenedor del temporizador si hay tiempo límite
  timerContainer.style.display = 'block';
  
  // Reiniciar la animación del reloj de arena
  if (hourglassIcon) {
    hourglassIcon.classList.remove('stop-animation');
  }
  
  // Limpiar cualquier temporizador existente
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  
  // Reiniciar el progreso visual
  timerDisplay.style.width = '0%';
  
  // Inicializar el tiempo restante
  gameState.timeLeft = totalTime;
  
  // Crear el temporizador
  gameState.timer = setInterval(() => {
    if (!gameState.gameActive) {
      clearInterval(gameState.timer);
      return;
    }
    
    gameState.timeLeft--;
    const progress = ((totalTime - gameState.timeLeft) / totalTime) * 100;
    timerDisplay.style.width = `${progress}%`;
    
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timer);
      endGame(false);
    }
  }, 1000); // Actualizar cada segundo
};

const handleLetter = letter => {
  if (!gameState.gameActive) return; // No procesar letras si el juego no está activo
  
  const button = document.querySelector(`button[data-letter="${letter}"]`);
  button.disabled = true;

  if (gameState.secretWord.includes(letter)) {
    handleCorrectLetter(letter, button);
  } else {
    handleWrongLetter(letter, button);
  }

  updateGameDisplay();
  checkGameStatus();
};

const handleCorrectLetter = (letter, button) => {
  button.classList.add('correct');
  gameState.secretWord.split('').forEach((char, index) => {
    if (char === letter) gameState.guessedLetters[index] = letter;
  });
  
  resetTimer();
};

const handleWrongLetter = (letter, button) => {
  if (!gameState.gameActive) return; // No procesar letras incorrectas si el juego no está activo
  
  button.classList.add('incorrect');
  gameState.wrongLetters.push(letter);
  gameState.attemptsLeft--;
  updateHangmanImage();
};

const resetTimer = () => {
  const timerDisplay = document.querySelector('.timer-progress');
  const timerContainer = document.querySelector('.timer-container');
  if (!timerDisplay || !timerContainer) return;
  
  const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
  if (difficultyConfig.timer > 0) {
    timerDisplay.style.width = '0%';
    gameState.timeLeft = difficultyConfig.timer;
  }
};

const endGame = win => {
  gameState.gameActive = false;
  
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  
  // Obtener clave exacta del personaje
  const getCharacterKey = (currentPlayer) => {
    return Object.keys(CHARACTERS).find(key => 
      CHARACTERS[key].name === currentPlayer.name
    );
  };
  
  const playerKey = getCharacterKey(gameState.currentPlayer);
  if (!playerKey) {
    console.error('No se encontró la clave del personaje para:', gameState.currentPlayer.name);
    return;
  }

  // Pasar dificultad numérica real (0, 25, 50, 100)
  updateScores(playerKey, gameState.difficulty, win);
  
  // Detener la animación del reloj de arena
  const hourglassIcon = document.querySelector('.hourglass-icon');
  if (hourglassIcon) {
    hourglassIcon.classList.add('stop-animation');
  }
  
  // Deshabilitar todos los botones del teclado
  document.querySelectorAll('#keyboard button').forEach(button => {
    button.disabled = true;
  });
  
  // Deshabilitar el botón de pista si existe
  const hintButton = document.getElementById('hint-button');
  if (hintButton) {
    hintButton.disabled = true;
  }
  
  // Mostrar mensaje en el popup de fin de partida
  const message = win ? 
    `¡FELICIDADES ${gameState.currentPlayer.name}! HAS GANADO.` :
    `¡GAME OVER! LA PALABRA ERA: ${gameState.secretWord}`;
    
  showEndGamePopup(message);
  
  if (win) {
    resetTimer();
  }
};

const showEndGamePopup = (message) => {
  const popup = document.getElementById('end-game-popup');
  const messageElement = document.getElementById('end-game-message');
  const newGameBtn = document.getElementById('new-game-btn');
  const nextRoundBtn = document.getElementById('next-round-btn');
  
  messageElement.textContent = message;
  
  // Configurar botones
  newGameBtn.onclick = () => {
    popup.classList.add('hidden');
    resetGame();
  };
  
  nextRoundBtn.onclick = () => {
    popup.classList.add('hidden');
    if (gameState.mode === 'multi') {
      showPopup();
    } else {
      gameState.secretWord = getRandomWord();
      initializeGame();
    }
  };
  
  popup.classList.remove('hidden');
};

const resetGame = () => {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });

  // Ocultar el diálogo de fin de juego
  const gameEndDialog = document.getElementById('game-end-dialog');
  if (gameEndDialog) {
    gameEndDialog.classList.add('hidden');
  }

  // Limpiar la selección de personajes
  clearCharacterSelection();

  // Resetear solo los parámetros de la partida actual
  Object.assign(gameState, {
    players: [],
    secretWord: '',
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: 0,
    timeLeft: 0,
    hint: '',
    gameActive: false,
    currentPlayer: null
  });

  // Mostrar la pantalla de configuración correspondiente
  if (gameState.mode === 'single') {
    showConfig('single');
  } else if (gameState.mode === 'multi') {
    showConfig('multi');
  }
};

// Utilidades
const showMobileAlert = message => {
  const alert = document.createElement('div');
  alert.className = 'mobile-alert';
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
};

const startSingleGame = () => {
  if (!gameState.player1) {
    showMobileAlert('Por favor, selecciona un personaje');
    return;
  }
  
  gameState.mode = 'single';
  gameState.currentPlayer = gameState.player1;
  gameState.secretWord = getRandomWord();
  initializeGame();
};

const getRandomWord = () => {
  const theme = gameState.selectedTheme;
  let filteredWords = WORD_LIST;
  
  // Filtrar palabras por tema si no es aleatorio
  if (theme !== 'aleatorio') {
    filteredWords = WORD_LIST.filter(word => word.theme === theme);
  }
  
  // Si no hay palabras para el tema seleccionado, usar todas
  if (filteredWords.length === 0) {
    filteredWords = WORD_LIST;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  const selectedWord = filteredWords[randomIndex];
  
  // Guardar la pista para usarla después
  gameState.hint = selectedWord.hint;
  
  return selectedWord.word;
};

const updateHangmanImage = () => {
  if (!gameState.gameActive) return;
  
  const hangmanContainer = document.getElementById('hangman-container');
  const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
  const currentImage = difficultyConfig.startImage + 
    (difficultyConfig.fails - gameState.attemptsLeft);

  // Crear la nueva imagen
  const newImage = document.createElement('img');
  newImage.src = `img/ahorcado_${String(currentImage).padStart(2, '0')}.png`;
  newImage.classList.add('ahorcado');
  newImage.alt = `Estado del ahorcado - Intento ${currentImage}`;

  // Obtener la imagen actual
  const currentImageElement = hangmanContainer.querySelector('img.active');
  
  // Agregar la nueva imagen al contenedor
  hangmanContainer.appendChild(newImage);

  // Forzar un reflow para asegurar que la transición funcione
  newImage.offsetHeight;

  if (currentImageElement) {
    // Marcar la imagen actual como previa
    currentImageElement.classList.remove('active');
    currentImageElement.classList.add('prev');

    // Activar la nueva imagen
    newImage.classList.add('active');

    // Eliminar la imagen anterior después de que la nueva esté completamente visible
    setTimeout(() => {
      currentImageElement.remove();
    }, 1200); // Ajustamos el tiempo para que coincida con la transición CSS
  } else {
    // Si no hay imagen anterior, simplemente mostrar la nueva
    newImage.classList.add('active');
  }
};

const updateGameDisplay = () => {
  const wordDisplay = document.getElementById('word-display');
  
  wordDisplay.textContent = gameState.guessedLetters.join(' ');
  
  // Actualizar teclado
  document.querySelectorAll('#keyboard button').forEach(button => {
    const letter = button.getAttribute('data-letter');
    if (gameState.wrongLetters.includes(letter)) {
      button.classList.add('incorrect');
      button.disabled = true;
    } else if (gameState.guessedLetters.includes(letter)) {
      button.classList.add('correct');
      button.disabled = true;
    }
  });
};

const resetKeyboard = () => {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  
  const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const rows = [
    letters.slice(0, 7),    // Primera fila: A-G
    letters.slice(7, 14),   // Segunda fila: H-N
    letters.slice(14, 21),  // Tercera fila: O-U
    letters.slice(21, 27)   // Cuarta fila: V-Z
  ];

  rows.forEach((row, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = `keyboard-row row-${index + 1}`;
    
    row.forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      button.dataset.letter = letter;
      button.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!button.disabled) handleLetter(letter);
      });
      rowDiv.appendChild(button);
    });
    keyboard.appendChild(rowDiv);
  });
};

const setupHintButton = () => {
  const hintButton = document.getElementById('hint-button');
  const hintDisplay = document.getElementById('hint-display');
  
  // Ocultar pista y botón por defecto
  hintDisplay.textContent = '';
  hintButton.style.display = 'none';
  
  // Solo mostrar el botón de pista en modo individual y dificultades Fácil y Normal
  if (gameState.mode === 'single' && (gameState.difficulty === 0 || gameState.difficulty === 25)) {
    hintButton.style.display = 'block';
    hintButton.disabled = false;
    hintButton.style.opacity = '1';
    
    // Remover el event listener anterior si existe
    hintButton.removeEventListener('click', handleHintClick);
    // Añadir el nuevo event listener
    hintButton.addEventListener('click', handleHintClick);
  }
};

const handleHintClick = () => {
  const hintDisplay = document.getElementById('hint-display');
  const hintButton = document.getElementById('hint-button');
  
  hintDisplay.textContent = gameState.hint;
  hintButton.disabled = true;
  hintButton.style.opacity = '0.5';
};

const checkGameStatus = () => {
  if (!gameState.guessedLetters.includes('_')) {
    endGame(true);
  } else if (gameState.attemptsLeft <= 0) {
    endGame(false);
  }
};

// Función para actualizar la selección del menú
const updateMenuSelection = (selectedId) => {
  document.querySelectorAll('.nav-button').forEach(button => {
    button.classList.remove('selected');
  });
  document.getElementById(selectedId).classList.add('selected');
};

// Función para mostrar la pantalla de marcador
const showScoreScreen = () => {
  const scoreScreen = document.getElementById('score-screen');
  const scoreList = document.querySelector('.score-list');
  
  if (!scoreScreen || !scoreList) {
    console.error('No se encontraron los elementos necesarios para mostrar el marcador');
    return;
  }
  
  // Cargar puntuaciones guardadas
  loadScores();
  
  // Crear el HTML para mostrar las puntuaciones
  let scoreHTML = '';
  
  // Mostrar los cuatro personajes
  Object.entries(CHARACTERS).forEach(([key, character]) => {
    scoreHTML += `
      <div class="player-score">
        <div class="player-info">
          <img src="${character.image}" alt="${character.name}" class="player-avatar">
          <div class="player-name">${character.name}</div>
        </div>
        <div class="score-details">
          <div class="score-rows">
            <div class="score-row">
              <span class="difficulty-label">Fácil:</span>
              <span class="score-value">${gameState.scores[key].easy}</span>
            </div>
            <div class="score-row">
              <span class="difficulty-label">Normal:</span>
              <span class="score-value">${gameState.scores[key].normal}</span>
            </div>
            <div class="score-row">
              <span class="difficulty-label">Difícil:</span>
              <span class="score-value">${gameState.scores[key].hard}</span>
            </div>
            <div class="score-row">
              <span class="difficulty-label">Extremo:</span>
              <span class="score-value">${gameState.scores[key].extreme}</span>
            </div>
          </div>
          <div class="total">
            <span class="difficulty-label">TOTAL:</span>
            <span class="score-value">${gameState.scores[key].total}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  // Añadir el botón de reset al final
  scoreHTML += `
    <div class="reset-scores-container">
      <button id="reset-scores-button" class="reset-scores-button">
        Resetear Puntuaciones
      </button>
    </div>
  `;
  
  scoreList.innerHTML = scoreHTML;
  
  // Añadir el event listener al botón de reset
  const resetButton = document.getElementById('reset-scores-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      showConfirmDialog(
        '¿Estás seguro de que quieres resetear todas las puntuaciones?\nEsta acción no se puede deshacer.',
        resetAllScores
      );
    });
  }
  
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });
  
  // Mostrar la pantalla de marcador
  scoreScreen.classList.remove('hidden');
  requestAnimationFrame(() => scoreScreen.classList.add('active'));
};

// Función para actualizar puntuaciones
function updateScores(playerKey, difficulty, won) {
  if (!won) return;

  // 1. Obtener configuración exacta de la dificultad
  const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
  if (!difficultyConfig) {
    console.error('Configuración de dificultad no encontrada:', difficulty);
    return;
  }

  // 2. Mapear nombre de dificultad a claves consistentes
  const difficultyMap = {
    'fácil': 'easy',
    'normal': 'normal',
    'difícil': 'hard',
    'extremo': 'extreme'
  };

  // 3. Obtener clave de dificultad desde el nombre localizado
  const difficultyKey = difficultyMap[difficultyConfig.name.toLowerCase()];
  if (!difficultyKey) {
    console.error('Clave de dificultad no encontrada para:', difficultyConfig.name);
    return;
  }

  // 4. Asignación precisa de puntos según dificultad
  const points = {
    easy: 1,
    normal: 3,
    hard: 6,
    extreme: 10
  }[difficultyKey];

  if (!points) {
    console.error('Puntos no encontrados para la dificultad:', difficultyKey);
    return;
  }

  // 5. Actualizar puntuaciones
  if (!gameState.scores[playerKey]) {
    gameState.scores[playerKey] = {
      easy: 0,
      normal: 0,
      hard: 0,
      extreme: 0,
      total: 0
    };
  }

  gameState.scores[playerKey][difficultyKey] += points;
  gameState.scores[playerKey].total += points;
  
  // Debug para verificar los puntos asignados
  console.log(`Puntos asignados a ${playerKey}:`, {
    dificultad: difficultyConfig.name,
    clave: difficultyKey,
    puntos: points,
    total: gameState.scores[playerKey].total
  });
  
  saveScores();
}

// Función para guardar puntuaciones en localStorage
function saveScores() {
  try {
    localStorage.setItem('hangmanScores', JSON.stringify(gameState.scores));
  } catch (error) {
    console.error('Error al guardar puntuaciones:', error);
  }
}

// Función para cargar puntuaciones desde localStorage
function loadScores() {
  const savedScores = localStorage.getItem('hangmanScores');
  if (savedScores) {
    try {
      const parsedScores = JSON.parse(savedScores);
      // Migrar datos antiguos si es necesario
      Object.keys(CHARACTERS).forEach(key => {
        if (parsedScores[key]) {
          gameState.scores[key] = parsedScores[key];
        }
      });
    } catch (error) {
      console.error('Error al cargar puntuaciones:', error);
    }
  }
}

const showCharacterScreen = () => {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });

  // Mostrar la pantalla de configuración single
  const configScreen = document.getElementById('config-single');
  configScreen.classList.remove('hidden');
  requestAnimationFrame(() => configScreen.classList.add('active'));
};

const showMultiPlayerConfig = () => {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });

  // Mostrar la pantalla de configuración multi
  const configScreen = document.getElementById('config-multi');
  configScreen.classList.remove('hidden');
  requestAnimationFrame(() => configScreen.classList.add('active'));
};

// Función para mostrar diálogo de confirmación
const showConfirmDialog = (message, onConfirm) => {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <div class="confirm-content">
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="confirm-btn cancel">CANCELAR</button>
        <button class="confirm-btn confirm">CONFIRMAR</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  dialog.querySelector('.cancel').onclick = () => {
    dialog.remove();
  };
  
  dialog.querySelector('.confirm').onclick = () => {
    dialog.remove();
    onConfirm();
  };
};

// Función para resetear el juego completamente
const resetGameState = () => {
  // Guardar información que no queremos perder
  const mode = gameState.mode;
  const players = gameState.players;
  const player1 = gameState.player1;
  const player2 = gameState.player2;
  const currentPlayer = gameState.currentPlayer;
  
  // Cargar puntuaciones guardadas o usar valores por defecto
  loadScores();
  
  // Resetear el estado
  Object.assign(gameState, {
    difficulty: 50,
    secretWord: "",
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: 0,
    timer: null,
    timeLeft: 0,
    hint: "",
    gameActive: false,
    selectedTheme: "aleatorio"
  });
  
  // Restaurar información preservada
  gameState.mode = mode;
  gameState.players = players;
  gameState.player1 = player1;
  gameState.player2 = player2;
  gameState.currentPlayer = currentPlayer;
};

// Función para mostrar la pantalla de inicio
const showStartScreen = () => {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });
  
  const startScreen = document.getElementById('start-screen');
  
  // Remover la clase active si existe
  startScreen.classList.remove('active');
  
  // Mostrar la pantalla
  startScreen.classList.remove('hidden');
  
  // Forzar un reflow para asegurar que la animación se ejecute
  startScreen.offsetHeight;
  
  // Añadir la clase active después de un pequeño delay
  requestAnimationFrame(() => {
    startScreen.classList.add('active');
  });
};

// Función para limpiar la selección de personajes
const clearCharacterSelection = () => {
  // Limpiar el estado de los personajes
  gameState.player1 = null;
  gameState.player2 = null;
  gameState.currentPlayer = null;
  
  // Limpiar las imágenes de los personajes seleccionados
  const player1Img = document.querySelector('.player-select-btn[data-player="1"] img');
  const player2Img = document.querySelector('.player-select-btn[data-player="2"] img');
  if (player1Img) player1Img.src = '';
  if (player2Img) player2Img.src = '';
  
  // Remover la clase selected de los botones
  document.querySelectorAll('.player-select-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Resetear los tracks de personajes
  document.querySelectorAll('.character-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });
};

// Función para reiniciar todos los selectores
const resetAllSelectors = () => {
  // Reiniciar selectores de dificultad
  document.querySelectorAll('.difficulty-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });
  
  // Reiniciar selectores de tema
  document.querySelectorAll('.theme-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });
  
  // Reiniciar selectores de personajes
  document.querySelectorAll('.character-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });
  
  // Resetear valores por defecto
  gameState.difficulty = 50;
  gameState.selectedTheme = "aleatorio";
};

// Función para resetear todas las puntuaciones
const resetAllScores = () => {
  // Resetear puntuaciones a 0
  Object.keys(gameState.scores).forEach(player => {
    gameState.scores[player] = {
      easy: 0,
      normal: 0,
      hard: 0,
      extreme: 0,
      total: 0
    };
  });
  
  // Guardar en localStorage
  saveScores();
  
  // Actualizar la pantalla de marcador
  showScoreScreen();
};