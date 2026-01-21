import { Player } from './Player.js';
import { InputHandler } from './Input.js';
import { Level } from './Level.js';
import { LEVEL_MAPS } from './levels.js'; // Ensure casing matches your filename

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let currentLevelIndex = 0;
let level = new Level(LEVEL_MAPS[currentLevelIndex]);
let player = new Player(level.playerStartX, level.playerStartY);
const input = new InputHandler();

let lastTime = 0;
let cameraX = 0;
let gameState = 'MENU'; // MENU, PLAYING, WIN, LOSE, GAME_COMPLETE

function loadNextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex < LEVEL_MAPS.length) {
        level = new Level(LEVEL_MAPS[currentLevelIndex]);
        player.x = level.playerStartX;
        player.y = level.playerStartY;
        player.velX = 0;
        player.velY = 0;
        gameState = 'PLAYING';
    } else {
        gameState = 'WIN'; // This triggers the final "You Win" screen
    }
}

function update(timestamp) {
    // Prevent deltaTime spike on first frame
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (gameState === 'MENU') {
        if (input.isPressed('Enter')) {
            gameState = 'PLAYING';
        }
    }
    else if (gameState === 'PLAYING') {
        const timeOut = level.update(deltaTime);
        if (timeOut) gameState = 'LOSE';

        player.update(input, level.platforms);
        
        // Camera smooth follow
        cameraX = player.x - canvas.width / 4;

        // Item Collection
        level.coins.forEach(c => {
            if (!c.collected && Math.hypot(player.x - c.x, player.y - c.y) < 32) {
                c.collected = true;
                level.score += 100;
            }
        });

        // FIXED Win Condition: Proper AABB Collision
        if (level.goal &&
            player.x < level.goal.x + level.goal.w &&
            player.x + player.width > level.goal.x &&
            player.y < level.goal.y + level.goal.h &&
            player.y + player.height > level.goal.y) {
            
            loadNextLevel(); 
        }

        // Lose Condition (Falling off screen)
        if (player.y > canvas.height) {
            gameState = 'LOSE';
        }
    }
    else if (gameState === 'WIN' || gameState === 'LOSE') {
        if (input.isPressed('Enter')) {
            location.reload(); // Hard reset for total restart
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
        // UI Screens
        ctx.fillStyle = '#5c94fc'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';

        let text = "";
        if (gameState === 'MENU') text = "MARIO CLONE: PRESS ENTER";
        if (gameState === 'WIN') text = "ALL LEVELS BEATEN! PRESS ENTER";
        if (gameState === 'LOSE') text = "GAME OVER! PRESS ENTER";

        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
