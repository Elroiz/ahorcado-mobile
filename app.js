// Constantes y Configuración
const DIFFICULTY_LEVELS = {
  0: { name: "Fácil", fails: 10, timer: 0, startImage: 0, points: 1 },
  25: { name: "Normal", fails: 8, timer: 35, startImage: 2, points: 2 },
  50: { name: "Difícil", fails: 6, timer: 25, startImage: 4, points: 5 },
  100: { name: "Extremo", fails: 4, timer: 15, startImage: 6, points: 10 }
};

const DIFFICULTY_ORDER = [0, 25, 50, 100];

// Reemplazar WORD_LIST con una función para cargar palabras
let wordList = [];

const loadWords = async () => {
  try {
    const response = await fetch('palabras.json');
    const data = await response.json();
    wordList = data.palabras;
    console.log('Palabras cargadas exitosamente:', wordList.length);
  } catch (error) {
    console.error('Error al cargar palabras:', error);
    // Fallback a una lista básica si hay error
    wordList = [
      { word: "BOSQUE", hint: "Área densamente poblada de árboles", theme: "Naturaleza" },
      { word: "CASTILLO", hint: "Fortaleza medieval con torres", theme: "Historia y Política" },
      { word: "MUSICA", hint: "Arte de combinar sonidos", theme: "Arte y Cultura" },
      { word: "DRAGON", hint: "Criatura mitológica que escupe fuego", theme: "Mitología y Fantasía" },
      { word: "CIENCIA", hint: "Conjunto de conocimientos sobre el mundo", theme: "Ciencia y Tecnología" }
    ];
  }
};

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
    difficulty: 25,
    selectedTheme: "aleatorio",
    selectedPlayer: null // Jugador seleccionado en modo un jugador
  },
  multiConfig: {
    difficulty: 25,
    player1: null, // Jugador 1 en modo multijugador
    player2: null  // Jugador 2 en modo multijugador
  },
  secretWord: '',
  guessedLetters: [],
  wrongLetters: [],
  attemptsLeft: 0,
  timer: null,
  timeLeft: 0,
  hint: '',
  gameActive: false,
  currentPlayer: null, // Jugador que está adivinando actualmente
  scores: {
    daniel: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    maria: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    aroa: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 },
    cristian: { easy: 0, normal: 0, hard: 0, extreme: 0, total: 0 }
  }
};

// Gestión de eventos táctiles con debounce
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const handleTouchStart = e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = debounce(e => {
  const { clientX: touchEndX, clientY: touchEndY } = e.changedTouches[0];
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && 
      !document.getElementById('game-screen').classList.contains('hidden')) {
    if (deltaX > 0) resetGame();
  }
}, 150);

// Sistema de persistencia de datos
const saveScores = () => {
  try {
    localStorage.setItem('hangmanScores', JSON.stringify(gameState.scores));
  } catch (error) {
    console.error('Error al guardar puntuaciones:', error);
  }
};

const loadScores = () => {
  try {
    const savedScores = localStorage.getItem('hangmanScores');
    if (!savedScores) return;

    const parsedScores = JSON.parse(savedScores);
    if (validateScores(parsedScores)) {
      gameState.scores = parsedScores;
    }
  } catch (error) {
    console.error('Error al cargar puntuaciones:', error);
  }
};

const validateScores = (scores) => {
  if (!scores || typeof scores !== 'object') return false;
  
  const requiredKeys = ['daniel', 'maria', 'aroa', 'cristian'];
  const requiredDifficultyKeys = ['easy', 'normal', 'hard', 'extreme', 'total'];
  
  return requiredKeys.every(player => {
    if (!scores[player] || typeof scores[player] !== 'object') return false;
    return requiredDifficultyKeys.every(key => 
      typeof scores[player][key] === 'number' && scores[player][key] >= 0
    );
  });
};

