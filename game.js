const themes = [
    {
        screen:'assets/bg.png',
        bg: 'assets/canvas-bg.png',
        bird: 'assets/bird.png',
        pipeTop: 'assets/pipe-top.png',
        pipeBottom: 'assets/pipe-bottom.png'
    },
    {
        screen:'assets/bg-night.png',
        bg: 'assets/canvas-bg-night.png',
        bird: 'assets/bird-night.png',
        pipeTop: 'assets/pipe-top-night.png',
        pipeBottom: 'assets/pipe-top-night.png'
    }
];
let currentTheme = 0;

// Pre-load all theme images
const themeImages = [];
themes.forEach((theme, index) => {
    themeImages[index] = {
        bg: new Image(),
        bird: new Image(),
        pipeTop: new Image(),
        pipeBottom: new Image()
    };
    themeImages[index].bg.src = theme.bg;
    themeImages[index].bird.src = theme.bird;
    themeImages[index].pipeTop.src = theme.pipeTop;
    themeImages[index].pipeBottom.src = theme.pipeBottom;
});

// Current theme references
let bgImg, birdImg, pipeTopImg, pipeBottomImg;

const flapSound = document.getElementById('flapSound');
const scoreSound = document.getElementById('scoreSound');
const hitSound = document.getElementById('hitSound');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.35;
const FLAP = -6.5;
const PIPE_WIDTH = 52;
const PIPE_GAP = 160;
const BIRD_SIZE = 34;
const PIPE_SPEED = 1.2;
const MIN_PIPE_HEIGHT = 40;
const MAX_PIPE_HEIGHT = canvas.height - PIPE_GAP - MIN_PIPE_HEIGHT;

// Game variables
let birdY, birdVelocity, pipes, score, gameOver, started;
let highScore = localStorage.getItem('flappyHighScore') ? parseInt(localStorage.getItem('flappyHighScore')) : 0;

function setTheme(themeIndex) {
    currentTheme = themeIndex % themes.length;
    // Reference pre-loaded images instead of creating new ones
    bgImg = themeImages[currentTheme].bg;
    birdImg = themeImages[currentTheme].bird;
    pipeTopImg = themeImages[currentTheme].pipeTop;
    pipeBottomImg = themeImages[currentTheme].pipeBottom;
    const bgOverlay = document.getElementById('bg-overlay');
    if (bgOverlay) {
        bgOverlay.style.backgroundImage = `url('${themes[currentTheme].screen}')`;
    }
}

function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    started = false;
    for (let i = 0; i < 3; i++) {
        pipes.push({
            x: 400 + i * 180,
            height: Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT
        });
    }
}

function drawBackground() {
    if (bgImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }
}

function drawBird() {
    if (birdImg && birdImg.complete) {
        ctx.drawImage(birdImg, 80 - BIRD_SIZE / 2, birdY - BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    }
}

function drawPipes() {
    if (!pipeTopImg || !pipeBottomImg || !pipeTopImg.complete || !pipeBottomImg.complete) {
        return;
    }
    
    pipes.forEach(pipe => {
        // Top pipe: stretch and flip vertically
        ctx.save();
        ctx.translate(pipe.x, pipe.height);
        ctx.scale(1, -1);
        ctx.drawImage(pipeTopImg, 0, 0, PIPE_WIDTH, pipe.height);
        ctx.restore();

        // Bottom pipe: stretch from bottom of gap to bottom of canvas
        const bottomPipeHeight = canvas.height - (pipe.height + PIPE_GAP);
        ctx.save();
        ctx.translate(pipe.x, pipe.height + PIPE_GAP);
        ctx.drawImage(pipeBottomImg, 0, 0, PIPE_WIDTH, bottomPipeHeight);
        ctx.restore();
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#222';
    ctx.font = '32px "Press Start 2P", cursive';
    ctx.lineWidth = 4;
    ctx.strokeText(score, canvas.width / 2 - 10, 70);
    ctx.fillText(score, canvas.width / 2 - 10, 70);
    ctx.font = '12px "Press Start 2P", cursive';
    ctx.strokeText('High Score ' + highScore, canvas.width / 2 - 65, 100);
    ctx.fillText('High Score ' + highScore, canvas.width / 2 - 65, 100);
}

function update() {
    if (!started || gameOver) return;

    birdVelocity += GRAVITY;
    birdY += birdVelocity;

    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
    });

    // Add new pipe and remove old ones
    if (pipes[0].x + PIPE_WIDTH < 0) {
        pipes.shift();
        pipes.push({
            x: pipes[pipes.length - 1].x + 180,
            height: Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT
        });
        score++;
        if (scoreSound) {
            scoreSound.currentTime = 0;
            scoreSound.play();
        }
    }

    // Collision detection
    pipes.forEach(pipe => {
        if (
            80 + BIRD_SIZE / 2 > pipe.x &&
            80 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH &&
            (birdY - BIRD_SIZE / 2 < pipe.height || birdY + BIRD_SIZE / 2 > pipe.height + PIPE_GAP)
        ) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyHighScore', highScore);
            }
            hitSound.currentTime = 0;
            hitSound.play();
        }
    });

    // Ground and ceiling collision
    if (birdY + BIRD_SIZE / 2 > canvas.height || birdY - BIRD_SIZE / 2 < 0) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
        hitSound.currentTime = 0;
        hitSound.play();
    }
}

function draw() {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
    if (!started) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '32px "Press Start 2P", cursive';
        ctx.fillText('Start Game', 76, canvas.height / 2 - 20);
        ctx.font = '14px "Press Start 2P", cursive';
        ctx.fillText('Press Space or Tap to Start', 34, canvas.height / 2);
    }
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '32px "Press Start 2P", cursive';
        ctx.fillText('Game Over', 76, canvas.height / 2 - 20);
        ctx.font = '14px "Press Start 2P", cursive';
        ctx.fillText('Press Space or Tap to Restart', 28, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function flap() {
    if (!started) {
        started = true;
    }
    if (!gameOver) {
        birdVelocity = FLAP;
        if (flapSound) {
            flapSound.currentTime = 0;
            flapSound.play();
        }
    } else {
        resetGame();
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        flap();
    }
});

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    flap();
});

let themeTimer = 0;
let themeInterval = 60000; // 60 seconds for day
let nightDuration = 30000; // 30 seconds for night

function themeSwitcher() {
    if (currentTheme === 0) {
        setTheme(1);
        themeTimer = setTimeout(themeSwitcher, nightDuration);
    } else {
        setTheme(0);
        themeTimer = setTimeout(themeSwitcher, themeInterval);
    }
}

setTheme(0);

Promise.all([
    new Promise(resolve => themeImages[0].bg.onload = resolve),
    new Promise(resolve => themeImages[0].bird.onload = resolve),
    new Promise(resolve => themeImages[0].pipeTop.onload = resolve),
    new Promise(resolve => themeImages[0].pipeBottom.onload = resolve)
]).then(() => {
    resetGame();
    gameLoop();
    setTimeout(themeSwitcher, themeInterval);
});