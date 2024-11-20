let score = 0;
let multiplier = 1;
let liquidLevel = 0;
let gameRunning = false;
let spawnInterval;
let missedParts = 0;
let level = 1;
let lives = 3;
let consecutiveCollects = 0;

const collector = document.getElementById("collector");
const gameArea = document.getElementById("game-area");
const liquid = document.getElementById("liquid");
const scoreDisplay = document.getElementById("score");
const multiplierDisplay = document.getElementById("multiplier");
const missedPartsDisplay = document.getElementById("missed-parts");
const levelDisplay = document.getElementById("level");
const livesContainer = document.getElementById("lives-container");

// Sound effects (using AudioContext)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createCollectSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    880,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function createMissSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    110,
    audioContext.currentTime + 0.2
  );

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Part types with different point values
const partTypes = [
  { class: "gear", points: 10, speed: 3 },
  { class: "bolt", points: 5, speed: 4 },
  { class: "spring", points: 15, speed: 2 },
  { class: "crystal", points: 25, speed: 5 },
];

function updateLives() {
  livesContainer.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const life = document.createElement("div");
    life.className = "life";
    livesContainer.appendChild(life);
  }
}

function startGame() {
  gameRunning = true;
  score = 0;
  multiplier = 1;
  liquidLevel = 0;
  missedParts = 0;
  level = 1;
  lives = 3;
  consecutiveCollects = 0;
  updateDisplays();
  updateLives();
  spawnInterval = setInterval(spawnPart, Math.max(1000 - level * 50, 400));
  document.getElementById("game-over").classList.add("hidden");
}

function spawnPart() {
  const part = document.createElement("div");
  const partType = partTypes[Math.floor(Math.random() * partTypes.length)];
  part.className = `part ${partType.class}`;
  part.dataset.points = partType.points;

  const gameAreaRect = gameArea.getBoundingClientRect();
  const maxX = gameAreaRect.width - 30;
  part.style.left = Math.random() * maxX + "px";
  part.style.top = "-30px";

  gameArea.appendChild(part);

  let pos = -30;
  const baseSpeed = partType.speed * (1 + level * 0.1);
  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      return;
    }

    pos += baseSpeed;
    part.style.top = pos + "px";

    const partRect = part.getBoundingClientRect();
    const collectorRect = collector.getBoundingClientRect();

    // Check for collision
    if (isColliding(partRect, collectorRect)) {
      collectPart(part, parseInt(part.dataset.points));
      createParticles(
        partRect.left + partRect.width / 2,
        partRect.top + partRect.height / 2
      );
      createCollectSound();
      clearInterval(fall);
      part.remove();
      consecutiveCollects++;
      checkConsecutiveCollects();
    }

    // Check if part is below screen
    if (pos > gameAreaRect.height) {
      clearInterval(fall);
      part.remove();
      missedParts++;
      createMissSound();
      lives--;
      updateLives();
      multiplier = 1;
      consecutiveCollects = 0;
      updateDisplays();

      if (lives <= 0 || missedParts >= 10) {
        endGame();
      }
    }
  }, 16);
}

function checkConsecutiveCollects() {
  if (consecutiveCollects % 10 === 0) {
    spawnPowerUp();
  }
}

function spawnPowerUp() {
  const powerUp = document.createElement("div");
  powerUp.className = "power-up";

  const gameAreaRect = gameArea.getBoundingClientRect();
  const maxX = gameAreaRect.width - 40;
  powerUp.style.left = Math.random() * maxX + "px";
  powerUp.style.top = "-40px";

  gameArea.appendChild(powerUp);

  let pos = -40;
  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      return;
    }

    pos += 2;
    powerUp.style.top = pos + "px";

    const powerUpRect = powerUp.getBoundingClientRect();
    const collectorRect = collector.getBoundingClientRect();

    if (isColliding(powerUpRect, collectorRect)) {
      activatePowerUp();
      clearInterval(fall);
      powerUp.remove();
    }

    if (pos > gameAreaRect.height) {
      clearInterval(fall);
      powerUp.remove();
    }
  }, 16);
}

