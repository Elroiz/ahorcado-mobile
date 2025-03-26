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
  explorador: {
    name: 'EXPLORADOR',
    image: 'img/characters/explorador.png',
    description: 'Aventurero intrépido que busca tesoros perdidos'
  },
  detective: {
    name: 'DETECTIVE',
    image: 'img/characters/detective.png',
    description: 'Investigador astuto que resuelve misterios'
  },
  cientifico: {
    name: 'CIENTÍFICO',
    image: 'img/characters/cientifico.png',
    description: 'Genio brillante que descubre secretos'
  },
  mago: {
    name: 'MAGO',
    image: 'img/characters/mago.png',
    description: 'Mago misterioso con poderes especiales'
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

const setupDifficultySlider = () => {
  const containers = document.querySelectorAll('.difficulty-container');
  
  containers.forEach(container => {
    const leftBtn = container.querySelector('.left-btn');
    const rightBtn = container.querySelector('.right-btn');
    const track = container.querySelector('.difficulty-track');
    const slides = container.querySelectorAll('.difficulty-slide');
    
    let currentIndex = 0;
    let isAnimating = false;
    
    const updateDifficulty = (direction) => {
      if (isAnimating) return;
      
      const totalSlides = slides.length;
      const newIndex = (currentIndex + direction + totalSlides) % totalSlides;
      
      if (newIndex === currentIndex) return;
      
      isAnimating = true;
      currentIndex = newIndex;
      
      track.style.transition = 'transform 0.5s ease-in-out';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      // Actualizar el estado del juego
      const currentSlide = slides[currentIndex];
      const newDifficulty = parseInt(currentSlide.dataset.difficulty);
      gameState.difficulty = newDifficulty;
      
      // Actualizar la configuración del juego según la dificultad
      const difficultyConfig = DIFFICULTY_LEVELS[newDifficulty];
      gameState.maxFails = difficultyConfig.fails;
      gameState.timer = difficultyConfig.timer;
      gameState.startImage = difficultyConfig.startImage;
      
      // Limpiar después de la animación
      track.addEventListener('transitionend', () => {
        isAnimating = false;
        track.style.transition = 'none';
      }, { once: true });
    };
    
    leftBtn.addEventListener('click', () => updateDifficulty(-1));
    rightBtn.addEventListener('click', () => updateDifficulty(1));
  });
  
  // Inicializar el estado del juego con la dificultad por defecto
  const defaultSlide = document.querySelector('.difficulty-slide');
  const defaultDifficulty = parseInt(defaultSlide.dataset.difficulty);
  gameState.difficulty = defaultDifficulty;
  
  // Asegurar que el juego comience con la configuración correcta
  const defaultConfig = DIFFICULTY_LEVELS[defaultDifficulty];
  gameState.maxFails = defaultConfig.fails;
  gameState.timer = defaultConfig.timer;
  gameState.startImage = defaultConfig.startImage;
};

const setupCharacterSlider = () => {
  const containers = document.querySelectorAll('.character-container');
  
  containers.forEach(container => {
    const leftBtn = container.querySelector('.left-btn');
    const rightBtn = container.querySelector('.right-btn');
    const track = container.querySelector('.character-track');
    const slides = container.querySelectorAll('.character-slide');
    
    let currentIndex = 0;
    let isAnimating = false;
    
    // Inicializar el personaje por defecto
    const currentSlide = slides[currentIndex];
    const character = currentSlide.dataset.character;
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
    
    const updateCharacter = (direction) => {
      if (isAnimating) return;
      
      const totalSlides = slides.length;
      const newIndex = (currentIndex + direction + totalSlides) % totalSlides;
      
      if (newIndex === currentIndex) return;
      
      isAnimating = true;
      currentIndex = newIndex;
      
      track.style.transition = 'transform 0.5s ease-in-out';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      // Actualizar el estado del juego
      const currentSlide = slides[currentIndex];
      const character = currentSlide.dataset.character;
      
      // Determinar si estamos en modo individual o multijugador
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
      
      // Limpiar después de la animación
      track.addEventListener('transitionend', () => {
        isAnimating = false;
        track.style.transition = 'none';
      }, { once: true });
    };
    
    leftBtn.addEventListener('click', () => updateCharacter(-1));
    rightBtn.addEventListener('click', () => updateCharacter(1));
  });
};

const setupThemeSlider = () => {
  const containers = document.querySelectorAll('.theme-container');
  
  containers.forEach(container => {
    const leftBtn = container.querySelector('.left-btn');
    const rightBtn = container.querySelector('.right-btn');
    const track = container.querySelector('.theme-track');
    const slides = container.querySelectorAll('.theme-slide');
    
    let currentIndex = 0;
    let isAnimating = false;
    
    const updateTheme = (direction) => {
      if (isAnimating) return;
      
      const totalSlides = slides.length;
      const newIndex = (currentIndex + direction + totalSlides) % totalSlides;
      
      if (newIndex === currentIndex) return;
      
      isAnimating = true;
      currentIndex = newIndex;
      
      track.style.transition = 'transform 0.5s ease-in-out';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      // Actualizar el tema seleccionado en el estado del juego
      const currentSlide = slides[currentIndex];
      gameState.selectedTheme = currentSlide.dataset.theme;
      
      // Limpiar después de la animación
      track.addEventListener('transitionend', () => {
        isAnimating = false;
        track.style.transition = 'none';
      }, { once: true });
    };
    
    leftBtn.addEventListener('click', () => updateTheme(-1));
    rightBtn.addEventListener('click', () => updateTheme(1));
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
  popup.classList.remove('hidden');
  document.getElementById('current-player').textContent = `${gameState.player1.name}, escribe la palabra:`;
  input.value = ''; // Limpiar el input
  input.focus();
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
    showMobileAlert('Solo letras permitidas');
    return;
  }
  
  gameState.secretWord = secretWord;
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
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });

  const gameScreen = document.getElementById('game-screen');
  gameScreen.classList.remove('hidden');
  requestAnimationFrame(() => gameScreen.classList.add('active'));

  updateHangmanImage(difficultyConfig.startImage);
  updateGameDisplay();
  resetKeyboard();
  setupHintButton();

  // Configurar temporizador
  const timerCircle = document.querySelector('.timer-circle');
  if (difficultyConfig.timer > 0) {
    startTimer();
    timerCircle.classList.remove('hidden');
  } else {
    timerCircle.classList.add('hidden');
  }
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
      button.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!button.disabled) handleLetter(letter);
      });
      rowDiv.appendChild(button);
    });
    keyboard.appendChild(rowDiv);
  });
};