// Optimización de carga de imágenes
const preloadImages = () => {
  const images = [
    ...Object.values(CHARACTERS).map(char => char.image),
    'img/hourglass.png',
    'img/home.png',
    'img/solo.png',
    'img/multi.png',
    'img/score.png'
  ];

  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Optimización de animaciones
const setupAnimations = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
  }
};

// Inicialización optimizada
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar palabras
  await loadWords();
  
  // Cargar puntuaciones guardadas
  loadScores();
  
  // Preload de imágenes
  preloadImages();
  
  // Configurar animaciones
  setupAnimations();
  
  // Mostrar pantalla inicial
  showStartScreen();
  
  // Event Listeners del menú con manejo de errores
  const menuButtons = {
    'home-button': () => {
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
    },
    'single-player-button': () => {
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
    },
    'multi-player-button': () => {
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
    },
    'score-button': () => {
      if (gameState.gameActive) {
        showConfirmDialog('¿Estás seguro de que quieres ver el marcador?<br>Se perderá la partida actual.', () => {
          showScoreScreen();
          updateMenuSelection('score-button');
        });
      } else {
        showScoreScreen();
        updateMenuSelection('score-button');
      }
    }
  };

  // Agregar event listeners de manera segura
  Object.entries(menuButtons).forEach(([id, handler]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', handler);
    } else {
      console.error(`No se encontró el botón: ${id}`);
    }
  });
  
  // Event Listeners del juego
  document.getElementById('start-single-game')?.addEventListener('click', startSingleGame);
  document.getElementById('next-multi')?.addEventListener('click', handleMultiPlayerSetup);
  document.getElementById('confirm-word')?.addEventListener('click', startMultiGame);
  
  // Gestos táctiles
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Configuración inicial
  setupDifficultySlider();
  
  // Seleccionar el botón de inicio por defecto
  updateMenuSelection('home-button');
});

// Funciones de UI
const showConfig = mode => {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('active');
  });
  
  const configScreen = document.getElementById(`config-${mode}`);
  if (!configScreen) return;
  
  configScreen.classList.remove('hidden');
  requestAnimationFrame(() => {
    configScreen.classList.add('active');
  });
  
  gameState.mode = mode;
  
  if (!document.getElementById('next-round-btn')?.classList.contains('active')) {
    if (mode === 'single') {
      gameState.singleConfig.difficulty = 25;
      gameState.singleConfig.selectedTheme = "aleatorio";
      gameState.singleConfig.selectedPlayer = CHARACTERS.daniel;
    } else {
      gameState.multiConfig.difficulty = 25;
      gameState.multiConfig.player1 = CHARACTERS.daniel;
      gameState.multiConfig.player2 = CHARACTERS.maria;
    }
  }
  
  setupCharacterSlider(mode);
  setupDifficultySlider(mode);
  if (mode === 'single') {
    setupThemeSlider();
  }
};

const createSlider = (container, options) => {
  const track = container.querySelector(options.trackClass);
  const slides = container.querySelectorAll(options.slideClass);
  const leftBtn = container.querySelector('.left-btn');
  const rightBtn = container.querySelector('.right-btn');
  
  if (!track || !slides.length || !leftBtn || !rightBtn) {
    return;
  }
  
  const slideWidth = slides[0].offsetWidth;
  const maxIndex = slides.length - 1;
  
  // Encontrar el índice inicial basado en el valor inicial
  let currentIndex = 0;
  if (options.initialValue) {
    const initialSlide = Array.from(slides).find(slide => 
      slide.dataset[Object.keys(slide.dataset)[0]] === options.initialValue
    );
    if (initialSlide) {
      currentIndex = Array.from(slides).indexOf(initialSlide);
    }
  }
  
  // Posicionar el slider en el valor inicial sin transición
  track.style.transition = 'none';
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  
  // Forzar un reflow para asegurar que se aplique el estilo sin transición
  track.offsetHeight;
  
  // Restaurar la transición después de un frame
  requestAnimationFrame(() => {
    track.style.transition = '';
  });
  
  const updateSlider = (index) => {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    
    // Actualizar estado de los botones
    leftBtn.disabled = currentIndex === 0;
    rightBtn.disabled = currentIndex === maxIndex;
    
    // Llamar a la función de actualización si existe
    if (options.onUpdate) {
      options.onUpdate(slides[currentIndex], currentIndex);
    }
  };
  
  // Event listeners para los botones
  leftBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      updateSlider(currentIndex - 1);
    }
  });
  
  rightBtn.addEventListener('click', () => {
    if (currentIndex < maxIndex) {
      updateSlider(currentIndex + 1);
    }
  });
  
  // Inicializar el slider
  updateSlider(currentIndex);
  
  // Llamar a la función de inicialización si existe
  if (options.onInit) {
    options.onInit(slides[currentIndex], currentIndex);
  }
};