function activatePowerUp() {
  const powerUps = [
    () => {
      multiplier *= 2;
    }, // Double multiplier
    () => {
      lives = Math.min(lives + 1, 5);
      updateLives();
    }, // Extra life
    () => {
      score += 100;
    }, // Bonus points
    () => {
      liquidLevel = Math.min(100, liquidLevel + 30);
    }, // Boost liquid
  ];

  const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
  randomPowerUp();
  updateDisplays();

  // Power-up effect
  const effect = document.createElement("div");
  effect.className = "combo-text";
  effect.textContent = "🌟 Power Up!";
  effect.style.left = collector.style.left;
  effect.style.bottom = "100px";
  gameArea.appendChild(effect);
  setTimeout(() => effect.remove(), 1000);
}

function collectPart(part, points) {
  score += points * multiplier;
  multiplier++;
  liquidLevel = Math.min(100, liquidLevel + points / 10);
  updateDisplays();

  // Show floating score text
  const scoreText = document.createElement("div");
  scoreText.className = "combo-text";
  scoreText.textContent = `+${points * multiplier}`;
  scoreText.style.left = part.style.left;
  scoreText.style.top = part.style.top;
  gameArea.appendChild(scoreText);
  setTimeout(() => scoreText.remove(), 1000);

  // Level up check
  if (score > level * 1000) {
    levelUp();
  }
}

function levelUp() {
  level++;
  levelDisplay.textContent = level;

  // Level up effect
  const levelUpText = document.createElement("div");
  levelUpText.className = "combo-text";
  levelUpText.textContent = `Level ${level}!`;
  levelUpText.style.left = "50%";
  levelUpText.style.top = "50%";
  levelUpText.style.transform = "translate(-50%, -50%)";
  gameArea.appendChild(levelUpText);
  setTimeout(() => levelUpText.remove(), 1500);

  // Increase game speed
  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnPart, Math.max(1000 - level * 50, 400));
}

function createParticles(x, y) {
  const particles = document.createElement("div");
  particles.className = "particles";
  particles.style.left = x + "px";
  particles.style.top = y + "px";

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.setProperty("--dx", (Math.random() - 0.5) * 100 + "px");
    particle.style.setProperty("--dy", (Math.random() - 0.5) * 100 + "px");
    particle.style.width = Math.random() * 4 + 2 + "px";
    particle.style.height = particle.style.width;
    particles.appendChild(particle);
  }

  gameArea.appendChild(particles);
  setTimeout(() => particles.remove(), 500);
}

function updateDisplays() {
  scoreDisplay.textContent = score;
  multiplierDisplay.textContent = multiplier;
  liquid.style.height = liquidLevel + "%";
  missedPartsDisplay.textContent = missedParts;
}

function isColliding(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function moveCollector(e) {
  if (!gameRunning) return;

  const gameAreaRect = gameArea.getBoundingClientRect();
  const collectorRect = collector.getBoundingClientRect();
  const mouseX = e.clientX - gameAreaRect.left;
  const newX = mouseX - collectorRect.width / 2;

  // Keep collector within game area bounds
  const maxX = gameAreaRect.width - collectorRect.width;
  collector.style.left = Math.max(0, Math.min(maxX, newX)) + "px";
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  document.getElementById("final-score").textContent = score;
  document.getElementById("final-level").textContent = level;
  document.getElementById("game-over").classList.remove("hidden");
}

function restartGame() {
  // Clear all parts and power-ups
  const parts = document.querySelectorAll(".part");
  const powerUps = document.querySelectorAll(".power-up");
  parts.forEach((part) => part.remove());
  powerUps.forEach((powerUp) => powerUp.remove());
  startGame();
}

// Event listeners
gameArea.addEventListener("mousemove", moveCollector);
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  const collectorRect = collector.getBoundingClientRect();
  const gameAreaRect = gameArea.getBoundingClientRect();
  const currentLeft = collectorRect.left - gameAreaRect.left;
  const step = 20;

  if (e.key === "ArrowLeft") {
    const newX = Math.max(0, currentLeft - step);
    collector.style.left = newX + "px";
  } else if (e.key === "ArrowRight") {
    const maxX = gameAreaRect.width - collectorRect.width;
    const newX = Math.min(maxX, currentLeft + step);
    collector.style.left = newX + "px";
  }
});

// Start the game immediately
startGame();
