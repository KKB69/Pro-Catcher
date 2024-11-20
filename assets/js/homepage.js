// Store selected options with default values
const gameSettings = {
  difficulty: "easy",
  theme: "mechanical",
  soundEffects: 50,
  music: 50,
  screenShake: true,
};

// Audio configuration
const themeMusic = {
  mechanical: {
    src: "assets/audio/industrial-theme.mp3",
    audio: null,
  },
  futuristic: {
    src: "assets/audio/quantum-theme.mp3",
    audio: null,
  },
  cyberpunk: {
    src: "assets/audio/cyberpunk-theme.mp3",
    audio: null,
  },
};

// Initialize background music
let currentMusic = null;

function initializeAudio() {
  // Initialize audio objects for each theme
  Object.keys(themeMusic).forEach((theme) => {
    themeMusic[theme].audio = new Audio(themeMusic[theme].src);
    themeMusic[theme].audio.loop = true;
  });
}

function playThemeMusic(theme) {
  // Stop current music if playing
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  // Play new theme music
  currentMusic = themeMusic[theme].audio;
  currentMusic.volume = gameSettings.music / 100;
  currentMusic.play().catch((error) => {
    console.log("Audio playback error:", error);
  });
}

// Game configuration links
const gameLinks = {
  easy: {
    mechanical: "after play/rookie-industrial.html",
    futuristic: "after play/rookie-quantum.html",
    cyberpunk: "after play/rookie-cyberpunk.html",
  },
  medium: {
    mechanical: "after play/master-industrial.html",
    futuristic: "after play/master-quantum.html",
    cyberpunk: "after play/master-cyberpunk.html",
  },
  hard: {
    mechanical: "after play/chief-industrial.html",
    futuristic: "after play/chief-quantum.html",
    cyberpunk: "after play/chief-cyberpunk.html",
  },
};

// Modal management
function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";

  if (modalId === "difficulties-modal") {
    document.querySelectorAll("[data-difficulty]").forEach((btn) => {
      btn.classList.remove("selected");
    });
    const currentBtn = document.querySelector(
      `[data-difficulty="${gameSettings.difficulty}"]`
    );
    if (currentBtn) currentBtn.classList.add("selected");
  }

  if (modalId === "themes-modal") {
    document.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.classList.remove("selected");
    });
    const currentBtn = document.querySelector(
      `[data-theme="${gameSettings.theme}"]`
    );
    if (currentBtn) currentBtn.classList.add("selected");
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Menu functions
function startGame() {
  const gamePage = gameLinks[gameSettings.difficulty][gameSettings.theme];
  if (gamePage) {
    // Stop music before redirecting
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }
    console.log(`Starting game with settings:`, gameSettings);
    console.log(`Loading game page: ${gamePage}`);
    window.location.href = gamePage;
  } else {
    console.error("Invalid game configuration");
  }
}

function showDifficulties() {
  showModal("difficulties-modal");
}

function showThemes() {
  showModal("themes-modal");
}

function showSettings() {
  showModal("settings-modal");
}

function showAbout() {
  showModal("about-modal");
}

function exitGame() {
  if (confirm("Are you sure you want to exit the game?")) {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }
    console.log("Exiting game...");
    window.close();
  }
}

// Game settings
function setDifficulty(level) {
  document.querySelectorAll("[data-difficulty]").forEach((btn) => {
    btn.classList.remove("selected");
  });

  const selectedBtn = document.querySelector(`[data-difficulty="${level}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("selected");
    gameSettings.difficulty = level;
    console.log(`Difficulty set to: ${level}`);
    setTimeout(() => closeModal("difficulties-modal"), 300);
  }
}

function setTheme(theme) {
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.remove("selected");
  });

  const selectedBtn = document.querySelector(`[data-theme="${theme}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("selected");
    gameSettings.theme = theme;
    console.log(`Theme set to: ${theme}`);

    // Change music when theme changes
    playThemeMusic(theme);

    setTimeout(() => closeModal("themes-modal"), 300);
  }
}

// Settings handlers
function updateSoundEffects(value) {
  gameSettings.soundEffects = value;
  console.log("Sound effects volume:", value);
}

function updateMusic(value) {
  gameSettings.music = value;
  console.log("Music volume:", value);

  // Update current music volume if playing
  if (currentMusic) {
    currentMusic.volume = value / 100;
  }
}

function toggleScreenShake(enabled) {
  gameSettings.screenShake = enabled;
  console.log("Screen shake:", enabled);
}

// Close modals when clicking outside
window.onclick = function (event) {
  const modals = document.getElementsByClassName("modal");
  for (let modal of modals) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
};

// Initialize settings when page loads
window.onload = function () {
  // Initialize audio system
  initializeAudio();

  // Play default theme music
  playThemeMusic(gameSettings.theme);

  const difficultyBtn = document.querySelector(
    `[data-difficulty="${gameSettings.difficulty}"]`
  );
  const themeBtn = document.querySelector(
    `[data-theme="${gameSettings.theme}"]`
  );

  if (difficultyBtn) difficultyBtn.classList.add("selected");
  if (themeBtn) themeBtn.classList.add("selected");

  // Set up volume controls
  const musicSlider = document.querySelector(
    'input[type="range"][name="music"]'
  );
  if (musicSlider) {
    musicSlider.value = gameSettings.music;
    musicSlider.addEventListener("input", function () {
      updateMusic(this.value);
    });
  }

  const soundSlider = document.querySelector(
    'input[type="range"][name="sound"]'
  );
  if (soundSlider) {
    soundSlider.value = gameSettings.soundEffects;
    soundSlider.addEventListener("input", function () {
      updateSoundEffects(this.value);
    });
  }

  const screenShakeCheckbox = document.querySelector(
    'input[type="checkbox"][name="screenShake"]'
  );
  if (screenShakeCheckbox) {
    screenShakeCheckbox.checked = gameSettings.screenShake;
  }
};
