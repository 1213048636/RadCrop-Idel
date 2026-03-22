import { ItemID } from '../../items.js';
import { Plant } from './Plant.js';

class SporeFlower extends Plant {
    constructor() {
        super();
        this.id = ItemID.SPORE_FLOWER;
        this.name = '孢子花';
        this.growthTime = 25;
        this.seedCost = { [ItemID.TOKENS]: 2, [ItemID.SPORE]: 1 };
        this.radiationIncrease = 2;
        this.locked = true;
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        const result = {};
        result[ItemID.SPORE] = 2;
        if (Math.random() < 0.6) {
            result[ItemID.SPORE] += 1;
        }
        if (Math.random() < 0.5) {
            result[ItemID.SEED] = 1;
        }
        return result;
    }
}

export { SporeFlower };
