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
        this.tilesets[name] = {
            image: new Image(),
            tileWidth,
            tileHeight
        };
        this.tilesets[name].image.src = imagePath;
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

    // Draw tilemap layer
    drawTilemapLayer(context, tilemapName, layerName, offsetX = 0, offsetY = 0) {
        const tilemap = this.getTilemap(tilemapName);
        if (!tilemap) return;

        const layer = tilemap.layers.find(l => l.name === layerName);
        if (!layer || layer.type !== "tilelayer") return;

        const tileWidth = tilemap.tilewidth;
        const tileHeight = tilemap.tileheight;

        for (let i = 0; i < layer.data.length; i++) {
            const tileId = layer.data[i];
            if (tileId === 0) continue; // Empty tile

            const x = (i % layer.width) * tileWidth + offsetX;
            const y = Math.floor(i / layer.width) * tileHeight + offsetY;

            // Find correct tileset for this tile
            const tileset = this.findTilesetForTile(tilemap, tileId);
            if (tileset && tileset.image.complete) {
                this.drawTile(context, tileset, tileId - tileset.firstgid, x, y, tileWidth, tileHeight);
            }
        }
    }

    findTilesetForTile(tilemap, tileId) {
        for (let i = tilemap.tilesets.length - 1; i >= 0; i--) {
            const tilesetRef = tilemap.tilesets[i];
            if (tileId >= tilesetRef.firstgid) {
                return this.tilesets[tilesetRef.source] || tilesetRef;
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
}

const resources = new Resources();
export { resources };
