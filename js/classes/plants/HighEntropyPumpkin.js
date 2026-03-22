import { ItemID } from '../../items.js';
import { Plant } from './Plant.js';

class HighEntropyPumpkin extends Plant {
    constructor() {
        super();
        this.id = 'high_entropy_pumpkin';
        this.name = '高熵南瓜';
        this.growthTime = 70;
        this.seedCost = { [ItemID.SEED]: 1 };
        this.radiationIncrease = -1;
        this.locked = true;
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        const result = {};
        result[ItemID.TOKENS] = 15;
        return result;
    }
}

export { HighEntropyPumpkin };
