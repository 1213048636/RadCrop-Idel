import { ItemID } from '../../items.js';

class Plant {
    id = '';
    name = '';
    growthTime = 10;
    seedCost = {};
    radiationIncrease = 0;
    locked = false;

    canPlant(gameState) {
        for (const [itemId, cost] of Object.entries(this.seedCost)) {
            if (itemId === ItemID.TOKENS) {
                if (gameState.tokens < cost) {
                    return false;
                }
            } else {
                const has = gameState.inventory.items[itemId] || 0;
                if (has < cost) {
                    return false;
                }
            }
        }
        return true;
    }

    consumeSeed(gameState) {
        for (const [itemId, cost] of Object.entries(this.seedCost)) {
            if (itemId === ItemID.TOKENS) {
                gameState.tokens -= cost;
            } else {
                gameState.inventory.items[itemId] -= cost;
            }
        }
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        return { [ItemID.TOKENS]: 0 };
    }
}

export { Plant };
