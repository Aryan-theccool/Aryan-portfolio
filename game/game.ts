// ---- Types ----
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Paddle {
  x: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  color: string;
}

// ---- Setup ----
const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const scoreEl = document.getElementById("score") as HTMLSpanElement;
const livesEl = document.getElementById("lives") as HTMLSpanElement;
const overlay = document.getElementById("overlay") as HTMLDivElement;
const overlayTitle = document.getElementById("overlayTitle") as HTMLHeadingElement;
const overlayMsg = document.getElementById("overlayMsg") as HTMLParagraphElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_HEIGHT = 14;
const PADDLE_SPEED = 8;
const BALL_RADIUS = 8;

const ROWS = 5;
const COLS = 8;
const BRICK_PADDING = 6;
const BRICK_TOP_OFFSET = 50;
const BRICK_HEIGHT = 22;
const ROW_COLORS = ["#ff5c5c", "#ff9d5c", "#ffd15c", "#8ce99a", "#5c9dff"];

let paddle: Paddle;
let ball: Ball;
let bricks: Brick[];
let score = 0;
let lives = 3;
let running = false;
let animationId: number | null = null;

let leftPressed = false;
let rightPressed = false;

function createBricks(): Brick[] {
  const list: Brick[] = [];
  const brickWidth = (WIDTH - BRICK_PADDING * (COLS + 1)) / COLS;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      list.push({
        x: BRICK_PADDING + c * (brickWidth + BRICK_PADDING),
        y: BRICK_TOP_OFFSET + r * (BRICK_HEIGHT + BRICK_PADDING),
        width: brickWidth,
        height: BRICK_HEIGHT,
        alive: true,
        color: ROW_COLORS[r % ROW_COLORS.length],
      });
    }
  }
  return list;
}

function resetBallAndPaddle(): void {
  paddle = { x: WIDTH / 2 - 45, width: 90, height: PADDLE_HEIGHT };
  ball = {
    x: WIDTH / 2,
    y: HEIGHT - 40,
    vx: 4 * (Math.random() > 0.5 ? 1 : -1),
    vy: -4,
    radius: BALL_RADIUS,
  };
}

function initGame(): void {
  score = 0;
  lives = 3;
  bricks = createBricks();
  resetBallAndPaddle();
  updateHud();
}

function updateHud(): void {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
}

function drawBackground(): void {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawPaddle(): void {
  const y = HEIGHT - PADDLE_HEIGHT - 10;
  const gradient = ctx.createLinearGradient(paddle.x, y, paddle.x + paddle.width, y);
  gradient.addColorStop(0, "#38bdf8");
  gradient.addColorStop(1, "#818cf8");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(paddle.x, y, paddle.width, paddle.height, 7);
  ctx.fill();
}

function drawBall(): void {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fde047";
  ctx.shadowColor = "#fde047";
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawBricks(): void {
  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.width, b.height, 4);
    ctx.fill();
  }
}

function collideBallPaddle(): boolean {
  const y = HEIGHT - PADDLE_HEIGHT - 10;
  return (
    ball.y + ball.radius >= y &&
    ball.y - ball.radius <= y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  );
}

function collideBallBrick(b: Brick): boolean {
  const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
  const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function update(): void {
  if (leftPressed) paddle.x -= PADDLE_SPEED;
  if (rightPressed) paddle.x += PADDLE_SPEED;
  paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, paddle.x));

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= WIDTH) {
    ball.vx *= -1;
    ball.x = Math.max(ball.radius, Math.min(WIDTH - ball.radius, ball.x));
  }
  if (ball.y - ball.radius <= 0) {
    ball.vy *= -1;
    ball.y = ball.radius;
  }

  if (collideBallPaddle() && ball.vy > 0) {
    const hitPos = (ball.x - paddle.x) / paddle.width; // 0..1
    const angle = (hitPos - 0.5) * (Math.PI / 2.2); // spread based on hit position
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
  }

  for (const b of bricks) {
    if (!b.alive) continue;
    if (collideBallBrick(b)) {
      b.alive = false;
      ball.vy *= -1;
      score += 10;
      updateHud();
      break;
    }
  }

  if (ball.y - ball.radius > HEIGHT) {
    lives -= 1;
    updateHud();
    if (lives <= 0) {
      endGame(false);
      return;
    }
    resetBallAndPaddle();
  }

  if (bricks.every((b) => !b.alive)) {
    endGame(true);
  }
}

function draw(): void {
  drawBackground();
  drawBricks();
  drawPaddle();
  drawBall();
}

function loop(): void {
  if (!running) return;
  update();
  draw();
  animationId = requestAnimationFrame(loop);
}

function startGame(): void {
  initGame();
  overlay.classList.add("hidden");
  running = true;
  if (animationId !== null) cancelAnimationFrame(animationId);
  loop();
}

function endGame(won: boolean): void {
  running = false;
  if (animationId !== null) cancelAnimationFrame(animationId);
  overlayTitle.textContent = won ? "You Win! 🎉" : "Game Over";
  overlayMsg.textContent = `Final Score: ${score}`;
  startBtn.textContent = "Restart";
  overlay.classList.remove("hidden");
}

// ---- Input ----
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
  if (e.key === "ArrowRight" || e.key === "d") rightPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
  if (e.key === "ArrowRight" || e.key === "d") rightPressed = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scale = WIDTH / rect.width;
  const mouseX = (e.clientX - rect.left) * scale;
  paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, mouseX - paddle.width / 2));
});

startBtn.addEventListener("click", startGame);

// ---- Initial paint (idle state behind overlay) ----
paddle = { x: WIDTH / 2 - 45, width: 90, height: PADDLE_HEIGHT };
ball = { x: WIDTH / 2, y: HEIGHT - 40, vx: 4, vy: -4, radius: BALL_RADIUS };
bricks = createBricks();
draw();
