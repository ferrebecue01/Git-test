const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');

const paddleWidth = 14;
const paddleHeight = 90;
const ballSize = 12;
const wallOffset = 10;

const leftPaddle = {
  x: 30,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 6.5,
  dy: 0,
};

const rightPaddle = {
  x: canvas.width - 30 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 4.8,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: ballSize,
  speedX: 5,
  speedY: 4,
  maxSpeed: 10,
};

let playerScore = 0;
let cpuScore = 0;
let mouseY = canvas.height / 2;
let keysPressed = {};

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const angle = (Math.random() * 1.2) - 0.6; 
  ball.speedX = direction * (4 + Math.random() * 1.5);
  ball.speedY = angle * 5;
}

function updateScore() {
  playerScoreEl.textContent = playerScore;
  cpuScoreEl.textContent = cpuScore;
}

function moveLeftPaddle() {
  if (keysPressed.ArrowUp || keysPressed.KeyW) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keysPressed.ArrowDown || keysPressed.KeyS) {
    leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = Math.max(wallOffset, Math.min(canvas.height - paddleHeight - wallOffset, leftPaddle.y));
}

function moveComputerPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const targetY = ball.y - rightPaddle.height / 2;

  if (ball.x > canvas.width / 2) {
    if (paddleCenter < targetY) {
      rightPaddle.y += rightPaddle.speed;
    } else if (paddleCenter > targetY) {
      rightPaddle.y -= rightPaddle.speed;
    }
  }

  rightPaddle.y = Math.max(wallOffset, Math.min(canvas.height - rightPaddle.height - wallOffset, rightPaddle.y));
}

function handlePaddleCollisions() {
  const leftHit =
    ball.x - ball.size <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.size >= leftPaddle.x &&
    ball.y + ball.size >= leftPaddle.y &&
    ball.y - ball.size <= leftPaddle.y + leftPaddle.height &&
    ball.speedX < 0;

  if (leftHit) {
    const hitPosition = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.speedX = Math.abs(ball.speedX) + 0.25;
    ball.speedY = hitPosition * 6;
    ball.x = leftPaddle.x + leftPaddle.width + ball.size;
  }

  const rightHit =
    ball.x + ball.size >= rightPaddle.x &&
    ball.x - ball.size <= rightPaddle.x + rightPaddle.width &&
    ball.y + ball.size >= rightPaddle.y &&
    ball.y - ball.size <= rightPaddle.y + rightPaddle.height &&
    ball.speedX > 0;

  if (rightHit) {
    const hitPosition = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.speedX = -Math.abs(ball.speedX) - 0.25;
    ball.speedY = hitPosition * 6;
    ball.x = rightPaddle.x - ball.size;
  }
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y - ball.size <= wallOffset || ball.y + ball.size >= canvas.height - wallOffset) {
    ball.speedY *= -1;
    ball.y = Math.max(ball.size + wallOffset, Math.min(canvas.height - ball.size - wallOffset, ball.y));
  }

  if (ball.x - ball.size <= 0) {
    cpuScore += 1;
    updateScore();
    resetBall(1);
  }

  if (ball.x + ball.size >= canvas.width) {
    playerScore += 1;
    updateScore();
    resetBall(-1);
  }

  handlePaddleCollisions();

  ball.speedX = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedX));
  ball.speedY = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedY));
}

function drawNet() {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall() {
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();

  drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#60a5fa');
  drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#fca5a5');
  drawBall();
}

function gameLoop() {
  moveLeftPaddle();
  moveComputerPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mousePos = (event.clientY - rect.top) / (rect.height / canvas.height);
  leftPaddle.y = mousePos * canvas.height - leftPaddle.height / 2;
  leftPaddle.y = Math.max(wallOffset, Math.min(canvas.height - leftPaddle.height - wallOffset, leftPaddle.y));
});

document.addEventListener('keydown', (event) => {
  keysPressed[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false;
});

updateScore();
resetBall(1);
requestAnimationFrame(gameLoop);
