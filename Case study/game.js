const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load assets
const tankImage = new Image();
tankImage.src = './assets/images/Tank 1.png';
tankImage.width = 100;
tankImage.height = 163;

const bulletImage = new Image();
bulletImage.src = './assets/images/Ellipse 1.png';

const enemyImage = new Image();
enemyImage.src = './assets/images/dich.png';

// Load canon shoot sound
const shootSound = new Audio("assets/audio/canon.flac");
shootSound.volume = 0.5;

// Load game over sound
const endGameSound = new Audio("assets/audio/game_over.wav");
endGameSound.volume = 1;

// Game variables
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0
};

const bullets = [];
const bulletSpeed = 400;
let lastShotTime = 0;
const shootDelay = 0.3;

const enemies = [];
let enemySpeed = 100;
let enemySpawnRate = 3;
let lastEnemySpawnTime = 0;

let score = 0;
let gameOver = false;

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Mouse aiming
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

// Shooting
canvas.addEventListener("mousedown", (e) => {
    const now = performance.now() / 1000;
    if (e.button === 0 && now - lastShotTime > shootDelay && !gameOver) {
        lastShotTime = now;

        const angle = player.angle;
        const bullet = {
            x: player.x + Math.cos(angle) * 40,
            y: player.y + Math.sin(angle) * 40,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed
        };
        bullets.push(bullet);

        // Knockback
        player.x -= Math.cos(angle) * 10;
        player.y -= Math.sin(angle) * 10;

        // Play shooting sound
        const cannonSound = shootSound.cloneNode();
        cannonSound.volume = 0.5;
        cannonSound.play();
    }
});

// Update
function update(deltaTime) {
    if (gameOver) return;

    const speed = 200;
    if (keys['w']) player.y -= speed * deltaTime;
    if (keys['s']) player.y += speed * deltaTime;
    if (keys['a']) player.x -= speed * deltaTime;
    if (keys['d']) player.x += speed * deltaTime;

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx * deltaTime;
        bullets[i].y += bullets[i].vy * deltaTime;

        if (
            bullets[i].x < 0 || bullets[i].x > canvas.width ||
            bullets[i].y < 0 || bullets[i].y > canvas.height
        ) {
            bullets.splice(i, 1);
        }
    }

    // Spawn enemies
    const now = performance.now() / 1000;
    if (now - lastEnemySpawnTime > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawnTime = now;
    }

    // Enemies update
    for (let i = enemies.length - 1; i >= 0; i--) {
        moveEnemy(enemies[i], deltaTime);

        // Check bullet collision
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(enemies[i], bullets[j])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                break;
            }
        }

        // Check collision with player
        if (checkCollisionWithPlayer(enemies[i])) {
            endGame();
        }
    }
}

// Draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bullets
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x - 10, bullet.y - 10, 20, 20);
    });

    // Player tank
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2);
    ctx.drawImage(tankImage, -tankImage.width / 2, -tankImage.height / 2, tankImage.width, tankImage.height);
    ctx.restore();

    // Enemies
    drawEnemies();

    // Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

// Enemy draw
function drawEnemies() {
    const zombieWidth = 50;
    const zombieHeight = 80;

    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(0);
        ctx.drawImage(enemyImage, -zombieWidth / 2, -zombieHeight / 2, zombieWidth, zombieHeight);
        ctx.restore();
    });
}

// Enemy spawn from screen edge
function spawnEnemy() {
    const zombieWidth = 50;
    const zombieHeight = 80;

    let x, y;
    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
        case 0: // top
            x = Math.random() * canvas.width;
            y = -zombieHeight;
            break;
        case 1: // right
            x = canvas.width + zombieWidth;
            y = Math.random() * canvas.height;
            break;
        case 2: // bottom
            x = Math.random() * canvas.width;
            y = canvas.height + zombieHeight;
            break;
        case 3: // left
            x = -zombieWidth;
            y = Math.random() * canvas.height;
            break;
    }

    enemies.push({ x, y, angle: 0, health: 1 });
}

// Enemy move toward player
function moveEnemy(enemy, deltaTime) {
    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angleToPlayer) * enemySpeed * deltaTime;
    enemy.y += Math.sin(angleToPlayer) * enemySpeed * deltaTime;
}

// Hit detection (rectangular hitbox)
function checkCollision(enemy, bullet) {
    const zombieWidth = 50;
    const zombieHeight = 80;

    return (
        bullet.x > enemy.x - zombieWidth / 2 &&
        bullet.x < enemy.x + zombieWidth / 2 &&
        bullet.y > enemy.y - zombieHeight / 2 &&
        bullet.y < enemy.y + zombieHeight / 2
    );
}

// Player hit detection (circle)
function checkCollisionWithPlayer(enemy) {
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    return dist < 40;
}

// Game over
function endGame() {
    gameOver = true;
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('finalScore').textContent = `Điểm của bạn: ${score}`;
    document.body.style.backgroundImage = "url('./assets/images/background.jpg')";
    const gameOverSound = endGameSound.cloneNode();
    gameOverSound.volume = 1;
    gameOverSound.play();

}

// Restart game
function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    bullets.length = 0;
    enemies.length = 0;
    score = 0;
    gameOver = false;
    document.getElementById('overlay').style.display = 'none';
    document.body.style.backgroundImage = "url('./assets/images/marbled-stone-background.jpg')";
}

// Game loop - chạy ở 120 FPS
let lastTime = performance.now();

tankImage.onload = () => {
    setInterval(() => {
        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        update(deltaTime);
        draw();
    }, 1000 / 120); // 120 FPS
};
