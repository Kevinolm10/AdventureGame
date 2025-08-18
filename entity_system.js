import { myGameArea } from "./index.js";

// Base class for all game entities
class Entity {
    constructor(x, y, width, height, imagePath) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = 100;
        this.isColliding = false;
        
        // Animation properties
        this.hFrame = 0;
        this.vFrame = 0;
        this.hFrameCount = 0;
        this.vFrameCount = 0;
        this.hFrameMax = 1;
        this.vFrameMax = 1;
        this.frameWidth = width;
        this.frameHeight = height;
        
        // Image handling
        this.image = null;
        this.isImage = false;
        if (imagePath && (imagePath.startsWith('./') || imagePath.startsWith('http'))) {
            this.image = new Image();
            this.image.onload = () => console.log(`Image loaded: ${imagePath}`);
            this.image.onerror = () => console.error(`Failed to load image: ${imagePath}`);
            this.image.src = imagePath;
            this.isImage = true;
        }
    }

    update() {
        // Base update logic - animation frames
        if (this.isImage && this.image.complete) {
            this.hFrameCount++;
            if (this.hFrameCount >= 15) { 
                this.hFrameCount = 0;
                this.hFrame++;
                if (this.hFrame >= this.hFrameMax) {
                    this.hFrame = 0;
                }
            }
        }
    }

render(context) {
    if (this.isImage && this.image.complete) {
        context.drawImage(this.image,
            this.hFrame * this.frameWidth, this.vFrame * this.frameHeight,
            this.frameWidth, this.frameHeight,
            this.x, this.y, this.width, this.height);
    }
    // Remove the fallback rectangle - don't draw anything if image isn't loaded
}

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

// Player character class
class Player extends Entity {
    constructor(x, y, width, height, imagePath) {
        super(x, y, width, height, imagePath);
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.3;
        this.gravitySpeed = 0;
        this.groundY = y;
        this.isJumping = false;
        this.isHostile = false;
    }

    update() {
        super.update(); // Call base animation logic
        
        // Player-specific physics
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
}

// Enemy base class
class Enemy extends Entity {
    constructor(x, y, width, height, imagePath) {
        super(x, y, width, height, imagePath);
        this.isHostile = true;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    update() {
        super.update();
        // Enemy AI logic goes here
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

// Keep Sprite for backward compatibility (now extends Entity)
class Sprite extends Entity {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color);
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.3;
        this.gravitySpeed = 0;
        this.groundY = y;
        this.isJumping = false;
        this.isHostile = false;
        this.color = color;
    }

    update() {
        super.update();
        
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

export { Entity, Player, Enemy, Sprite, SpriteManager, spriteManager };
