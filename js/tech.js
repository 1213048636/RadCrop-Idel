import { ItemID } from './items.js';

export const TechCategory = {
    AGRI: 'agri',
    INDUSTRY: 'industry',
    GENE: 'gene',
    CULTURE: 'culture'
};

export const techTree = {
    sporeFlower: {
        id: 'sporeFlower',
        name: '孢子花',
        description: '解锁孢子花种植，可获得孢子和种子',
        category: TechCategory.AGRI,
        cost: { [ItemID.SPORE]: 200, [ItemID.TOKENS]: 800 },
        costType: 'consume',
        requires: null,
        effect: { type: 'unlockPlant', plantId: 'spore_flower' }
    },
    radiumPotato: {
        id: 'radiumPotato',
        name: '镭射土豆',
        description: '解锁镭射土豆种植，收获可减少辐射',
        category: TechCategory.AGRI,
        cost: { [ItemID.TOKENS]: 2000 },
        condition: { radiationMin: 80 },
        costType: 'consume',
        requires: 'sporeFlower',
        effect: { type: 'unlockPlant', plantId: 'radium_potato' }
    },

    highEntropyPumpkin: {
        id: 'highEntropyPumpkin',
        name: '高熵南瓜',
        description: '解锁高熵南瓜种植，收获巨量Token',
        category: TechCategory.AGRI,
        cost: { 'energy': 100 },
        costType: 'consume',
        requires: 'radiumPotato',
        effect: { type: 'unlockPlant', plantId: 'high_entropy_pumpkin' }
    },

    energyConversion: {
        id: 'energyConversion',
        name: '能量转化',
        description: '解锁能量转化装置，消耗能量获得Token',
        category: TechCategory.INDUSTRY,
        cost: { 'energy': 100 },
        costType: 'consume',
        requires: null,
        effect: { type: 'conversion', from: 'energy', to: 'tokens', rate: 10 }
    },
    matterRefining: {
        id: 'matterRefining',
        name: '物质提炼',
        description: '解锁物质提炼装置，消耗物质获得Token',
        category: TechCategory.INDUSTRY,
        cost: { 'matter': 50 },
        costType: 'consume',
        requires: 'energyConversion',
        effect: { type: 'conversion', from: 'matter', to: 'tokens', rate: 50 }
    },
    plotExpansion: {
        id: 'plotExpansion',
        name: '地块拓展',
        description: '增加2块地块（共6块）',
        category: TechCategory.INDUSTRY,
        cost: { [ItemID.TOKENS]: 5000 },
        costType: 'consume',
        requires: null,
        effect: { type: 'unlockPlots', count: 2 }
    },
};

export function getAllTechs() {
    return Object.values(techTree);
}

export function getTechsByCategory(category) {
    return Object.values(techTree).filter(t => t.category === category);
}

export function getTech(id) {
    return techTree[id] || null;
}
