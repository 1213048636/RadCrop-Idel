import { ItemID } from '../../items.js';
import { Plant } from './Plant.js';

class Fungi extends Plant {
    constructor() {
        super();
        this.id = ItemID.FUNGI;
        this.name = '辐射真菌';
        this.growthTime = 20;
        this.seedCost = {
            [ItemID.TOKENS]: 1,
            [ItemID.SPORE]: 1
        };
        this.radiationIncrease = 1;
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        const result = { [ItemID.TOKENS]: 3 };
        if (Math.random() < 0.5) {
            result[ItemID.SPORE] = 1;
        }
        return result;
    }
}

export { Fungi };
