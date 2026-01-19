import { Player } from './Player.js';
import { InputHandler } from './Input.js';
import { Level } from './Level.js';
import { LEVEL_MAPS } from './Levels.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
let currentLevelIndex = 0;
let level = new Level(LEVEL_MAPS[currentLevelIndex]);
let lastTime = 0;

const input = new InputHandler();
const player = new Player(level.playerStartX, level.playerStartY);

let cameraX = 0;
let gameState = 'MENU'; // MENU, PLAYING, WIN, LOSE

function update(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // Convert ms to seconds
    lastTime = timestamp;

    if (gameState === 'MENU') {
        if (input.isPressed('Enter')) {
            gameState = 'PLAYING';
        }
    }
    else if (gameState === 'PLAYING') {
        const timeOut = level.update(deltaTime);

        if (timeOut) {
            gameState = 'LOSE'; // Death by timer
        }

        player.update(input, level.platforms);
        cameraX = player.x - canvas.width / 4;

        // Item Collection
        level.coins.forEach(c => {
            if (!c.collected && Math.hypot(player.x - c.x, player.y - c.y) < 30) {
                c.collected = true;
                level.score += 100; // Add to level score
            }
        });

        // Win Condition
        if (player.x > level.goal.x) {
            gameState = 'WIN';
        }

        // Lose Condition (Falling off screen)
        if (player.y > canvas.height) {
            gameState = 'LOSE';
        }
    }
    else if (gameState === 'WIN' || gameState === 'LOSE') {
        if (input.isPressed('Enter')) {
            // Simply reset the player and level instead of reloading the whole page
            location.reload();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        level.draw(ctx, cameraX);
        player.draw(ctx, cameraX);
        level.drawUI(ctx);
    } else {
        // UI Screens (Menu, Win, Lose)
        ctx.fillStyle = '#5c94fc'; // Fill background so it's not black
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';

        let text = "";
        if (gameState === 'MENU') text = "MARIO CLONE: PRESS ENTER";
        if (gameState === 'WIN') text = "YOU WIN! PRESS ENTER";
        if (gameState === 'LOSE') text = "GAME OVER! PRESS ENTER";

        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
}

function restartGame() {
    player.x = level.playerStartX;
    player.y = level.playerStartY;
    player.velX = 0;
    player.velY = 0;
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();