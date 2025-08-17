import { myGameArea } from "./index.js";

class Sprite {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.3;
        this.gravitySpeed = 0;
        this.groundY = y;
        this.isJumping = false;
        this.isRunning = false;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isColliding = false; // Flag to track collision state
        this.isHostile = false;
        this.health = 100;
        this.hFrame = 0;
        this.vFrame = 0;
        this.hFrameCount = 0;
        this.vFrameCount = 0;
        this.hFrameMax = 0;
        this.vFrameMax = 0;
        this.image = null;
        this.isImage = false;
        
        
        // Handle image loading
        if (color.startsWith('./') || color.startsWith('http')) {
            this.image = new Image();
            this.image.src = color;
            this.isImage = true;
        } else {
            this.isImage = false;
        }
    }
    update() {
        // handle rendering of specific frames from a sprite sheet
        if (this.isImage && this.image.complete) {
            if (this.hFrameCount >= this.hFrameMax) {
                this.hFrameCount = 0;
                this.hFrame++;
                if (this.hFrame >= this.hFrameMax) {
                    this.hFrame = 0;
                }
            }
        }
        if (this.isImage && this.image.complete) {
            if (this.vFrameCount >= this.vFrameMax) {
                this.vFrameCount = 0;
                this.vFrame++;
                if (this.vFrame >= this.vFrameMax) {
                    this.vFrame = 0;
                }
            }
        }
        if (this.isImage && this.image.complete) {
            this.render(myGameArea.context);
        }
        


        if (this.isJumping) {
            this.gravitySpeed += this.gravity;
            this.y += this.gravitySpeed;

            if (this.y > this.groundY) {
                this.y = this.groundY;
                this.gravitySpeed = 0;
                this.isJumping = false;
            }
        }

        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    render(context) {
        if (this.isImage && this.image.complete) {
            context.drawImage(this.image, this.hFrame * this.width, this.vFrame * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        } else {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`${this.color} took ${amount} damage. Health: ${this.health}`);
        if (this.health <= 0) {
            console.log(`${this.color} has been defeated!`);
            return true; // Return true to indicate Sprite should be removed
        }
        return false;
    }
}

class SpriteManager {
    constructor() {
        this.sprites = [];
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    removeSprite(sprite) {
        this.sprites = this.sprites.filter(s => s !== sprite);
        console.log(`${sprite.color} sprite removed from game`);
    }

    update() {
        // Reset collision flags
        this.sprites.forEach(sprite => sprite.isColliding = false);

        // Update all sprites first
        this.sprites.forEach(sprite => sprite.update());

        // Then check for collisions between all sprites
        this.checkCollisions();
        this.sprites.forEach(sprite => this.borderCollision(sprite));
    }

    checkCollisions() {
        // Check collisions between all pairs of sprites
        for (let i = 0; i < this.sprites.length; i++) {
            for (let j = i + 1; j < this.sprites.length; j++) {
                const spriteA = this.sprites[i];
                const spriteB = this.sprites[j];

                if (spriteA.checkCollision(spriteB)) {
                    this.handleCollision(spriteA, spriteB);
                }
            }
        }
    }

    

    handleCollision(spriteA, spriteB) {
        // Mark both sprites as colliding
        spriteA.isColliding = true;
        spriteB.isColliding = true;

        // Handle damage: hostile sprites deal damage to non-hostile sprites
        if (spriteA.isHostile && !spriteB.isHostile) {
            const shouldRemove = spriteB.takeDamage(10);
            if (shouldRemove) {
                this.removeSprite(spriteB);
            }
        }
        if (spriteB.isHostile && !spriteA.isHostile) {
            const shouldRemove = spriteA.takeDamage(10);
            if (shouldRemove) {
                this.removeSprite(spriteA);
            }
        }

        // Prevent sprites from overlapping by pushing them back
        spriteA.x -= spriteA.velocityX;
        spriteA.y -= spriteA.velocityY;
        spriteB.x -= spriteB.velocityX;
        spriteB.y -= spriteB.velocityY;
    }

    borderCollision(sprite) {
        if (sprite.x < 0) sprite.x = 0;
        if (sprite.x + sprite.width > myGameArea.canvas.width) {
            sprite.x = myGameArea.canvas.width - sprite.width;
        }
        if (sprite.y < 0) sprite.y = 0;
        if (sprite.y + sprite.height > myGameArea.canvas.height) {
            sprite.y = myGameArea.canvas.height - sprite.height;
        }
    }

    render(context) {
        this.sprites.forEach(sprite => sprite.render(context));
    }
}

const spriteManager = new SpriteManager();

export { Sprite, SpriteManager, spriteManager };
