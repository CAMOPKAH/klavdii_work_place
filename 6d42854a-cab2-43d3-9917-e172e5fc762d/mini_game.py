#!/usr/bin/env python3
"""
Мини-игра на HTML: Ловля падающих объектов
"""

import os
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time

HTML_CONTENT = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мини-игра: Ловля падающих объектов</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
        }
        
        .game-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .game-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 1.2em;
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 10px;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-value {
            font-weight: bold;
            font-size: 1.5em;
            color: #ffd700;
        }
        
        .game-area {
            position: relative;
            width: 100%;
            height: 400px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .player {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 20px;
            background: linear-gradient(90deg, #00c6ff, #0072ff);
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 114, 255, 0.5);
            transition: left 0.1s;
        }
        
        .falling-object {
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: linear-gradient(45deg, #ff416c, #ff4b2b);
            box-shadow: 0 0 10px rgba(255, 65, 108, 0.5);
            animation: fall linear infinite;
        }
        
        .bonus {
            background: linear-gradient(45deg, #00b09b, #96c93d);
            box-shadow: 0 0 10px rgba(0, 176, 155, 0.5);
        }
        
        @keyframes fall {
            from { top: -30px; }
            to { top: 400px; }
        }
        
        .controls {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        button {
            padding: 12px 30px;
            font-size: 1.1em;
            border: none;
            border-radius: 50px;
            background: linear-gradient(90deg, #ff416c, #ff4b2b);
            color: white;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            font-weight: bold;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .start-btn {
            background: linear-gradient(90deg, #00b09b, #96c93d);
        }
        
        .instructions {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .instructions h3 {
            margin-bottom: 10px;
            color: #ffd700;
        }
        
        .instructions ul {
            list-style-position: inside;
            margin-left: 10px;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .game-over {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            display: none;
            z-index: 100;
            width: 80%;
            max-width: 400px;
        }
        
        .game-over h2 {
            color: #ff416c;
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        
        .final-score {
            font-size: 3em;
            color: #ffd700;
            margin: 20px 0;
        }
        
        .level-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .level-value {
            color: #00c6ff;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>🎮 Ловля падающих объектов</h1>
        
        <div class="game-info">
            <div class="info-item">
                <div>Счёт</div>
                <div class="info-value" id="score">0</div>
            </div>
            <div class="info-item">
                <div>Жизни</div>
                <div class="info-value" id="lives">3</div>
            </div>
            <div class="info-item">
                <div>Рекорд</div>
                <div class="info-value" id="highScore">0</div>
            </div>
        </div>
        
        <div class="game-area" id="gameArea">
            <div class="player" id="player"></div>
            <div class="level-indicator">
                Уровень: <span class="level-value" id="level">1</span>
            </div>
        </div>
        
        <div class="controls">
            <button class="start-btn" id="startBtn">▶️ Начать игру</button>
            <button id="pauseBtn">⏸️ Пауза</button>
            <button id="resetBtn">🔄 Сброс</button>
        </div>
        
        <div class="instructions">
            <h3>📋 Как играть:</h3>
            <ul>
                <li>Используйте ← → стрелки или A/D для движения</li>
                <li>Ловите красные шары для получения очков (+10)</li>
                <li>Ловите зелёные шары для бонусных очков (+50)</li>
                <li>Избегайте пропусков - теряете жизнь</li>
                <li>Каждые 100 очков повышается уровень сложности</li>
                <li>Цель: набрать как можно больше очков!</li>
            </ul>
        </div>
        
        <div class="game-over" id="gameOver">
            <h2>Игра окончена!</h2>
            <div class="final-score" id="finalScore">0</div>
            <p>Ваш результат: <span id="resultScore">0</span></p>
            <p>Рекорд: <span id="resultHighScore">0</span></p>
            <button class="start-btn" id="restartBtn">🎮 Играть снова</button>
        </div>
    </div>

    <script>
        const gameArea = document.getElementById('gameArea');
        const player = document.getElementById('player');
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const highScoreElement = document.getElementById('highScore');
        const levelElement = document.getElementById('level');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const resultScoreElement = document.getElementById('resultScore');
        const resultHighScoreElement = document.getElementById('resultHighScore');
        const restartBtn = document.getElementById('restartBtn');

        let score = 0;
        let lives = 3;
        let highScore = localStorage.getItem('highScore') || 0;
        let level = 1;
        let gameRunning = false;
        let gamePaused = false;
        let objects = [];
        let objectInterval;
        let speed = 2;
        let playerSpeed = 8;
        let keys = {};

        highScoreElement.textContent = highScore;

        function updateScore(points) {
            score += points;
            scoreElement.textContent = score;
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('highScore', highScore);
            }
            
            const newLevel = Math.floor(score / 100) + 1;
            if (newLevel > level) {
                level = newLevel;
                levelElement.textContent = level;
                speed = 1.5 + (level * 0.5);
            }
        }

        function updateLives() {
            lives--;
            livesElement.textContent = lives;
            
            if (lives <= 0) {
                endGame();
            }
        }

        function createObject() {
            if (!gameRunning || gamePaused) return;
            
            const object = document.createElement('div');
            const isBonus = Math.random() < 0.2;
            
            object.className = isBonus ? 'falling-object bonus' : 'falling-object';
            object.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
            object.style.animationDuration = (Math.random() * 2 + 1) / speed + 's';
            
            object.dataset.type = isBonus ? 'bonus' : 'normal';
            gameArea.appendChild(object);
            objects.push(object);
            
            object.addEventListener('animationend', () => {
                if (object.parentNode && object.dataset.type === 'normal') {
                    updateLives();
                }
                object.remove();
                objects = objects.filter(obj => obj !== object);
            });
        }

        function movePlayer() {
            if (!gameRunning || gamePaused) return;
            
            const playerRect = player.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            let newLeft = parseInt(player.style.left || '0');
            
            if (keys['ArrowLeft'] || keys['KeyA']) {
                newLeft -= playerSpeed;
            }
            if (keys['ArrowRight'] || keys['KeyD']) {
                newLeft += playerSpeed;
            }
            
            newLeft = Math.max(0, Math.min(newLeft, gameAreaRect.width - playerRect.width));
            player.style.left = newLeft + 'px';
            
            checkCollisions();
        }

        function checkCollisions() {
            const playerRect = player.getBoundingClientRect();
            
            objects.forEach(object => {
                const objectRect = object.getBoundingClientRect();
                
                if (playerRect.left < objectRect.right &&
                    playerRect.right > objectRect.left &&
                    playerRect.top < objectRect.bottom &&
                    playerRect.bottom > objectRect.top) {
                    
                    if (object.dataset.type === 'bonus') {
                        updateScore(50);
                    } else {
                        updateScore(10);
                    }
                    
                    object.remove();
                    objects = objects.filter(obj => obj !== object);
                }
            });
        }

        function startGame() {
            if (gameRunning) return;
            
            score = 0;
            lives = 3;
            level = 1;
            speed = 2;
            
            scoreElement.textContent = score;
            livesElement.textContent = lives;
            levelElement.textContent = level;
            
            objects.forEach(obj => obj.remove());
            objects = [];
            
            gameRunning = true;
            gamePaused = false;
            gameOverScreen.style.display = 'none';
            
            objectInterval = setInterval(createObject, 800);
            gameLoop();
            
            startBtn.textContent = '🔄 Перезапуск';
        }

        function pauseGame() {
            if (!gameRunning) return;
            
            gamePaused = !gamePaused;
            pauseBtn.textContent = gamePaused ? '▶️ Продолжить' : '⏸️ Пауза';
            
            objects.forEach(obj => {
                if (gamePaused) {
                    obj.style.animationPlayState = 'paused';
                } else {
                    obj.style.animationPlayState = 'running';
                }
            });
        }

        function resetGame() {
            clearInterval(objectInterval);
            gameRunning = false;
            gamePaused = false;
            
            objects.forEach(obj => obj.remove());
            objects = [];
            
            score = 0;
            lives = 3;
            level = 1;
            
            scoreElement.textContent = score;
            livesElement.textContent = lives;
            levelElement.textContent = level;
            
            player.style.left = '50%';
            startBtn.textContent = '▶️ Начать игру';
            pauseBtn.textContent = '⏸️ Пауза';
            gameOverScreen.style.display = 'none';
        }

        function endGame() {
            gameRunning = false;
            clearInterval(objectInterval);
            
            finalScoreElement.textContent = score;
            resultScoreElement.textContent = score;
            resultHighScoreElement.textContent = highScore;
            gameOverScreen.style.display = 'block';
        }

        function gameLoop() {
            if (!gameRunning || gamePaused) return;
            
            movePlayer();
            requestAnimationFrame(gameLoop);
        }

        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', pauseGame);
        resetBtn.addEventListener('click', resetGame);
        restartBtn.addEventListener('click', startGame);

        gameArea.addEventListener('mousemove', (e) => {
            if (!gameRunning || gamePaused) return;
            
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left - player.offsetWidth / 2;
            const maxX = rect.width - player.offsetWidth;
            
            player.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        });

        player.style.left = '50%';
    </script>
</body>
</html>'''

def save_html_file():
    """Сохраняет HTML файл с игрой"""
    with open('mini_game.html', 'w', encoding='utf-8') as f:
        f.write(HTML_CONTENT)
    print("✅ HTML файл создан: mini_game.html")

def start_server(port=8000):
    """Запускает локальный сервер для игры"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    class GameHandler(SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
    
    server = HTTPServer(('localhost', port), GameHandler)
    print(f"🌐 Сервер запущен на http://localhost:{port}")
    print("🎮 Открываю игру в браузере...")
    
    webbrowser.open(f'http://localhost:{port}/mini_game.html')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")

def main():
    """Основная функция"""
    print("=" * 50)
    print("🎮 Мини-игра: Ловля падающих объектов")
    print("=" * 50)
    
    save_html_file()
    
    print("\nВыберите действие:")
    print("1. Запустить игру в браузере (локальный сервер)")
    print("2. Просто открыть HTML файл")
    print("3. Только создать файл")
    
    choice = input("\nВаш выбор (1-3): ").strip()
    
    if choice == '1':
        try:
            start_server()
        except OSError as e:
            if "Address already in use" in str(e):
                print("⚠️  Порт 8000 занят, пробую порт 8080...")
                start_server(8080)
            else:
                raise
    elif choice == '2':
        webbrowser.open('file://' + os.path.abspath('mini_game.html'))
        print("✅ Игра открыта в браузере")
    elif choice == '3':
        print("✅ Файл создан: mini_game.html")
        print("📁 Откройте его в браузере для игры")
    else:
        print("❌ Неверный выбор")

if __name__ == '__main__':
    main()