import { Player, Enemy, spriteManager } from "./entity_system.js";
import { movement } from "./player_controller.js";
import { resources } from "./resources.js";
// Remove the import and load it differently


async function initializeResources() {
    try {
        console.log("Attempting to fetch tilemap...");
        const response = await fetch('./assets/map/Islandmpz..tmj');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const IslandmapData = await response.json();
        
        resources.loadTilemap("Islandmpz", IslandmapData);
        console.log("Tilemap loaded successfully:", IslandmapData);
        
        // Load tilesets with correct tile sizes based on image dimensions
        await Promise.all([
            resources.loadTileset("Water_tiles", "./assets/Tilesets/Water_tiles.png", 16, 16),
            resources.loadTileset("Size_02", "./assets/props/Props/Static/Trees/Model_01/Size_02.png", 16, 16),
            resources.loadTileset("Rocks", "./assets/props/Props/Static/Rocks.png", 16, 16),
            resources.loadTileset("Shadows", "./assets/props/Props/Static/Shadows.png", 16, 16),
            resources.loadTileset("Bonfire", "./assets/props/Props/Bonfire/Bonfire.png", 16, 24),
            resources.loadTileset("Fire_02-Sheet", "./assets/props/Props/Bonfire/Fire_02-Sheet.png", 16, 16),
            resources.loadTileset("Dungeon_Tiles", "./assets/Tilesets/Dungeon_Tiles.png", 16, 16)
        ]);

        console.log("All tilesets loaded successfully");
        resources.listTilesets(); // Debug: show loaded tilesets
        console.log("Tilemap loaded successfully");
        console.log("Available layers:", IslandmapData.layers.map(l => l.name));
    } catch (error) {
        console.error("Failed to load tilemap:", error);
    }
}

let myGameArea = {
    canvas: document.createElement("canvas"),
    scale: 3, // Scale factor for everything
    start: function () {
        this.canvas.width = window.innerWidth - 100;
        this.canvas.height = window.innerHeight - 100;
        this.canvas.classList.add("game-canvas");
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false; // Keep pixel art crisp
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
    if (!gameRunning) return;

    myGameArea.context.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height);

    const scale = myGameArea.scale;
    // Draw tilemap layers with scale
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "grassEdges + waves", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "grass", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "water", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "tree", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "rocks", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "shadows", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "bonfire", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "bridge", 0, 0, scale);
    resources.drawTilemapLayer(myGameArea.context, "Islandmpz", "fire", 0, 0, scale);

    // Check if player is dead
    if (mainCharacter && mainCharacter.health <= 0) {
        endGame(false);
        return;
    }

    // Update player movement
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

    if (keys["a"] || keys["ArrowLeft"]) {
        intendedVelocityX = -0.5 * runMultiplier;
        if (!mainCharacter.image.src.includes("Walk_Side-Sheet.png")) {
            mainCharacter.image.src = "./assets/enteties/walk/Walk_Left-Sheet.png";
            mainCharacter.hFrameMax = 6;
            mainCharacter.vFrameMax = 1;
            mainCharacter.frameWidth = 64;
            mainCharacter.frameHeight = 64;
        }
    }
    if (keys["d"] || keys["ArrowRight"]) {
        intendedVelocityX = 0.5 * runMultiplier;
        if (!mainCharacter.image.src.includes("Walk_Side-Sheet.png")) {
            mainCharacter.image.src = "./assets/enteties/walk/Walk_Right-Sheet.png";
            mainCharacter.hFrameMax = 6;
            mainCharacter.vFrameMax = 1;
            mainCharacter.frameWidth = 64;
            mainCharacter.frameHeight = 64;
        }
    }
    if (keys["w"] || keys["ArrowUp"]) {
        intendedVelocityY = -0.5 * runMultiplier;
        if (!mainCharacter.image.src.includes("Walk_Up-Sheet.png")) {
            mainCharacter.image.src = "./assets/enteties/walk/Walk_Up-Sheet.png";
            mainCharacter.hFrameMax = 6;
            mainCharacter.vFrameMax = 1;
            mainCharacter.frameWidth = 64;
            mainCharacter.frameHeight = 64;
        }
    }
    if (keys["s"] || keys["ArrowDown"]) {
        intendedVelocityY = 0.5 * runMultiplier;
        if (!mainCharacter.image.src.includes("Walk_Down-Sheet.png")) {
            mainCharacter.image.src = "./assets/enteties/walk/Walk_Down-Sheet.png";
            mainCharacter.hFrameMax = 6;
            mainCharacter.vFrameMax = 1;
            mainCharacter.frameWidth = 64;
            mainCharacter.frameHeight = 64;
        }
    }

    // Set idle animation when not moving
    if (intendedVelocityX === 0 && intendedVelocityY === 0) {
        if (!mainCharacter.image.src.includes("idle_down-Sheet.png")) {
            mainCharacter.image.src = "./assets/enteties/idle/idle_down-Sheet.png";
            mainCharacter.hFrameMax = 4;
            mainCharacter.vFrameMax = 1;
            mainCharacter.frameWidth = 64;
            mainCharacter.frameHeight = 64;
        }
    }

    // Check tilemap collision before moving
    const newX = mainCharacter.x + intendedVelocityX;
    const newY = mainCharacter.y + intendedVelocityY;

    // Check X movement
    if (intendedVelocityX !== 0) {
        const canMoveX = resources.canMoveTo(mainCharacter, newX, mainCharacter.y);
        console.log(`Can move X from ${mainCharacter.x} to ${newX}:`, canMoveX);
        if (canMoveX) {
            mainCharacter.velocityX = intendedVelocityX;
        }
    }

    // Check Y movement  
    if (intendedVelocityY !== 0) {
        const canMoveY = resources.canMoveTo(mainCharacter, mainCharacter.x, newY);
        console.log(`Can move Y from ${mainCharacter.y} to ${newY}:`, canMoveY);
        if (canMoveY) {
            mainCharacter.velocityY = intendedVelocityY;
        }
    }

    if (keys[" "] && !mainCharacter.isJumping) {
        mainCharacter.gravitySpeed = -7;
        mainCharacter.isJumping = true;
        mainCharacter.groundY = mainCharacter.y;
    }
}

function spawnSprites() {
    const scale = myGameArea.scale;
    mainCharacter = new Player(130 * scale, 150 * scale, 16 * scale, 16 * scale, "./assets/enteties/idle/idle_down-Sheet.png");
    mainCharacter.hFrameMax = 4;
    mainCharacter.vFrameMax = 1;
    mainCharacter.frameWidth = 64;
    mainCharacter.frameHeight = 64;

    greenGoblin = new Enemy(200 * scale, 200 * scale, 16 * scale, 16 * scale, "./assets/enteties/enemies/skeleton-idle/Idle-Sheet.png");
    greenGoblin.hFrameMax = 4;
    greenGoblin.vFrameMax = 1;
    greenGoblin.frameWidth = 32;
    greenGoblin.frameHeight = 32;

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

async function startGame() {
    gameRunning = true;
    myGameArea.start();
    await initializeResources(); // Wait for resources to load
    keys = movement();
    spawnSprites();
    update();
}

function gameLoop() {
    // Show the start menu first
    startMenu();
}

gameLoop();

export { gameLoop, updateSpeed, spawnSprites, mainCharacter, greenGoblin, keys, myGameArea };
