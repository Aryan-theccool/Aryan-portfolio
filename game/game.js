"use strict";
// ---- Setup ----
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMsg = document.getElementById("overlayMsg");
const startBtn = document.getElementById("startBtn");
const nameInputContainer = document.getElementById("nameInputContainer");
const playerNameInput = document.getElementById("playerNameInput");
const submitScoreBtn = document.getElementById("submitScoreBtn");
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
let paddle;
let ball;
let bricks;
let score = 0;
let lives = 3;
let running = false;
let animationId = null;
let leftPressed = false;
let rightPressed = false;
let gameEnded = false;
let gameWon = false;

// ---- Leaderboard Functions ----
function getLeaderboard() {
    const stored = localStorage.getItem("brickBreakerLeaderboard");
    return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem("brickBreakerLeaderboard", JSON.stringify(leaderboard));
}

function addScore(playerName, playerScore) {
    let leaderboard = getLeaderboard();
    
    // Check if player already exists
    const existingIndex = leaderboard.findIndex(entry => entry.name.toLowerCase() === playerName.toLowerCase());
    
    if (existingIndex !== -1) {
        // Player exists - only update if new score is better
        if (playerScore > leaderboard[existingIndex].score) {
            leaderboard[existingIndex].score = playerScore;
            leaderboard[existingIndex].date = new Date().toLocaleDateString();
        }
    } else {
        // New player - add entry
        leaderboard.push({ name: playerName, score: playerScore, date: new Date().toLocaleDateString() });
    }
    
    // Sort and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    saveLeaderboard(leaderboard);
    return leaderboard;
}

function getLeaderboardHtml() {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) {
        return "<p style='color: #94a3b8;'>No scores yet. Be the first!</p>";
    }
    let html = "<table style='width: 100%; font-size: 13px; margin-top: 10px;'>";
    html += "<tr style='border-bottom: 1px solid #334155;'><th style='padding: 6px;'>Rank</th><th style='padding: 6px;'>Name</th><th style='padding: 6px;'>Score</th></tr>";
    leaderboard.forEach((entry, idx) => {
        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
        html += `<tr style='border-bottom: 1px solid #1e293b;'><td style='padding: 8px;'>${medal}</td><td style='padding: 8px; text-align: left;'>${entry.name}</td><td style='padding: 8px; color: #fde047;'>${entry.score}</td></tr>`;
    });
    html += "</table>";
    return html;
}

function getLastPlayerName() {
    return localStorage.getItem("lastPlayerName") || "";
}

function saveLastPlayerName(name) {
    localStorage.setItem("lastPlayerName", name);
}

function showLeaderboard() {
    overlayTitle.textContent = "Leaderboard";
    overlayMsg.innerHTML = `<div style="text-align: left; width: 100%;">${getLeaderboardHtml()}</div>`;
    nameInputContainer.style.display = "none";
    startBtn.style.display = "block";
    startBtn.textContent = "Play Again";
}

function showInitialLeaderboard() {
    overlayTitle.textContent = "Leaderboard";
    overlayMsg.innerHTML = `<div style="text-align: left; width: 100%;">${getLeaderboardHtml()}</div>`;
    nameInputContainer.style.display = "none";
    startBtn.style.display = "block";
    startBtn.textContent = "Play Now";
}

function createBricks() {
    const list = [];
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

function resetBallAndPaddle() {
    paddle = { x: WIDTH / 2 - 45, width: 90, height: PADDLE_HEIGHT };
    ball = {
        x: WIDTH / 2,
        y: HEIGHT - 40,
        vx: 12 * (Math.random() > 0.5 ? 1 : -1),
        vy: -12,
        radius: BALL_RADIUS,
    };
}

function initGame() {
    score = 0;
    lives = 3;
    bricks = createBricks();
    resetBallAndPaddle();
    updateHud();
}

function updateHud() {
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
}

function drawBackground() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawPaddle() {
    const y = HEIGHT - PADDLE_HEIGHT - 10;
    const gradient = ctx.createLinearGradient(paddle.x, y, paddle.x + paddle.width, y);
    gradient.addColorStop(0, "#38bdf8");
    gradient.addColorStop(1, "#818cf8");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddle.x, y, paddle.width, paddle.height, 7);
    ctx.fill();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fde047";
    ctx.shadowColor = "#fde047";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (const b of bricks) {
        if (!b.alive)
            continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();
    }
}

