export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velX = 0;
        this.velY = 0;
        this.speed = 4;
        this.jumpForce = 12;
        this.gravity = .6;
        this.onGround = false;

        this.image = new Image();
        this.image.src = './assets/player_spritesheet.png';

        this.facing = 'right';

        // Animation properties
        this.gameFrame = 0;
        this.staggerFrames = 8; // Adjust this number to slow down/speed up animation
        this.spriteWidth = 32;
        this.spriteHeight = 32;
    }

    update(input, platforms) {
        // 1. INPUT & VELOCITY
        if (this.onGround) {
            if (input.isPressed('ArrowRight')) {
                this.velX = this.speed;
                this.facing = 'right';
            } else if (input.isPressed('ArrowLeft')) {
                this.velX = -this.speed;
                this.facing = 'left';
            } else {
                this.velX *= 0.8;
            }

            if ((input.isPressed('ArrowUp') || input.isPressed('Space'))) {
                this.velY = -this.jumpForce;
                this.onGround = false;
            }
        }

        this.velY += this.gravity;

        // 2. HORIZONTAL MOVEMENT & COLLISION
        this.x += this.velX; // Move on X first
        platforms.forEach(p => {
            if (this.checkCollision(this, p)) {
                if (this.velX > 0) this.x = p.x - this.width; // Hit wall on right
                if (this.velX < 0) this.x = p.x + p.w;        // Hit wall on left
                this.velX = 0;
            }
        });

        // 3. VERTICAL MOVEMENT & COLLISION
        this.onGround = false;
        this.y += this.velY; // Move on Y second
        platforms.forEach(p => {
            if (this.checkCollision(this, p)) {
                if (this.velY > 0) { // Falling onto floor
                    this.y = p.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                } else if (this.velY < 0) { // Hitting ceiling
                    this.y = p.y + p.h;
                    this.velY = 0;
                }
            }
        });

        // 4. ANIMATION STATE
        if (this.onGround && Math.abs(this.velX) > 0.5) {
            this.gameFrame++;
        } else {
            this.gameFrame = this.staggerFrames;
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.y + rect1.height > rect2.y;
    }

    draw(ctx, cameraX) {
        ctx.save();

        if (this.facing === 'left') {
            ctx.translate(this.x - cameraX + this.width / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(this.x - cameraX + this.width / 2), 0);
        }

        // Calculate which frame (0 or 1) to show based on gameFrame and staggerFrames
        let frameIndex = Math.floor(this.gameFrame / this.staggerFrames) % 2; // % 2 ensures it cycles between frame 0 and 1
        let sourceX = frameIndex * this.spriteWidth;

        // Draw the current frame
        ctx.drawImage(
            this.image,
            sourceX, 0,                             // Source X, Y (Y is always 0)
            this.spriteWidth, this.spriteHeight,
            this.x - cameraX, this.y,               // Destination X, Y
            this.width, this.height                 // Destination W, H
        );

        ctx.restore();
    }
}
