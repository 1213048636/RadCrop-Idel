import { plantRegistry } from './plants/index.js';
import { ItemID } from '../items.js';

export class Plot {
    constructor(id) {
        this.id = id;
        this.seed = null;
        this.growth = 0;
        this.mature = false;
        this.autoHarvest = false;
        this.autoPlant = false;
        this.lastSeed = null;
    }

    plant(seedId) {
        if (this.seed) {
            return false;
        }
        this.seed = seedId;
        this.lastSeed = seedId;
        this.growth = 0;
        this.mature = false;
        return true;
    }

    grow(amount) {
        if (!this.seed || this.mature) {
            return false;
        }

        const plant = plantRegistry.getPlant(this.seed);
        if (!plant) {
            return false;
        }

        this.growth += amount;

        if (this.growth >= plant.growthTime) {
            this.mature = true;
        }
        return true;
    }

    harvest() {
        if (!this.mature) {
            return null;
        }

        const plant = plantRegistry.getPlant(this.seed);
        if (!plant) {
            return null;
        }

        const result = {
            seed: this.seed,
            plant: plant,
            harvest: plant.harvest({ radiation: 0 })
        };

        this.seed = null;
        this.growth = 0;
        this.mature = false;

        return result;
    }

    clear() {
        if (!this.seed) {
            return false;
        }
        this.seed = null;
        this.growth = 0;
        this.mature = false;
        return true;
    }

    getStatus() {
        if (this.mature) return 'mature';
        if (this.seed) return 'growing';
        return 'empty';
    }

    getPlant() {
        if (!this.seed) return null;
        return plantRegistry.getPlant(this.seed);
    }

    toJSON() {
        return {
            id: this.id,
            seed: this.seed,
            growth: this.growth,
            mature: this.mature,
            autoHarvest: this.autoHarvest,
            autoPlant: this.autoPlant,
            lastSeed: this.lastSeed
        };
    }

    fromJSON(data) {
        this.id = data.id;
        this.seed = data.seed;
        this.growth = data.growth;
        this.mature = data.mature;
        this.autoHarvest = data.autoHarvest || false;
        this.autoPlant = data.autoPlant || false;
        this.lastSeed = data.lastSeed || null;
        return this;
    }
}
