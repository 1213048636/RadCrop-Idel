import { game, seeds } from './config.js';
import { plantRegistry } from './classes/index.js';
import { ItemID } from './items.js';
import { addLog } from './save/saveSystem.js';
import { isTechUnlocked } from './techEffects.js';
import { updateUI, renderPlots, renderBuildings, updateSinglePlot } from './ui/render.js';
import { upgradeBuilding } from './buildings.js';

export function selectSeed(seedId) {
    game.selectedSeed = seedId;
}

export function plantPlot(plotId) {
    const plot = game.plots[plotId];
    const seedId = plot.lastSeed || game.selectedSeed;

    const plant = plantRegistry.getPlant(seedId);
    if (!plant) {
        addLog('[错误] 未知的种子类型！');
        return;
    }

    if (!plant.canPlant(game)) {
        plot.autoPlant = false;
        plot.autoHarvest = false;
        const costDesc = Object.entries(plant.seedCost)
            .map(([id, cost]) => `${cost} ${id}`)
            .join(', ');
        addLog(`[警告] ${plant.name} 缺少播种条件：${costDesc}`);
        updateUI();
        renderBuildings(upgradeBuilding);
        updateSinglePlot(plotId);
        return;
    }

    const isFree = game.buildings.plantAgent.isFreePlant();
    if (!isFree) {
        plant.consumeSeed(game);
    } else {
        addLog(`[免费] 播种 Agent 触发了免费播种！`);
    }

    const success = plot.plant(seedId);

    if (!success) {
        addLog('[警告] 该地块已有作物！');
        return;
    }

    addLog(`[成功] 在地块 ${plotId + 1} 播种了 ${plant.name}`);

    updateUI();
    renderBuildings(upgradeBuilding);
    updateSinglePlot(plotId);
}

export function harvestPlot(plotId) {
    const plot = game.plots[plotId];

    const result = plot.harvest();

    if (!result) {
        addLog('[警告] 作物尚未成熟！');
        return;
    }

    let multiplier = 1;
    if (game.buildings.harvestAgent.isDoubleHarvest()) {
        multiplier = 2;
        addLog(`[双倍] 收获 Agent 触发了双倍收获！`);
    }

    const harvest = result.harvest;
    for (const [itemId, amount] of Object.entries(harvest)) {
        const finalAmount = amount * multiplier;
        if (itemId === 'tokens') {
            game.tokens += finalAmount;
        } else if (itemId === 'energy') {
            game.inventory.energy += finalAmount;
        } else if (itemId === 'matter') {
            game.inventory.matter += finalAmount;
        } else {
            if (!game.inventory.items[itemId]) {
                game.inventory.items[itemId] = 0;
            }
            game.inventory.items[itemId] += finalAmount;
        }
    }

    const radiationIncrease = result.plant.radiationIncrease || 0;
    if (radiationIncrease !== 0) {
        game.radiation = Math.max(0, Math.min(100, game.radiation + radiationIncrease));
    }

    addLog(`[成功] 收获地块 ${plotId + 1}，获得 ${result.plant.name}`);

    updateUI();
    updateSinglePlot(plotId);
}

export function recharge() {
    game.tokens += 1;
    addLog(`[充值] 获得 1 Token`);

    updateUI();
    renderBuildings(upgradeBuilding);
}

export function emit() {
    if (game.radiation <= 0) {
        addLog(`[排放] 辐射值已经为0！`);
        return;
    }
    game.radiation = Math.max(0, game.radiation - 1);
    addLog(`[排放] 辐射值降低 1，当前 ${game.radiation.toFixed(1)}%`);

    updateUI();
    renderBuildings(upgradeBuilding);
}

export function refineEnergy() {
    if (!isTechUnlocked('energyConversion')) {
        addLog('[错误] 需要先解锁能量转化科技');
        return;
    }
    if (game.inventory.energy < 1) {
        addLog('[错误] 能量不足！');
        return;
    }
    game.inventory.energy -= 1;
    game.inventory.matter += 1;
    addLog('[提炼] 消耗 1 能量，获得 1 物质');

    updateUI();
    renderBuildings(upgradeBuilding);
}

export function clearPlot(plotId) {
    const plot = game.plots[plotId];

    const success = plot.clear();

    if (success) {
        addLog(`[成功] 清理了地块 ${plotId + 1}`);
    }
}
