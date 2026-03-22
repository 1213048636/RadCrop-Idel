import { ItemID } from '../../items.js';
import { Plant } from './Plant.js';

class RadiumPotato extends Plant {
    constructor() {
        super();
        this.id = 'radium_potato';
        this.name = '镭射土豆';
        this.growthTime = 50;
        this.seedCost = { [ItemID.TOKENS]: 3, [ItemID.SEED]: 1 };
        this.radiationIncrease = -1;
        this.locked = true;
    }

    canGrow(gameState) {
        return true;
    }

    harvest(gameState) {
        const result = {};
        result.matter = 1;
        result.energy = 1;
        return result;
    }
}

export { RadiumPotato };
