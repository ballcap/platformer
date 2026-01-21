export class Level {
    constructor(levelConfig) {
        this.tileSize = levelConfig.tileSize;
        this.timeLeft = levelConfig.timer;
        this.score = 0;

        this.platforms = [];
        this.coins = [];
        this.goal = null;
        this.playerStartX = 0;
        this.playerStartY = 0;

        // Parse the grid
        levelConfig.grid.forEach((row, rowIndex) => {
            [...row].forEach((char, colIndex) => {
                const x = colIndex * this.tileSize;
                const y = rowIndex * this.tileSize;

                if (char === "#") {
                    this.platforms.push({ x, y, w: this.tileSize, h: this.tileSize });
                } else if (char === "C") {
                    this.coins.push({ x: x + 16, y: y + 16, collected: false });
                } else if (char === "G") {
                    // Setting h to this.tileSize * 2 (64px) ensures it is a 2-tile high target
                    this.goal = { x, y, w: this.tileSize, h: this.tileSize * 2 };
                } else if (char === "P") {
                    this.playerStartX = x;
                    this.playerStartY = y;
                }
            });
        });

        // Asset Loading (Previous code)
        //sky
        this.skyImage = new Image();
        this.skyImage.src = './assets/sky_bg.png';
        //ground
        this.groundImage = new Image();
        this.groundImage.src = './assets/ground_tileset.png';
        //coins
        this.coinHeight = 32;
        this.coinWidth = 32;
        this.totalCoinFrames = 4;
        this.coinImage = new Image();
        this.coinImage.src = './assets/coin_spritesheet.png';
        //goal
        this.goalImage = new Image();
        this.goalImage.src = './assets/end_goal.png';
        this.goalWidth = 32;
        this.goalHeight = 32;
        this.totalGoalFrames = 6;

        this.gameFrame = 0;
        this.staggerFrames = 8;
    }

    update(deltaTime) {
        this.gameFrame++;
        this.timeLeft -= deltaTime;
        return this.timeLeft <= 0;
    }

    draw(ctx, cameraX) {
        // Draw Skybox (looping logic from previous step)
        const skyX = -(cameraX * 0.125) % this.skyImage.width;
        ctx.drawImage(this.skyImage, skyX, 0);
        ctx.drawImage(this.skyImage, skyX + this.skyImage.width, 0);

        // Draw Platforms (Tiles)
        this.platforms.forEach(p => {
            ctx.drawImage(this.groundImage, 0, 0, 32, 32, p.x - cameraX, p.y, p.w, p.h);
        });

        // --- Updated Coin Animation Logic ---
        // Cycle through 4 frames (0, 1, 2, 3)
        let coinFrameIndex = Math.floor(this.gameFrame / this.staggerFrames) % this.totalCoinFrames;
        let coinSourceX = coinFrameIndex * this.coinWidth;

        this.coins.forEach(c => {
            if (!c.collected) {
                ctx.drawImage(
                    this.coinImage,
                    coinSourceX, 0,           // Source X (0, 32, 64, or 96), Source Y
                    this.coinWidth, this.coinHeight, // Source W, H (32x32)
                    c.x - cameraX - 16, c.y - 16,    // Destination X, Y (Centered)
                    this.coinWidth, this.coinHeight  // Destination W, H
                );
            }
        });

        // Draw Goal
        if (this.goal) {
            const totalSteps = (this.totalGoalFrames * 2) - 2;
            const cycleIndex = Math.floor(this.gameFrame / this.staggerFrames) % totalSteps;

            // 2. Use "Ping-Pong" logic to determine the actual frame column
            let goalFrame;
            if (cycleIndex < this.totalGoalFrames) {
                goalFrame = cycleIndex; // 0, 1, 2, 3, 4, 5
            } else {
                goalFrame = totalSteps - cycleIndex; // 4, 3, 2, 1
            }

            const goalSourceX = goalFrame * this.goalWidth;

            // 3. Draw the animated goal (drawing 2 tiles high as before)
            ctx.drawImage(
                this.goalImage,
                goalSourceX, 0, this.goalWidth, this.goalHeight, // Source
                this.goal.x - cameraX, this.goal.y,              // Destination
                this.goal.w, this.goal.h                         // Size (32x64)
            );
        }
    }

    drawUI(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText(`SCORE: ${this.score}`, 20, 40);
        ctx.fillText(`TIME: ${Math.ceil(this.timeLeft)}`, ctx.canvas.width - 120, 40);
    }
}
