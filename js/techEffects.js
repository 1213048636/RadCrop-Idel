import { game } from './config.js';
import { techTree, getTech } from './tech.js';
import { plantRegistry } from './classes/plants/index.js';
import { ItemID } from './items.js';
import { Plot } from './classes/Plot.js';
import { addLog, saveGame } from './save/saveSystem.js';

export function isTechUnlocked(techId) {
    return game.tech[techId] && game.tech[techId].unlocked;
}

export function unlockTech(techId) {
    const tech = getTech(techId);
    if (!tech) return false;
    if (isTechUnlocked(techId)) return false;

    if (!checkTechCondition(tech)) return false;

    if (!consumeTechCost(tech)) return false;

    if (!game.tech[techId]) {
        game.tech[techId] = { unlocked: false };
    }
    game.tech[techId].unlocked = true;

    applyTechEffect(tech);

    setTimeout(() => saveGame(false), 0);

    return true;
}

function checkRequires(tech) {
    if (!tech.requires) return true;
    return isTechUnlocked(tech.requires);
}

export function checkTechCondition(tech) {
    if (!checkRequires(tech)) return false;

    if (!tech.condition) return true;

    if (tech.condition.radiationMin !== undefined) {
        if (game.radiation < tech.condition.radiationMin) {
            return false;
        }
    }

    return true;
}

export function consumeTechCost(tech) {
    if (!tech.cost) return true;

    for (const [itemId, amount] of Object.entries(tech.cost)) {
        if (itemId === 'tokens') {
            if (game.tokens < amount) return false;
        } else if (itemId === 'energy') {
            if (game.inventory.energy < amount) return false;
        } else if (itemId === 'matter') {
            if (game.inventory.matter < amount) return false;
        } else {
            if ((game.inventory.items[itemId] || 0) < amount) return false;
        }
    }

    for (const [itemId, amount] of Object.entries(tech.cost)) {
        if (itemId === 'tokens') {
            game.tokens -= amount;
        } else if (itemId === 'energy') {
            game.inventory.energy -= amount;
        } else if (itemId === 'matter') {
            game.inventory.matter -= amount;
        } else {
            game.inventory.items[itemId] -= amount;
        }
    }

    return true;
}

export function applyTechEffect(tech) {
    const effect = tech.effect;
    if (!effect) return;

    switch (effect.type) {
        case 'unlockPlant':
            plantRegistry.unlockPlant(effect.plantId);
            addLog(`[科技] 解锁植物：${effect.plantId}`);
            break;

        case 'conversion':
            addLog(`[科技] 解锁资源转化：${effect.from} -> ${effect.to}，比率 ${effect.rate}`);
            break;

        case 'autoPray':
            addLog(`[科技] 解锁自动祈祷：${effect.rate} 次/秒`);
            break;

        case 'prayerMultiplier':
            addLog(`[科技] 祈祷增幅：+${effect.bonus * 100}%`);
            break;

        case 'unlockPlots':
            addLog(`[科技] 解锁额外地块（将在下一帧生效）`);
            break;

        default:
            addLog(`[科技] 未知效果类型：${effect.type}`);
    }
}

export function getTechStatus(techId) {
    const tech = getTech(techId);
    if (!tech) return null;

    const state = game.tech[techId] || { unlocked: false };
    const requiresMet = checkRequires(tech);
    const conditionMet = checkTechCondition(tech);

    const costStatus = {};
    let canAfford = true;
    if (tech.cost) {
        for (const [itemId, amount] of Object.entries(tech.cost)) {
            let current;
            if (itemId === 'tokens') {
                current = game.tokens;
            } else if (itemId === 'energy') {
                current = game.inventory.energy;
            } else if (itemId === 'matter') {
                current = game.inventory.matter;
            } else {
                current = game.inventory.items[itemId] || 0;
            }
            costStatus[itemId] = { current, required: amount, affordable: current >= amount };
            if (current < amount) canAfford = false;
        }
    }

    return {
        unlocked: state.unlocked,
        requiresMet,
        conditionMet,
        canUnlock: !state.unlocked && requiresMet && conditionMet && canAfford,
        costStatus
    };
}

export function convertEnergyToTokens() {
    if (!isTechUnlocked('energyConversion')) return 0;

    const tech = getTech('energyConversion');
    const rate = tech.effect.rate;

    if (game.inventory.energy < 1) return 0;

    game.inventory.energy -= 1;
    game.tokens += rate;

    return rate;
}

export function refineMatterToTokens() {
    if (!isTechUnlocked('matterRefining')) return 0;

    const tech = getTech('matterRefining');
    const rate = tech.effect.rate;

    if (game.inventory.matter < 1) return 0;

    game.inventory.matter -= 1;
    game.tokens += rate;

    return rate;
}

export function getPrayerMultiplier() {
    let multiplier = 1;
    if (isTechUnlocked('prayerBoost')) {
        const tech = getTech('prayerBoost');
        multiplier += tech.effect.bonus;
    }
    return multiplier;
}

export function getMaxPlots() {
    let base = 4;
    if (isTechUnlocked('plotExpansion')) {
        const tech = getTech('plotExpansion');
        base += tech.effect.count;
    }
    return base;
}
