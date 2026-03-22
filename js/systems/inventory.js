import { game } from '../config.js';

export function initInventory() {
    game.inventory = {
        water: 100,
        maxWater: 100,
        energy: 0,
        maxEnergy: 100,
        materials: 0,
        maxMaterials: 100,
        crops: {}
    };
}

export function addCrop(cropId, amount) {
    if (!game.inventory.crops[cropId]) {
        game.inventory.crops[cropId] = 0;
    }
    game.inventory.crops[cropId] += amount;
}

export function removeCrop(cropId, amount) {
    if (!game.inventory.crops[cropId]) {
        return false;
    }
    
    if (game.inventory.crops[cropId] < amount) {
        return false;
    }
    
    game.inventory.crops[cropId] -= amount;
    return true;
}

export function getCropCount(cropId) {
    return game.inventory.crops[cropId] || 0;
}

export function consumeResource(resource, amount) {
    if (game.inventory[resource] < amount) {
        return false;
    }
    game.inventory[resource] -= amount;
    return true;
}

export function addResource(resource, amount, max = null) {
    const currentMax = max || game.inventory[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}`];
    game.inventory[resource] = Math.min(currentMax, game.inventory[resource] + amount);
}
