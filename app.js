// Constantes y Configuración
const DIFFICULTY_LEVELS = {
  0: { name: "Fácil", fails: 10, timer: 0, startImage: 0 },
  25: { name: "Normal", fails: 8, timer: 35, startImage: 2 },
  50: { name: "Difícil", fails: 6, timer: 25, startImage: 4 },
  100: { name: "Extremo", fails: 4, timer: 15, startImage: 6 }
};

const DIFFICULTY_ORDER = [0, 25, 50, 100];

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
  difficulty: 50,
  secretWord: "",
  guessedLetters: [],
  wrongLetters: [],
  attemptsLeft: 0,
  timer: null,
  timeLeft: 0,
  hint: "",
  gameActive: true,
  gameEnded: false,
  player1: null,
  player2: null,
  currentPlayer: null,
  selectedTheme: "aleatorio"
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
  document.getElementById('start-screen').classList.remove('hidden');
  
  // Event Listeners
  document.getElementById('single-player-btn').addEventListener('click', () => showConfig('single'));
  document.getElementById('multi-player-btn').addEventListener('click', () => showConfig('multi'));
  document.getElementById('start-single-game').addEventListener('click', startSingleGame);
  document.getElementById('next-multi').addEventListener('click', handleMultiPlayerSetup);
  document.getElementById('confirm-word').addEventListener('click', startMultiGame);
  document.getElementById('restart-button').addEventListener('click', resetGame);
  
  // Gestos táctiles
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  
  // Configuración inicial
  setupDifficultySlider();
});

// Funciones de UI
const showConfig = mode => {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active', 'hidden');
  });
  
  const configScreen = document.getElementById(`config-${mode}`);
  configScreen.classList.remove('hidden');
  requestAnimationFrame(() => configScreen.classList.add('active'));
  
  // Configurar todos los sliders
  setupDifficultySlider();
  setupCharacterSlider();
  setupThemeSlider();
};

const createSlider = (container, options) => {
  const leftBtn = container.querySelector('.left-btn');
  const rightBtn = container.querySelector('.right-btn');
  const track = container.querySelector(options.trackClass);
  const slides = container.querySelectorAll(options.slideClass);
  
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

const setupDifficultySlider = () => {
  const containers = document.querySelectorAll('.difficulty-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.difficulty-track',
      slideClass: '.difficulty-slide',
      onInit: (slide, index) => {
        const difficulty = parseInt(slide.dataset.difficulty);
        updateDifficultyConfig(difficulty);
      },
      onUpdate: (slide, index) => {
        const difficulty = parseInt(slide.dataset.difficulty);
        updateDifficultyConfig(difficulty);
      }
    });
  });
};

const updateDifficultyConfig = (difficulty) => {
  gameState.difficulty = difficulty;
  const config = DIFFICULTY_LEVELS[difficulty];
  gameState.maxFails = config.fails;
  gameState.timer = config.timer;
  gameState.startImage = config.startImage;
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
  const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
  
  // Inicializar estado del juego
  Object.assign(gameState, {
    attemptsLeft: difficultyConfig.fails,
    guessedLetters: Array(gameState.secretWord.length).fill('_'),
    wrongLetters: [],
    timeLeft: difficultyConfig.timer,
    gameActive: true,
    gameEnded: false
  });

  // Actualizar UI
  updateGameUI();
  setupGameElements(difficultyConfig);
  
  // Actualizar imagen del jugador que adivina
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
  gameState.gameEnded = true;
  gameState.gameActive = false;
  
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  
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
    `¡Felicidades ${gameState.currentPlayer.name}! Has ganado.` :
    `¡Game Over! La palabra era: ${gameState.secretWord}`;
    
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
      showPopup(); // Mostrar popup para introducir palabra en modo multijugador
    } else {
      gameState.secretWord = getRandomWord();
      initializeGame();
    }
  };
  
  popup.classList.remove('hidden');
};

const resetGame = () => {
  // Reiniciar el estado del juego
  Object.assign(gameState, {
    mode: null,
    players: [],
    difficulty: 50, // Dificultad por defecto
    secretWord: "",
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: 0,
    timer: null,
    timeLeft: 0,
    hint: "",
    gameActive: true,
    gameEnded: false,
    player1: null,
    player2: null,
    currentPlayer: null,
    selectedTheme: "aleatorio"
  });
  
  // Cancelar el temporizador si existe
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  
  // Ocultar todos los popups
  document.getElementById('popup-container').classList.add('hidden');
  document.getElementById('end-game-popup').classList.add('hidden');
  
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });
  
  // Mostrar la pantalla de inicio
  const startScreen = document.getElementById('start-screen');
  startScreen.classList.remove('hidden');
  requestAnimationFrame(() => startScreen.classList.add('active'));
  
  // Limpiar el input de palabra secreta
  const secretWordInput = document.getElementById('secret-word-input');
  if (secretWordInput) {
    secretWordInput.value = '';
  }
  
  // Limpiar el display de la palabra
  const wordDisplay = document.getElementById('word-display');
  if (wordDisplay) {
    wordDisplay.textContent = '';
  }
  
  // Limpiar el display de la pista
  const hintDisplay = document.getElementById('hint-display');
  if (hintDisplay) {
    hintDisplay.textContent = '';
  }
  
  // Limpiar el contenedor del ahorcado
  const hangmanContainer = document.getElementById('hangman-container');
  if (hangmanContainer) {
    hangmanContainer.innerHTML = '';
  }
  
  // Limpiar el teclado
  const keyboard = document.getElementById('keyboard');
  if (keyboard) {
    keyboard.innerHTML = '';
  }
  
  // Habilitar el botón de pista si existe
  const hintButton = document.getElementById('hint-button');
  if (hintButton) {
    hintButton.disabled = false;
    hintButton.style.opacity = '1';
    hintButton.style.display = 'none';
  }
  
  // Reiniciar el temporizador visual
  const progressCircle = document.querySelector('.progress-circle');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = '';
    progressCircle.style.strokeDashoffset = '';
  }

  // Reiniciar los selectores de personajes
  document.querySelectorAll('.character-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });

  // Reiniciar los selectores de dificultad
  document.querySelectorAll('.difficulty-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });

  // Reiniciar los selectores de tema
  document.querySelectorAll('.theme-track').forEach(track => {
    track.style.transform = 'translateX(0)';
  });

  // Reiniciar los botones de selección de jugador en el popup
  const player1Btn = document.querySelector('.player-select-btn[data-player="1"]');
  const player2Btn = document.querySelector('.player-select-btn[data-player="2"]');
  if (player1Btn && player2Btn) {
    player1Btn.classList.remove('selected');
    player2Btn.classList.remove('selected');
    const player1Img = player1Btn.querySelector('img');
    const player2Img = player2Btn.querySelector('img');
    if (player1Img) player1Img.src = '';
    if (player2Img) player2Img.src = '';
  }

  // Reiniciar el avatar del jugador
  const playerAvatar = document.getElementById('player-avatar');
  if (playerAvatar) {
    playerAvatar.src = '';
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