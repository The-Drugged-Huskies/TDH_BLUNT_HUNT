/**
 * Game Class
 * Manages the main game loop, state, and rendering context.
 * Coordinates interaction between the Slingshot, Husky, and Blunts.
 */
class Game {
    constructor() {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById('gameCanvas');
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.slingshot = new Slingshot(this);
        this.husky = null;
        this.blunts = [];
        this.score = 0;
        this.isRunning = false;

        // Difficulty settings
        this.bluntSpawnRate = 2000; //ms
        this.bluntLifeTime = 5000; // ms, decreases over time
        this.lastSpawnTime = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input handling
        this.canvas.addEventListener('mousedown', (e) => this.slingshot.onMouseDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.slingshot.onMouseMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.slingshot.onMouseUp());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.slingshot.onMouseDown(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.slingshot.onMouseMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        window.addEventListener('touchend', () => this.slingshot.onMouseUp());

        // UI
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.startBtn.addEventListener('click', () => this.start());
        this.restartBtn.addEventListener('click', () => this.start());

        this.loop = this.loop.bind(this);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        if (this.slingshot) {
            this.slingshot.updatePosition();
        }
    }

    start() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        this.score = 0;
        this.updateScore(0);
        this.blunts = [];
        this.husky = null;
        this.isRunning = true;
        this.bluntLifeTime = 5000; // Reset difficulty
        this.lastSpawnTime = performance.now();

        // Timer Logic
        this.gameDuration = 60; // seconds
        this.startTime = performance.now();

        requestAnimationFrame(this.loop);
    }

    gameOver() {
        this.isRunning = false;
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score').innerText = this.score;
        // Increase difficulty: decrease blunt lifetime by 100ms for every point, min 1 sec
        this.bluntLifeTime = Math.max(1000, 5000 - (this.score * 100));
    }

    updateTimer(timestamp) {
        const elapsed = (timestamp - this.startTime) / 1000;
        const remaining = Math.max(0, this.gameDuration - elapsed);

        const seconds = Math.ceil(remaining);
        const fmt = seconds < 10 ? `0${seconds}` : seconds;
        document.getElementById('timer').innerText = `00:${fmt}`;

        if (remaining <= 0) {
            this.gameOver();
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.updateTimer(timestamp);

        // Update & Draw Slingshot
        this.slingshot.draw(this.ctx);

        // Update & Draw Husky
        if (this.husky) {
            this.husky.update();
            this.husky.draw(this.ctx);

            // Check boundaries
            if (this.husky.y > this.height + 100 || this.husky.x > this.width + 100 || this.husky.x < -100) {
                this.husky = null; // Reset husky if it goes off screen
                this.slingshot.reset();
            }
        }

        // Spawn Blunts
        if (timestamp - this.lastSpawnTime > this.bluntSpawnRate) {
            this.spawnBlunt();
            this.lastSpawnTime = timestamp;
        }

        // Update & Draw Blunts
        for (let i = this.blunts.length - 1; i >= 0; i--) {
            let blunt = this.blunts[i];
            blunt.update(timestamp);
            blunt.draw(this.ctx);

            // Collision Detection
            if (this.husky && this.checkCollision(this.husky, blunt)) {
                this.blunts.splice(i, 1);
                this.updateScore(1);
                // Optional: Effect on hit
                continue;
            }

            // Remove if expired
            if (blunt.isExpired(timestamp)) {
                this.blunts.splice(i, 1);
            }
        }

        requestAnimationFrame(this.loop);
    }

    spawnBlunt() {
        const x = Math.random() * (this.width - 100) + 50;
        const y = Math.random() * (this.height / 2) + 50; // Use upper half
        this.blunts.push(new Blunt(x, y, this.bluntLifeTime));
    }

    checkCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }
}

/**
 * Slingshot Class
 * Handles the physics and user interaction for aiming and launching projectiles.
 */
class Slingshot {
    /**
     * @param {Game} game - Reference to the main game instance.
     */
    constructor(game) {
        this.game = game;
        this.updatePosition();
        this.isDragging = false;
        this.dragX = this.x;
        this.dragY = this.y;
        this.maxPull = 150;
    }

    updatePosition() {
        this.x = this.game.width / 2;
        this.y = this.game.height - 150;
    }

    onMouseDown(x, y) {
        // Simple hit test for slingshot area
        const dist = Math.hypot(x - this.x, y - this.y);
        if (dist < 100) { // Interaction radius
            this.isDragging = true;
            this.dragX = x;
            this.dragY = y;
        }
    }

    onMouseMove(x, y) {
        if (this.isDragging) {
            const dx = x - this.x;
            const dy = y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist > this.maxPull) {
                const angle = Math.atan2(dy, dx);
                this.dragX = this.x + Math.cos(angle) * this.maxPull;
                this.dragY = this.y + Math.sin(angle) * this.maxPull;
            } else {
                this.dragX = x;
                this.dragY = y;
            }
        }
    }

    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.shoot();
            this.dragX = this.x;
            this.dragY = this.y;
        }
    }

    shoot() {
        const dx = this.x - this.dragX;
        const dy = this.y - this.dragY;
        // Vector is inverted because we pull back
        const power = 0.15;

        if (!this.game.husky) {
            this.game.husky = new Husky(this.x, this.y, dx * power, dy * power);
        }
    }

    reset() {
        // Called when husky is off screen, can animate return of band
    }

    draw(ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(this.x - 20, this.y); // Left arm
        ctx.lineTo(this.dragX, this.dragY);
        ctx.lineTo(this.x + 20, this.y); // Right arm
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(this.x - 20, this.y, 5, 0, Math.PI * 2);
        ctx.arc(this.x + 20, this.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 100);
        ctx.lineTo(this.x, this.y);
        ctx.moveTo(this.x - 20, this.y);
        ctx.lineTo(this.x, this.y + 30);
        ctx.lineTo(this.x + 20, this.y);
        ctx.stroke();

        // Puck/Husky placeholder in band if not dragging but not shot? 
        // For now simple band logic
        if (this.isDragging) {
            ctx.fillStyle = '#00ff9d'; // Accent color for the projectile indicator
            ctx.beginPath();
            ctx.arc(this.dragX, this.dragY, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Husky {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = 20;
        this.gravity = 0.5;
        this.friction = 0.99;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity;
        // this.dx *= this.friction; // Air resistance optional
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Placeholder visuals for Husky
        ctx.fillStyle = '#bd00ff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DO', 0, 0); // Placeholder
        ctx.restore();
    }
}

class Blunt {
    constructor(x, y, lifetime) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.spawnTime = performance.now();
        this.lifetime = lifetime;
        this.floatOffset = Math.random() * 100;
        this.baseY = y;
    }

    isExpired(timestamp) {
        return (timestamp - this.spawnTime) > this.lifetime;
    }

    update(timestamp) {
        // Floating effect
        const age = timestamp - this.spawnTime;
        this.y = this.baseY + Math.sin((age / 500) + this.floatOffset) * 10;
    }

    draw(ctx) {
        const age = performance.now() - this.spawnTime;
        // Opacity fade out near end
        let alpha = 1;
        if (age > this.lifetime - 1000) {
            alpha = (this.lifetime - age) / 1000;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(this.x, this.y);

        // Placeholder visuals for Blunt
        ctx.fillStyle = '#d4af37'; // Goldish
        ctx.beginPath();
        ctx.rect(-20, -10, 40, 20); // Horizontal blunt shape
        ctx.fill();

        // Cherry
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(20, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Initialize game on load
window.onload = () => {
    const game = new Game();
};