const createCharacterSlider = (container, options) => {
  const leftBtn = container.querySelector('.left-btn');
  const rightBtn = container.querySelector('.right-btn');
  const track = container.querySelector('.character-track');
  const slides = track.querySelectorAll('.character-slide');
  
  let currentIndex = 0;
  let isAnimating = false;

  const updateSlidePosition = () => {
      if (isAnimating) return;
      isAnimating = true;
      
      const slideWidth = slides[0].offsetWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      
      // Actualizar estado visual
      slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === currentIndex);
      });

      // Actualizar selección del personaje
      const selectedCharacter = slides[currentIndex].dataset.character;
      if (options.onCharacterSelect) {
          options.onCharacterSelect(selectedCharacter);
      }

      setTimeout(() => {
          isAnimating = false;
      }, 500);
  };

  leftBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
          currentIndex--;
          updateSlidePosition();
      }
  });

  rightBtn.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) {
          currentIndex++;
          updateSlidePosition();
      }
  });

  // Inicializar primera posición
  updateSlidePosition();
};

// Configuración del slider de dificultad
const setupDifficultySlider = (mode) => {
  const containers = document.querySelectorAll('.difficulty-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.difficulty-slider .difficulty-track',
      slideClass: '.difficulty-slide',
      initialValue: '25', // Normal por defecto
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

const setupCharacterSlider = (mode) => {
  const containers = document.querySelectorAll('.character-container');
  
  containers.forEach((container) => {
    // Determinar el valor inicial basado en el modo y el ID del contenedor
    let initialValue;
    if (mode === 'single') {
      initialValue = 'daniel';
    } else {
      // En modo multijugador, usar el ID del contenedor para identificar el jugador
      const isPlayer2 = container.id === 'player2-container';
      initialValue = isPlayer2 ? 'maria' : 'daniel';
    }
    
    createSlider(container, {
      trackClass: '.character-track',
      slideClass: '.character-slide',
      initialValue: initialValue,
      onInit: (slide, index) => {
        const character = slide.dataset.character;
        const characterData = CHARACTERS[character];
        
        if (mode === 'single') {
          gameState.singleConfig.selectedPlayer = characterData;
        } else {
          const isPlayer2 = container.id === 'player2-container';
          if (isPlayer2) {
            gameState.multiConfig.player2 = characterData;
          } else {
            gameState.multiConfig.player1 = characterData;
          }
        }
        
        // Actualizar visualización
        const avatarContainer = container.querySelector('.character-image-container img');
        if (avatarContainer) {
          avatarContainer.src = characterData.image;
          avatarContainer.alt = characterData.name;
        }
      },
      onUpdate: (slide, index) => {
        const character = slide.dataset.character;
        const characterData = CHARACTERS[character];
        
        if (mode === 'single') {
          gameState.singleConfig.selectedPlayer = characterData;
        } else {
          const isPlayer2 = container.id === 'player2-container';
          if (isPlayer2) {
            gameState.multiConfig.player2 = characterData;
          } else {
            gameState.multiConfig.player1 = characterData;
          }
        }
        
        // Actualizar visualización
        const avatarContainer = container.querySelector('.character-image-container img');
        if (avatarContainer) {
          avatarContainer.src = characterData.image;
          avatarContainer.alt = characterData.name;
        }
      }
    });
  });
};

const updateCharacterSelection = (container, character) => {
  const isMultiPlayer = container.closest('#config-multi') !== null;
  const isPlayer2 = container.closest('.input-group:nth-child(2)') !== null;
  
  if (isMultiPlayer) {
    if (isPlayer2) {
      gameState.multiConfig.player2 = CHARACTERS[character];
    } else {
      gameState.multiConfig.player1 = CHARACTERS[character];
    }
  } else {
    gameState.singleConfig.selectedPlayer = CHARACTERS[character];
  }
};

// Configuración del slider de tema
const setupThemeSlider = () => {
  const containers = document.querySelectorAll('.theme-container');
  
  containers.forEach(container => {
    createSlider(container, {
      trackClass: '.theme-track',
      slideClass: '.theme-slide',
      initialValue: 'aleatorio',
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
  if (!gameState.multiConfig.player1 || !gameState.multiConfig.player2) {
    showMobileAlert('Por favor, selecciona un personaje para cada jugador');
    return;
  }
  
  if (gameState.multiConfig.player1 === gameState.multiConfig.player2) {
    showMobileAlert('Los jugadores no pueden elegir el mismo personaje');
    return;
  }
  
  gameState.mode = 'multi';
  gameState.currentPlayer = gameState.multiConfig.player1;
  showPopup();
};

const showPopup = () => {
  const popup = document.getElementById('popup-container');
  const input = document.getElementById('secret-word-input');
  
  // Actualizar imágenes de los jugadores
  const player1Btn = document.querySelector('.player-select-btn[data-player="1"]');
  const player2Btn = document.querySelector('.player-select-btn[data-player="2"]');
  
  if (!player1Btn || !player2Btn) {
    console.error('No se encontraron los botones de selección de jugador');
    return;
  }
  
  player1Btn.querySelector('img').src = gameState.multiConfig.player1.image;
  player2Btn.querySelector('img').src = gameState.multiConfig.player2.image;
  
  // Limpiar listeners anteriores
  const selectPlayer1 = () => selectPlayer(1);
  const selectPlayer2 = () => selectPlayer(2);
  
  player1Btn.removeEventListener('click', selectPlayer1);
  player2Btn.removeEventListener('click', selectPlayer2);
  
  player1Btn.addEventListener('click', selectPlayer1);
  player2Btn.addEventListener('click', selectPlayer2);
  
  // Seleccionar jugador 1 por defecto
  player1Btn.classList.add('selected');
  player2Btn.classList.remove('selected');
  gameState.currentPlayer = gameState.multiConfig.player1;
  document.getElementById('current-player').textContent = `${gameState.multiConfig.player1.name}, ESCRIBE TU PALABRA SECRETA`;
  
  popup.classList.remove('hidden');
  input.value = ''; // Limpiar el input
  input.focus();
};

const selectPlayer = (playerNumber) => {
  const player1Btn = document.querySelector('.player-select-btn[data-player="1"]');
  const player2Btn = document.querySelector('.player-select-btn[data-player="2"]');
  
  // Remover la clase selected de ambos botones
  player1Btn.classList.remove('selected');
  player2Btn.classList.remove('selected');
  
  // Agregar la clase selected al botón seleccionado
  if (playerNumber === 1) {
    player1Btn.classList.add('selected');
    gameState.currentPlayer = gameState.multiConfig.player1;
    document.getElementById('current-player').textContent = `${gameState.multiConfig.player1.name}, ESCRIBE TU PALABRA SECRETA`;
  } else {
    player2Btn.classList.add('selected');
    gameState.currentPlayer = gameState.multiConfig.player2;
    document.getElementById('current-player').textContent = `${gameState.multiConfig.player2.name}, ESCRIBE TU PALABRA SECRETA`;
  }
  
  console.log('Jugador seleccionado para escribir:', gameState.currentPlayer.name);
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
  
  if (secretWord.length < 3) {
    showMobileAlert('La palabra debe tener al menos 3 letras');
    return;
  }
  
  if (!/^[A-ZÑ]+$/.test(secretWord)) {
    showMobileAlert('Solo se permiten letras');
    return;
  }
  
  resetGameState();
  gameState.secretWord = secretWord;
  
  const activePlayerBtn = document.querySelector('.player-select-btn.selected');
  if (!activePlayerBtn) return;
  
  const writingPlayerNumber = parseInt(activePlayerBtn.dataset.player);
  const writingPlayer = writingPlayerNumber === 1 ? gameState.multiConfig.player1 : gameState.multiConfig.player2;
  gameState.currentPlayer = writingPlayerNumber === 1 ? gameState.multiConfig.player2 : gameState.multiConfig.player1;
  
  hideOverlay();
  initializeGame();
};

const initializeGame = () => {
  const currentDifficulty = gameState.mode === 'single' 
    ? gameState.singleConfig.difficulty 
    : gameState.multiConfig.difficulty;

  const difficultyConfig = DIFFICULTY_LEVELS[currentDifficulty];
  if (!difficultyConfig) return;

  if (!gameState.secretWord || gameState.secretWord.length < 3) return;

  gameState.guessedLetters = Array(gameState.secretWord.length).fill('_');
  gameState.wrongLetters = [];
  gameState.attemptsLeft = difficultyConfig.fails;
  gameState.gameActive = true;
  
  const hintDisplay = document.getElementById('hint-display');
  if (hintDisplay) {
    if (gameState.mode === 'single') {
      // Ya no seleccionamos una nueva palabra aquí, usamos la que ya está en gameState
      hintDisplay.textContent = '';
      hintDisplay.classList.add('hidden');
    } else {
      hintDisplay.textContent = '';
      hintDisplay.classList.add('hidden');
    }
  }
  
  setupGameElements(difficultyConfig);
  setupTimer(difficultyConfig);
  setupHintButton();
  
  updateGameUI();
  updateCurrentPlayerAvatar();
};

const updateCurrentPlayerAvatar = () => {
  const playerAvatar = document.getElementById('player-avatar');
  if (playerAvatar && gameState.currentPlayer) {
    playerAvatar.src = gameState.currentPlayer.image;
    playerAvatar.alt = gameState.currentPlayer.name;
  }
};

const updateGameUI = () => {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('active');
  });

  const gameScreen = document.getElementById('game-screen');
  if (!gameScreen) {
    console.error('No se encontró la pantalla de juego');
    return;
  }
  
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
  
  if (!timerDisplay || !timerContainer) {
    console.error('No se encontraron los elementos del temporizador');
    return;
  }
  
  // Limpiar temporizador anterior
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  const totalTime = difficultyConfig.timer;
  
  // Ocultar el contenedor del temporizador si no hay tiempo límite
  if (totalTime <= 0) {
    timerContainer.style.display = 'none';
    return;
  }
  
  // Mostrar el contenedor del temporizador si hay tiempo límite
  timerContainer.style.display = 'flex';
  
  // Reiniciar la animación del reloj de arena
  if (hourglassIcon) {
    hourglassIcon.classList.remove('stop-animation');
  }
  
  // Reiniciar el progreso visual
  timerDisplay.style.width = '0%';
  
  // Inicializar el tiempo restante
  gameState.timeLeft = totalTime;
  
  // Crear el temporizador
  gameState.timer = setInterval(() => {
    if (!gameState.gameActive) {
      clearInterval(gameState.timer);
      gameState.timer = null;
      return;
    }
    
    gameState.timeLeft--;
    const progress = ((totalTime - gameState.timeLeft) / totalTime) * 100;
    timerDisplay.style.width = `${progress}%`;
    
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timer);
      gameState.timer = null;
      endGame(false);
    }
  }, 1000);
};

const resetTimer = () => {
  const timerDisplay = document.querySelector('.timer-progress');
  const timerContainer = document.querySelector('.timer-container');
  if (!timerDisplay || !timerContainer) return;
  
  const currentDifficulty = gameState.mode === 'single' 
    ? gameState.singleConfig.difficulty 
    : gameState.multiConfig.difficulty;
    
  const difficultyConfig = DIFFICULTY_LEVELS[currentDifficulty];
  if (difficultyConfig.timer > 0) {
    timerDisplay.style.width = '0%';
    gameState.timeLeft = difficultyConfig.timer;
  }
};

const handleLetter = letter => {
  if (!gameState.gameActive) return;
  
  const button = document.querySelector(`button[data-letter="${letter}"]`);
  if (!button || button.disabled) return;

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
  
  // Reiniciar el temporizador al acertar una letra
  resetTimer();
};

const handleWrongLetter = (letter, button) => {
  if (!gameState.gameActive) return;
  
  button.classList.add('incorrect');
  gameState.wrongLetters.push(letter);
  gameState.attemptsLeft--;
  updateHangmanImage();
};

const endGame = win => {
  if (!gameState.gameActive) return;
  
  gameState.gameActive = false;
  
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  // Obtener clave exacta del personaje
  const getCharacterKey = (currentPlayer) => {
    if (!currentPlayer) return null;
    return Object.keys(CHARACTERS).find(key => 
      CHARACTERS[key].name === currentPlayer.name
    );
  };
  
  const playerKey = getCharacterKey(gameState.currentPlayer);
  if (!playerKey) {
    console.error('No se encontró la clave del personaje para:', gameState.currentPlayer?.name);
    return;
  }

  // Obtener la dificultad según el modo actual
  const currentDifficulty = gameState.mode === 'single' 
    ? gameState.singleConfig.difficulty 
    : gameState.multiConfig.difficulty;

  // Actualizar puntuaciones
  updateScores(playerKey, currentDifficulty, win);
  
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
  
  if (!popup || !messageElement || !newGameBtn || !nextRoundBtn) return;
  
  messageElement.textContent = message;
  
  const handleNewGame = () => {
    popup.classList.add('hidden');
    
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.add('hidden');
      gameScreen.classList.remove('active');
    }
    
    const currentMode = gameState.mode;
    resetGameState();
    gameState.mode = currentMode;
    
    if (gameState.mode === 'single') {
      showConfig('single');
    } else if (gameState.mode === 'multi') {
      showConfig('multi');
    }
  };
  
  const handleNextRound = () => {
    popup.classList.add('hidden');
    
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.add('hidden');
      gameScreen.classList.remove('active');
    }
    
    if (gameState.mode === 'multi') {
      showPopup();
    } else {
      gameState.secretWord = selectWord().word;
      initializeGame();
    }
  };
  
  newGameBtn.removeEventListener('click', handleNewGame);
  nextRoundBtn.removeEventListener('click', handleNextRound);
  
  newGameBtn.addEventListener('click', handleNewGame);
  nextRoundBtn.addEventListener('click', handleNextRound);
  
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
  console.log('Iniciando juego individual');
  console.log('Dificultad seleccionada:', gameState.singleConfig.difficulty);
  console.log('Jugador seleccionado:', gameState.singleConfig.selectedPlayer.name);
  
  // Resetear el estado del juego
  resetGameState();
  
  // Obtener palabra aleatoria según tema
  const wordData = selectWord(gameState.singleConfig.selectedTheme);
  if (!wordData) {
    console.error('No se pudo seleccionar una palabra');
    return;
  }
  
  gameState.secretWord = wordData.word;
  gameState.hint = wordData.hint;
  
  console.log('Palabra seleccionada:', gameState.secretWord);
  console.log('Pista:', gameState.hint);
  
  // Configurar el jugador actual como el jugador seleccionado
  gameState.currentPlayer = gameState.singleConfig.selectedPlayer;
  console.log('Jugador actual configurado:', gameState.currentPlayer.name);
  
  // Inicializar el juego
  initializeGame();
};