function collideBallPaddle() {
    const y = HEIGHT - PADDLE_HEIGHT - 10;
    return (ball.y + ball.radius >= y &&
        ball.y - ball.radius <= y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width);
}

function collideBallBrick(b) {
    const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
    const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function update() {
    if (leftPressed)
        paddle.x -= PADDLE_SPEED;
    if (rightPressed)
        paddle.x += PADDLE_SPEED;
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
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * (Math.PI / 2.2);
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vx = speed * Math.sin(angle);
        ball.vy = -Math.abs(speed * Math.cos(angle));
    }
    for (const b of bricks) {
        if (!b.alive)
            continue;
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

function draw() {
    drawBackground();
    drawBricks();
    drawPaddle();
    drawBall();
}

function loop() {
    if (!running)
        return;
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

function startGameNow() {
    overlay.classList.add("hidden");
    gameEnded = false;
    running = true;
    if (animationId !== null)
        cancelAnimationFrame(animationId);
    loop();
}

function restartGame() {
    initGame();
    nameInputContainer.style.display = "none";
    showInitialLeaderboard();
}

function endGame(won) {
    running = false;
    gameEnded = true;
    gameWon = won;
    if (animationId !== null)
        cancelAnimationFrame(animationId);
    overlayTitle.textContent = won ? "You Win! 🎉" : "Game Over";
    overlayMsg.innerHTML = `<div>Final Score: <span style="color: #fde047; font-size: 24px; font-weight: bold;">${score}</span></div><div style="margin-top: 10px;">Enter your name to save your score:</div>`;
    startBtn.style.display = "none";
    nameInputContainer.style.display = "flex";
    
    // Pre-fill with last player name
    const lastName = getLastPlayerName();
    playerNameInput.value = lastName;
    playerNameInput.focus();
    if (lastName) {
        playerNameInput.select(); // Select all text for easy replacement
    }
    
    overlay.classList.remove("hidden");
}

// ---- Button Event Listeners ----
startBtn.onclick = function() {
    const text = this.textContent.trim();
    if (text === "Play Now") {
        startGameNow();
    } else if (text === "Play Again") {
        restartGame();
    } else {
        restartGame();
    }
};

submitScoreBtn.onclick = function() {
    const playerName = playerNameInput.value.trim() || "Anonymous";
    saveLastPlayerName(playerName); // Save the player name
    addScore(playerName, score);
    showLeaderboard();
};

playerNameInput.onkeypress = function(e) {
    if (e.key === "Enter") {
        const playerName = this.value.trim() || "Anonymous";
        saveLastPlayerName(playerName); // Save the player name
        addScore(playerName, score);
        showLeaderboard();
    }
};

// ---- Input ----
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a")
        leftPressed = true;
    if (e.key === "ArrowRight" || e.key === "d")
        rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a")
        leftPressed = false;
    if (e.key === "ArrowRight" || e.key === "d")
        rightPressed = false;
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scale;
    paddle.x = Math.max(0, Math.min(WIDTH - paddle.width, mouseX - paddle.width / 2));
});

// ---- Initial paint (idle state behind overlay) ----
paddle = { x: WIDTH / 2 - 45, width: 90, height: PADDLE_HEIGHT };
ball = { x: WIDTH / 2, y: HEIGHT - 40, vx: 12, vy: -12, radius: BALL_RADIUS };
bricks = createBricks();
draw();
