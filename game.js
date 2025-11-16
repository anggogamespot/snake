const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const powerStatusEl = document.getElementById("powerStatus");

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let apple = randomCell();
let powerUp = null;
let score = 0;

let baseSpeed = 150;
let speed = baseSpeed;

// Power-up variables
let powerActive = false;
let powerType = "";
let powerTimer = 0;

document.addEventListener("keydown", handleKeyPress);

// ------------------
// GAME LOOP
// ------------------
function gameLoop() {
  setTimeout(() => {
    update();
    draw();
    gameLoop();
  }, speed);
}

gameLoop();

// ------------------
// INPUT
// ------------------
function handleKeyPress(e) {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 1) return;
      direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === -1) return;
      direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 1) return;
      direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === -1) return;
      direction = { x: 1, y: 0 };
      break;
  }
}

// ------------------
// UPDATE LOGIC
// ------------------
function update() {
  if (powerActive) {
    powerTimer--;
    if (powerTimer <= 0) deactivatePowerUp();
  }

  // Move snake
  const head = { 
    x: snake[0].x + direction.x, 
    y: snake[0].y + direction.y 
  };

  // Wrap around walls (retro classic)
  head.x = (head.x + 20) % 20;
  head.y = (head.y + 20) % 20;

  snake.unshift(head);

  // Collision with apple
  if (head.x === apple.x && head.y === apple.y) {
    score += powerType === "double" ? 2 : 1;
    scoreEl.textContent = score;

    // Increase speed progressively
    speed = Math.max(40, baseSpeed - score * 5);

    apple = randomCell();

    // Random chance for power-up
    if (Math.random() < 0.2 && !powerActive) {
      powerUp = randomCell();
      powerType = randomPowerType();
    }
  } else {
    snake.pop();
  }

  // Collision with power-up
  if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
    activatePowerUp(powerType);
    powerUp = null;
  }

  // Self-collision (unless invincible)
  if (!powerActive || powerType !== "invincible") {
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        resetGame();
        return;
      }
    }
  }
}

// ------------------
// DRAW LOGIC
// ------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "#33ff33";
  snake.forEach(seg => {
    drawCell(seg.x, seg.y);
  });

  // Draw apple
  ctx.fillStyle = "#ff3333";
  drawCell(apple.x, apple.y);

  // Draw power-up
  if (powerUp) {
    ctx.fillStyle = "#33ccff";
    drawCell(powerUp.x, powerUp.y);
  }
}

function drawCell(x, y) {
  ctx.fillRect(x * gridSize, y * gridSize, gridSize - 2, gridSize - 2);
}

// ------------------
// POWER UPS
// ------------------
function activatePowerUp(type) {
  powerActive = true;
  powerType = type;
  powerTimer = 60;  // lasts ~1 sec depending on speed
  powerStatusEl.textContent = type.toUpperCase();

  if (type === "slow") {
    speed += 80;
  }
  if (type === "invincible") {
    // nothing additional, handled in update()
  }
  if (type === "double") {
    // scoring handled during apple collision
  }
}

function deactivatePowerUp() {
  powerActive = false;
  powerType = "";
  powerStatusEl.textContent = "None";
  speed = Math.max(40, baseSpeed - score * 5);
}

// ------------------
// UTILITIES
// ------------------
function randomCell() {
  return {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
}

function randomPowerType() {
  const types = ["invincible", "double", "slow"];
  return types[Math.floor(Math.random() * types.length)];
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  speed = baseSpeed;
  scoreEl.textContent = score;
  powerStatusEl.textContent = "None";
  powerActive = false;
  powerUp = null;
}