const selectWord = (theme = "aleatorio") => {
  let filteredWords = wordList;
  
  if (theme !== "aleatorio") {
    filteredWords = wordList.filter(word => word.theme === theme);
  }
  
  if (filteredWords.length === 0) {
    console.warn(`No hay palabras para el tema ${theme}, usando todas las palabras`);
    filteredWords = wordList;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  const selectedWord = filteredWords[randomIndex];
  
  console.log('Palabra seleccionada:', selectedWord);
  return selectedWord;
};

const updateHangmanImage = () => {
  if (!gameState.gameActive) return;
  
  const hangmanContainer = document.getElementById('hangman-container');
  // Obtener la dificultad según el modo actual
  const currentDifficulty = gameState.mode === 'single' 
    ? gameState.singleConfig.difficulty 
    : gameState.multiConfig.difficulty;
    
  const difficultyConfig = DIFFICULTY_LEVELS[currentDifficulty];
  if (!difficultyConfig) {
    console.error('Configuración de dificultad no encontrada:', currentDifficulty);
    return;
  }

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
  if (!hintButton) return;

  // Solo mostrar el botón de pista en modo un jugador y dificultades Fácil y Normal
  const currentDifficulty = gameState.singleConfig.difficulty;
  const showHint = gameState.mode === 'single' && (currentDifficulty === 0 || currentDifficulty === 25);
  
  hintButton.style.display = showHint ? 'block' : 'none';
  hintButton.disabled = false;
  
  // Limpiar listener anterior
  hintButton.removeEventListener('click', handleHintClick);
  
  // Agregar nuevo listener
  hintButton.addEventListener('click', handleHintClick);
};

const handleHintClick = () => {
  const hintButton = document.getElementById('hint-button');
  if (!hintButton || hintButton.disabled) return;

  // Deshabilitar el botón después de usar la pista
  hintButton.disabled = true;
  
  // Mostrar la pista
  const hintDisplay = document.getElementById('hint-display');
  if (hintDisplay) {
    hintDisplay.textContent = gameState.hint;
    hintDisplay.classList.remove('hidden');
  }
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
        RESETEAR PUNTUACIONES
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
const updateScores = (playerKey, difficulty, win) => {
  if (!playerKey || !gameState.scores[playerKey]) {
    console.error('Jugador no válido para actualizar puntuación:', playerKey);
    return;
  }

  const difficultyKey = Object.keys(DIFFICULTY_LEVELS).find(key => 
    parseInt(key) === difficulty
  );

  if (!difficultyKey) {
    console.error('Dificultad no válida para actualizar puntuación:', difficulty);
    return;
  }

  const points = DIFFICULTY_LEVELS[difficultyKey].points;
  
  // Mapear el nombre de la dificultad a la clave correcta
  const difficultyMap = {
    'fácil': 'easy',
    'normal': 'normal',
    'difícil': 'hard',
    'extremo': 'extreme'
  };
  
  const difficultyName = difficultyMap[DIFFICULTY_LEVELS[difficultyKey].name.toLowerCase()];

  if (win) {
    gameState.scores[playerKey][difficultyName] += points;
    gameState.scores[playerKey].total += points;
    saveScores();
  }
};

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
  const scores = { ...gameState.scores };
  const currentMode = gameState.mode;
  const currentSingleConfig = { ...gameState.singleConfig };
  const currentMultiConfig = { ...gameState.multiConfig };
  
  const isNextRound = document.getElementById('next-round-btn')?.classList.contains('active');
  
  Object.assign(gameState, {
    mode: currentMode,
    players: [],
    singleConfig: currentSingleConfig,
    multiConfig: currentMultiConfig,
    secretWord: '',
    guessedLetters: [],
    wrongLetters: [],
    attemptsLeft: 0,
    timer: null,
    timeLeft: 0,
    hint: '',
    gameActive: false,
    currentPlayer: null,
    scores
  });

  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
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
  gameState.singleConfig.selectedPlayer = null;
  gameState.multiConfig.player1 = null;
  gameState.multiConfig.player2 = null;
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
  gameState.singleConfig.difficulty = 25;
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