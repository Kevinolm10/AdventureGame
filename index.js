import { Player, Enemy, spriteManager } from "./entity_system.js";
import { movement } from "./player_controller.js";

let myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = window.innerWidth - 100;
        this.canvas.height = window.innerHeight - 100;
        this.canvas.classList.add("game-canvas");
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth - 100;
            this.canvas.height = window.innerHeight - 100;
        });
    }
}

let mainCharacter;
let greenGoblin;
let keys;

function update() {
    // Only continue if game is running
    if (!gameRunning) return;

    myGameArea.context.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);

    // Check if player is dead
    if (mainCharacter && mainCharacter.health <= 0) {
        endGame(false); // Player lost
        return;
    }

    // Update player movement based on keys
    if (mainCharacter && keys) {
        updateSpeed();
    }

    spriteManager.update();
    spriteManager.render(myGameArea.context);
    requestAnimationFrame(update);
}

function updateSpeed() {
    let runMultiplier = keys["ShiftLeft"] || keys["ShiftRight"] ? 2 : 1;

    // Reset velocity
    mainCharacter.velocityX = 0;
    mainCharacter.velocityY = 0;

    // Calculate intended movement
    let intendedVelocityX = 0;
    let intendedVelocityY = 0;

    if (keys["a"] || keys["ArrowLeft"])
        intendedVelocityX = -2 * runMultiplier;
        
    if (keys["d"] || keys["ArrowRight"])
        intendedVelocityX = 2 * runMultiplier;
    if (keys["w"] || keys["ArrowUp"])
        intendedVelocityY = -2 * runMultiplier;
    if (keys["s"] || keys["ArrowDown"])
        intendedVelocityY = 2 * runMultiplier;

    // If colliding, only allow movement that would separate from ALL colliding sprites
    if (mainCharacter.isColliding) {
        let canMoveX = true;
        let canMoveY = true;

        // Check against all sprites to see if movement would separate from them
        spriteManager.sprites.forEach(sprite => {
            if (sprite !== mainCharacter && mainCharacter.checkCollision(sprite)) {
                const deltaX = mainCharacter.x - sprite.x;
                const deltaY = mainCharacter.y - sprite.y;

                // Block movement that would move closer to this sprite
                if ((intendedVelocityX > 0 && deltaX <= 0) || (intendedVelocityX < 0 && deltaX >= 0)) {
                    canMoveX = false;
                }
                if ((intendedVelocityY > 0 && deltaY <= 0) || (intendedVelocityY < 0 && deltaY >= 0)) {
                    canMoveY = false;
                }
            }
        });

        // Only apply movement if it's allowed
        if (canMoveX) {
            mainCharacter.velocityX = intendedVelocityX;
        }
        if (canMoveY) {
            mainCharacter.velocityY = intendedVelocityY;
        }
    } else {
        // Normal movement when not colliding
        mainCharacter.velocityX = intendedVelocityX;
        mainCharacter.velocityY = intendedVelocityY;
    }

    if (keys[" "] && !mainCharacter.isJumping) {
        mainCharacter.gravitySpeed = -7;
        mainCharacter.isJumping = true;
        mainCharacter.groundY = mainCharacter.y;
    }
}

function spawnSprites() {
    mainCharacter = new Player(100, 100, 50, 50, "./assets/enteties/idle/idle_down-Sheet.png");
    mainCharacter.hFrameMax = 4;
    mainCharacter.vFrameMax = 1;

    // Example enemy
    greenGoblin = new Enemy(200, 200, 50, 50, "./assets/enemies/goblin.png");

    spriteManager.addSprite(mainCharacter);
    spriteManager.addSprite(greenGoblin);
}

function startMenu() {
    // Create a menu container that overlays the canvas
    let menuContainer = document.createElement("div");
    menuContainer.id = "start-menu";

    let startTitle = document.createElement("h1");
    let startButton = document.createElement("button");
    let optionsButton = document.createElement("button");
    let exitButton = document.createElement("button");

    // Title
    startTitle.innerText = "Game Menu";
    startTitle.classList.add("start-title");
    menuContainer.appendChild(startTitle);

    // Start button
    startButton.innerText = "Start Game";
    startButton.classList.add("start-button");
    menuContainer.appendChild(startButton);
    startButton.addEventListener("click", () => {
        // Remove the menu and start the game
        document.body.removeChild(menuContainer);
        startGame();
    });

    // Options button
    optionsButton.innerText = "Options";
    optionsButton.classList.add("options-button");
    menuContainer.appendChild(optionsButton);
    optionsButton.addEventListener("click", () => {
        console.log("Options button clicked");
    });

    // Exit button
    exitButton.innerText = "Exit";
    exitButton.classList.add("exit-button");
    menuContainer.appendChild(exitButton);
    exitButton.addEventListener("click", () => {
        console.log("Exit button clicked");
        // You could close the window or redirect
        window.close();
    });

    // Add the menu container to the body
    document.body.appendChild(menuContainer);
}

let gameRunning = false;

function endGame(playerWon = false) {
    // Stop the game loop
    gameRunning = false;

    // Create an end game container that overlays the canvas
    let endGameContainer = document.createElement("div");
    endGameContainer.id = "end-game-menu";

    // Create title
    let title = document.createElement("h1");
    title.classList.add("end-game-title");

    // Create message
    let message = document.createElement("p");
    message.classList.add("end-game-message");

    // Create buttons
    let restartButton = document.createElement("button");
    let menuButton = document.createElement("button");

    if (playerWon) {
        title.innerText = "Victory!";
        message.innerText = "Congratulations! You defeated all enemies!";
        title.style.color = "#4CAF50";
    } else {
        title.innerText = "Game Over";
        message.innerText = `You were defeated! Final Health: ${mainCharacter ? mainCharacter.health : 0}`;
        title.style.color = "#f44336";
    }

    // Restart button
    restartButton.innerText = "Play Again";
    restartButton.classList.add("restart-button");
    restartButton.addEventListener("click", () => {
        document.body.removeChild(endGameContainer);
        restartGame();
    });

    // Menu button
    menuButton.innerText = "Main Menu";
    menuButton.classList.add("menu-button");
    menuButton.addEventListener("click", () => {
        document.body.removeChild(endGameContainer);
        startMenu();
    });

    // Append elements
    endGameContainer.appendChild(title);
    endGameContainer.appendChild(message);
    endGameContainer.appendChild(restartButton);
    endGameContainer.appendChild(menuButton);

    document.body.appendChild(endGameContainer);
}

function restartGame() {
    // Clear existing sprites
    spriteManager.sprites = [];

    // Reset game state
    mainCharacter = null;
    greenGoblin = null;

    // Start fresh game
    startGame();
}

function startGame() {
    gameRunning = true; // Start the game loop
    myGameArea.start();
    keys = movement(); // Get the keys object from movement function
    spawnSprites();
    update();
}

function gameLoop() {
    // Show the start menu first
    startMenu();
}

gameLoop();

export { gameLoop, updateSpeed, spawnSprites, mainCharacter, greenGoblin, keys, myGameArea };
