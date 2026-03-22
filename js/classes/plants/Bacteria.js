import { ItemID } from '../../items.js';
import { Plant } from './Plant.js';

class Bacteria extends Plant {
    constructor() {
        super();
        this.id = ItemID.BACTERIA;
        this.name = '辐射菌';
        this.growthTime = 10;
        this.seedCost = { [ItemID.TOKENS]: 0 };
        this.radiationIncrease = 1;
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        const result = { [ItemID.TOKENS]: 1 };
        if (Math.random() < 0.1) {
            result[ItemID.SPORE] = 1;
        }
        return result;
    }
}

export { Bacteria };