const handleLetter = letter => {
  const button = document.querySelector(`button[data-letter="${letter}"]`);
  button.disabled = true;

  if (gameState.secretWord.includes(letter)) {
    button.classList.add('correct');
    gameState.secretWord.split('').forEach((char, index) => {
      if (char === letter) gameState.guessedLetters[index] = letter;
    });
    
    // Reiniciar el temporizador cuando se acierta una letra
    const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
    if (difficultyConfig.timer > 0) {
      if (gameState.timer) {
        cancelAnimationFrame(gameState.timer);
      }
      gameState.timeLeft = difficultyConfig.timer;
      startTimer();
    }
  } else {
    button.classList.add('incorrect');
    gameState.wrongLetters.push(letter);
    gameState.attemptsLeft--;
    updateHangmanImage();
  }

  updateGameDisplay();
  checkGameStatus();
};

const updateHangmanImage = () => {
  const hangmanContainer = document.getElementById('hangman-container');
  const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
  const currentImage = difficultyConfig.startImage + 
    (difficultyConfig.fails - gameState.attemptsLeft);

  // Crear la nueva imagen
  const newImage = document.createElement('img');
  newImage.src = `img/ahorcado_${String(currentImage).padStart(2, '0')}.png`;
  newImage.classList.add('ahorcado');
  newImage.alt = `Estado del ahorcado - Intento ${currentImage}`;

  // Agregar la nueva imagen al contenedor
  hangmanContainer.appendChild(newImage);

  // Si hay una imagen anterior, iniciar la transición
  const currentImageElement = hangmanContainer.querySelector('img.active');
  if (currentImageElement) {
    // Mostrar la nueva imagen gradualmente
    requestAnimationFrame(() => {
      newImage.classList.add('active');
    });

    // Eliminar la imagen anterior después de la transición
    setTimeout(() => {
      currentImageElement.classList.remove('active');
      setTimeout(() => currentImageElement.remove(), 500);
    }, 500);
  } else {
    // Si no hay imagen anterior, simplemente mostrar la nueva
    newImage.classList.add('active');
  }
};

const checkGameStatus = () => {
  if (!gameState.guessedLetters.includes('_')) {
    endGame(true);
  } else if (gameState.attemptsLeft <= 0) {
    endGame(false);
  }
};

const endGame = win => {
  gameState.gameEnded = true;
  gameState.gameActive = false;
  
  if (gameState.timer) {
    cancelAnimationFrame(gameState.timer);
  }
  
  const message = win ? 
    `¡Felicidades ${gameState.players[0]}! Has ganado.` :
    `¡Game Over! La palabra era: ${gameState.secretWord}`;
    
  showMobileAlert(message);
  
  // Si ganó, reiniciar el temporizador para la siguiente palabra
  if (win) {
    const difficultyConfig = DIFFICULTY_LEVELS[gameState.difficulty];
    gameState.timeLeft = difficultyConfig.timer;
    if (difficultyConfig.timer > 0) {
      startTimer();
    }
  }
};

const resetGame = () => {
  gameState.gameActive = true;
  gameState.gameEnded = false;
  
  if (gameState.timer) {
    cancelAnimationFrame(gameState.timer);
  }
  
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden', 'active');
  });
  
  document.getElementById('start-screen').classList.remove('hidden');
  requestAnimationFrame(() => document.getElementById('start-screen').classList.add('active'));
};

const startTimer = () => {
  const startTime = performance.now();
  const duration = gameState.timeLeft * 1000;
  
  const updateTimer = timestamp => {
    if (!gameState.gameActive) return;
    
    const elapsed = timestamp - startTime;
    const remaining = Math.max(0, duration - elapsed);
    
    if (remaining === 0) {
      endGame(false);
      return;
    }
    
    const progress = (remaining / duration) * 100;
    const circle = document.querySelector('.progress-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    gameState.timer = requestAnimationFrame(updateTimer);
  };
  
  gameState.timer = requestAnimationFrame(updateTimer);
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