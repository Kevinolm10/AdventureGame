

class Resources {
    constructor() {
        this.images = {};
        this.tilemaps = {};
        this.tilesets = {};
    }

    loadImages(imagePaths) {
        imagePaths.forEach(path => {
            this.images[path] = new Image();
            this.images[path].src = path;
        });
    }

    loadTilemap(name, tilemapData) {
        this.tilemaps[name] = tilemapData;
    }

    loadTileset(name, imagePath, tileWidth, tileHeight) {
        return new Promise((resolve, reject) => {
            this.tilesets[name] = {
                image: new Image(),
                tileWidth,
                tileHeight
            };
            this.tilesets[name].image.onload = () => {
                console.log(`Tileset loaded: ${name}`);
                resolve();
            };
            this.tilesets[name].image.onerror = () => {
                console.error(`Failed to load tileset: ${name} at ${imagePath}`);
                reject(new Error(`Failed to load tileset: ${name}`));
            };
            this.tilesets[name].image.src = imagePath;
        });
    }

    getImage(path) {
        return this.images[path];
    }

    getTilemap(name) {
        return this.tilemaps[name];
    }

    getTileset(name) {
        return this.tilesets[name];
    }

    // Debug method to list all loaded tilesets
    listTilesets() {
        console.log("Loaded tilesets:", Object.keys(this.tilesets));
        Object.entries(this.tilesets).forEach(([name, tileset]) => {
            console.log(`${name}: image loaded = ${tileset.image.complete}, size = ${tileset.tileWidth}x${tileset.tileHeight}`);
        });
    }

    // Draw tilemap layer
    drawTilemapLayer(context, tilemapName, layerName, offsetX = 0, offsetY = 0, scale = 3) {
        const tilemap = this.getTilemap(tilemapName);
        if (!tilemap) return;

        const layer = tilemap.layers.find(l => l.name === layerName);
        if (!layer || layer.type !== "tilelayer") return;

        const tileWidth = tilemap.tilewidth * scale;
        const tileHeight = tilemap.tileheight * scale;

        for (let i = 0; i < layer.data.length; i++) {
            const tileId = layer.data[i];
            if (tileId === 0) continue;

            const x = (i % layer.width) * tileWidth + offsetX;
            const y = Math.floor(i / layer.width) * tileHeight + offsetY;

            const tileset = this.findTilesetForTile(tilemap, tileId);
            if (tileset && tileset.image && tileset.image.complete) {
                this.drawTile(context, tileset, tileId - tileset.firstgid, x, y, tileWidth, tileHeight);
            }
        }
    }

    findTilesetForTile(tilemap, tileId) {
        for (let i = tilemap.tilesets.length - 1; i >= 0; i--) {
            const tilesetRef = tilemap.tilesets[i];
            if (tileId >= tilesetRef.firstgid) {
                const sourceName = tilesetRef.source.replace('.tsx', '');
                const loadedTileset = this.tilesets[sourceName];

                // Only log once per tileset to avoid spam
                if (!this._loggedTilesets) this._loggedTilesets = new Set();
                if (!this._loggedTilesets.has(sourceName)) {
                    console.log(`Tileset "${sourceName}": found=${!!loadedTileset}, tileId=${tileId}, firstgid=${tilesetRef.firstgid}`);
                    this._loggedTilesets.add(sourceName);
                }

                if (loadedTileset) {
                    return { ...loadedTileset, firstgid: tilesetRef.firstgid };
                } else {
                    console.warn(`Missing tileset: ${sourceName} for tile ${tileId}`);
                }
            }
        }
        return null;
    }

    drawTile(context, tileset, localTileId, x, y, tileWidth, tileHeight) {
        const tilesPerRow = Math.floor(tileset.image.width / tileset.tileWidth);
        const srcX = (localTileId % tilesPerRow) * tileset.tileWidth;
        const srcY = Math.floor(localTileId / tilesPerRow) * tileset.tileHeight;

        context.drawImage(
            tileset.image,
            srcX, srcY, tileset.tileWidth, tileset.tileHeight,
            x, y, tileWidth, tileHeight
        );
    }

    //handle collisions with different tilesets
    checkTilemapCollision(entity) {
        const tilemap = this.getTilemap("Islandmpz");
        if (!tilemap) {
            console.log("No tilemap found");
            return { collision: false };
        }

        // Account for scale - divide entity position by scale to get tilemap coordinates
        const scale = 3; // Match the scale from myGameArea
        const tileWidth = tilemap.tilewidth * scale;
        const tileHeight = tilemap.tileheight * scale;

        console.log(`Checking collision for entity at (${entity.x}, ${entity.y}) size ${entity.width}x${entity.height}`);

        const collisionLayer = tilemap.layers.find(l => l.name === "Collision");
        if (!collisionLayer || collisionLayer.type !== "tilelayer") {
            console.log("No collision layer found");
            return { collision: false };
        }

        console.log("Checking collision layer");

        const corners = [
            { x: entity.x, y: entity.y },
            { x: entity.x + entity.width, y: entity.y },
            { x: entity.x, y: entity.y + entity.height },
            { x: entity.x + entity.width, y: entity.y + entity.height }
        ];

        for (const corner of corners) {
            const tileX = Math.floor(corner.x / tileWidth);
            const tileY = Math.floor(corner.y / tileHeight);
            
            if (tileX >= 0 && tileX < collisionLayer.width && tileY >= 0 && tileY < collisionLayer.height) {
                const tileIndex = tileY * collisionLayer.width + tileX;
                const tileId = collisionLayer.data[tileIndex];
                
                console.log(`Corner (${corner.x}, ${corner.y}) -> tile (${tileX}, ${tileY}) = ID ${tileId} in collision layer`);
                
                if (tileId !== 0) {
                    console.log(`COLLISION! Collision tile: ${tileId}`);
                    return { collision: true, layer: "Collision", tileId };
                }
            }
        }

        console.log("No collision detected");
        return { collision: false };
    }

    // Check if entity can move to a specific position
    canMoveTo(entity, newX, newY) {
        const tempEntity = { 
            x: newX, 
            y: newY, 
            width: entity.width, 
            height: entity.height 
        };
        
        const collision = this.checkTilemapCollision(tempEntity);
        return !collision.collision;
    }
}

const resources = new Resources();
export { resources };
