import { Plot, PrayAgent, HarvestAgent, PlantAgent, plantRegistry } from './classes/index.js';
import { ItemID } from './items.js';
import { RADIATION_HALFLIFE_FRAMES } from './systems/radiation.js';
import { techTree } from './tech.js';

export const buildingDefs = {
    prayAgent: { name: '祈祷 Agent', baseCost: 50 },
    harvestAgent: { name: '收获 Agent', baseCost: 100 },
    plantAgent: { name: '播种 Agent', baseCost: 100 }
};

export const seeds = plantRegistry.getAllPlants().map(plant => ({
    id: plant.id,
    name: plant.name,
    cost: plant.seedCost[ItemID.TOKENS] || 0
}));

export const game = {
    tokens: 0,
    radiation: 0,
    radiationHalflifeFrames: RADIATION_HALFLIFE_FRAMES,
    tps: 0,
    plots: [],
    buildings: {},
    logs: [],
    lastTick: Date.now(),
    selectedSeed: ItemID.BACTERIA,
    inventory: {},
    tech: {}
};

export function initGameState() {
    game.tokens = 0;
    game.radiation = 0;
    game.tps = 0;
    game.logs = [];
    game.lastTick = Date.now();
    game.selectedSeed = ItemID.BACTERIA;

    game.inventory = {
        energy: 0,
        maxEnergy: 100,
        matter: 0,
        maxMatter: 100,
        items: {}
    };

    game.buildings = {
        prayAgent: new PrayAgent(),
        harvestAgent: new HarvestAgent(),
        plantAgent: new PlantAgent()
    };

    game.plots = [];
    for (let i = 0; i < 4; i++) {
        game.plots.push(new Plot(i));
    }

    game.tech = {};
    for (const techId in techTree) {
        game.tech[techId] = { unlocked: false };
    }

    plantRegistry.unlockPlant('bacteria');
    plantRegistry.unlockPlant('fungi');
}

export { plantRegistry };

window.game = game;
