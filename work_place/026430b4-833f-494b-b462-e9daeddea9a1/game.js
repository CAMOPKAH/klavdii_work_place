class ArkanoidGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameState = 'start';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.soundEnabled = true;
        this.difficulty = 'easy';
        
        this.paddle = {
            x: this.canvas.width / 2 - 75,
            y: this.canvas.height - 30,
            width: 150,
            height: 20,
            speed: 8,
            color: '#e94560'
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            radius: 12,
            speedX: 5,
            speedY: -5,
            color: '#38ef7d',
            launched: false
        };
        
        this.bricks = [];
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 80;
        this.brickHeight = 30;
        this.brickPadding = 10;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 35;
        
        this.keys = {};
        this.animationId = null;
        
        this.sounds = {
            brickHit: document.getElementById('brickHitSound'),
            paddleHit: document.getElementById('paddleHitSound'),
            wallHit: document.getElementById('wallHitSound'),
            gameOver: document.getElementById('gameOverSound'),
            levelComplete: document.getElementById('levelCompleteSound')
        };
        
        this.init();
        this.setupEventListeners();
        this.createBricks();
    }
    
    init() {
        this.updateUI();
        this.draw();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                if (this.gameState === 'start') {
                    this.startGame();
                } else if (this.gameState === 'playing' && !this.ball.launched) {
                    this.ball.launched = true;
                }
            }
            
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('easyButton').addEventListener('click', () => {
            this.setDifficulty('easy');
        });
        
        document.getElementById('mediumButton').addEventListener('click', () => {
            this.setDifficulty('medium');
        });
        
        document.getElementById('hardButton').addEventListener('click', () => {
            this.setDifficulty('hard');
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing' && !this.paused) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                this.paddle.x = mouseX - this.paddle.width / 2;
                
                if (this.paddle.x < 0) {
                    this.paddle.x = 0;
                }
                if (this.paddle.x + this.paddle.width > this.canvas.width) {
                    this.paddle.x = this.canvas.width - this.paddle.width;
                }
            }
        });
    }
    
    createBricks() {
        this.bricks = [];
        const colors = ['#ff416c', '#2193b0', '#11998e', '#f7971e', '#9c27b0'];
        
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                const points = (this.brickRowCount - r) * 10 * this.level;
                
                this.bricks[c][r] = {
                    x: brickX,
                    y: brickY,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: colors[r % colors.length],
                    points: points,
                    visible: true
                };
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawPaddle();
        this.drawBall();
        this.drawBricks();
        this.drawUI();
        
        if (this.gameState === 'playing' && !this.paused) {
            this.update();
        }
        
        this.animationId = requestAnimationFrame(() => this.draw());
    }
    
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 10);
        this.ctx.fillStyle = this.paddle.color;
        this.ctx.fill();
        this.ctx.closePath();
        
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x + 5, this.paddle.y + 5, this.paddle.width - 10, this.paddle.height - 10, 5);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();
        this.ctx.closePath();
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius - 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.visible) {
                    this.ctx.beginPath();
                    this.ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 5);
                    this.ctx.fillStyle = brick.color;
                    this.ctx.fill();
                    this.ctx.closePath();
                    
                    this.ctx.beginPath();
                    this.ctx.roundRect(brick.x + 3, brick.y + 3, brick.width - 6, brick.height - 6, 3);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.globalAlpha = 0.3;
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0;
                    this.ctx.closePath();
                }
            }
        }
    }
    
    drawUI() {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Уровень: ${this.level}`, 10, 25);
        this.ctx.fillText(`Сложность: ${this.getDifficultyText()}`, 10, 45);
        
        if (this.paused) {
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillStyle = '#e94560';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ПАУЗА', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        if (!this.ball.launched && this.gameState === 'playing') {
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#38ef7d';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Нажмите ПРОБЕЛ для запуска мяча', this.canvas.width / 2, this.canvas.height - 80);
        }
    }
    
    update() {
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.paddle.x -= this.paddle.speed;
            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            }
        }
        
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.paddle.x += this.paddle.speed;
            if (this.paddle.x + this.paddle.width > this.canvas.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
        }
        
        if (this.ball.launched) {
            this.ball.x += this.ball.speedX;
            this.ball.y += this.ball.speedY;
            
            if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
                this.ball.speedX = -this.ball.speedX;
                this.playSound('wallHit');
            }
            
            if (this.ball.y - this.ball.radius < 0) {
                this.ball.speedY = -this.ball.speedY;
                this.playSound('wallHit');
            }
            
            if (this.ball.y + this.ball.radius > this.canvas.height) {
                this.loseLife();
                return;
            }
            
            if (this.ball.x > this.paddle.x && 
                this.ball.x < this.paddle.x + this.paddle.width && 
                this.ball.y + this.ball.radius > this.paddle.y) {
                
                const hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
                this.ball.speedX = hitPoint * 7;
                this.ball.speedY = -Math.abs(this.ball.speedY);
                this.playSound('paddleHit');
            }
            
            this.checkBrickCollision();
            
            if (this.checkLevelComplete()) {
                this.completeLevel();
            }
        } else {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
        }
    }
    
    checkBrickCollision() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.visible) {
                    if (this.ball.x + this.ball.radius > brick.x && 
                        this.ball.x - this.ball.radius < brick.x + brick.width && 
                        this.ball.y + this.ball.radius > brick.y && 
                        this.ball.y - this.ball.radius < brick.y + brick.height) {
                        
                        this.playSound('brickHit');
                        brick.visible = false;
                        this.score += brick.points;
                        this.updateUI();
                        
                        const ballLeft = this.ball.x - this.ball.radius;
                        const ballRight = this.ball.x + this.ball.radius;
                        const ballTop = this.ball.y - this.ball.radius;
                        const ballBottom = this.ball.y + this.ball.radius;
                        
                        const brickLeft = brick.x;
                        const brickRight = brick.x + brick.width;
                        const brickTop = brick.y;
                        const brickBottom = brick.y + brick.height;
                        
                        const fromLeft = ballRight - brickLeft;
                        const fromRight = brickRight - ballLeft;
                        const fromTop = ballBottom - brickTop;
                        const fromBottom = brickBottom - ballTop;
                        
                        const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                        
                        if (min === fromLeft || min === fromRight) {
                            this.ball.speedX = -this.ball.speedX;
                        } else {
                            this.ball.speedY = -this.ball.speedY;
                        }
                        
                        return;
                    }
                }
            }
        }
    }
    
    checkLevelComplete() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].visible) {
                    return false;
                }
            }
        }
        return true;
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 50;
        this.ball.speedX = 5;
        this.ball.speedY = -5;
        this.ball.launched = false;
        this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        document.getElementById('nextLevel').textContent = this.level + 1;
        document.getElementById('levelComplete').classList.remove('hidden');
        this.playSound('levelComplete');
    }
    
    nextLevel() {
        this.level++;
        this.createBricks();
        this.resetBall();
        this.gameState = 'playing';
        document.getElementById('levelComplete').classList.add('hidden');
        this.updateUI();
        
        this.ball.speedX *= 1.1;
        this.ball.speedY *= 1.1;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        this.playSound('gameOver');
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        this.resetBall();
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.createBricks();
        this.resetBall();
        this.gameState = 'playing';
        document.getElementById('gameOver').classList.add('hidden');
        this.updateUI();
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.createBricks();
        this.resetBall();
        this.gameState = 'start';
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        this.updateUI();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.paused = !this.paused;
            document.getElementById('pauseButton').innerHTML = this.paused ? 
                '<i class="fas fa-play"></i> Продолжить' : 
                '<i class="fas fa-pause"></i> Пауза';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        document.getElementById('soundToggle').innerHTML = this.soundEnabled ? 
            '<i class="fas fa-volume-up"></i> Звук' : 
            '<i class="fas fa-volume-mute"></i> Звук';
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        document.querySelectorAll('.difficulty-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(`${difficulty}Button`).classList.add('active');
        
        switch (difficulty) {
            case 'easy':
                this.paddle.width = 180;
                this.ball.speedX = 4;
                this.ball.speedY = -4;
                this.paddle.speed = 7;
                break;
            case 'medium':
                this.paddle.width = 150;
                this.ball.speedX = 5;
                this.ball.speedY = -5;
                this.paddle.speed = 8;
                break;
            case 'hard':
                this.paddle.width = 120;
                this.ball.speedX = 6;
                this.ball.speedY = -6;
                this.paddle.speed = 9;
                break;
        }
        
        if (this.gameState === 'playing') {
            this.resetBall();
        }
    }
    
    getDifficultyText() {
        switch (this.difficulty) {
            case 'easy': return 'Легко';
            case 'medium': return 'Средне';
            case 'hard': return 'Сложно';
            default: return 'Легко';
        }
    }
    
    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
}

const game = new ArkanoidGame();