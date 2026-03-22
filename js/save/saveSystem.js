import { game, initGameState, plantRegistry } from '../config.js';
import { Plot } from '../classes/Plot.js';
import { PrayAgent, HarvestAgent, PlantAgent } from '../classes/index.js';
import { techTree } from '../tech.js';
import { applyTechEffect } from '../techEffects.js';

const SAVE_KEY = 'radcrop_save';

export function saveGame(showLog = true) {
    try {
        const saveData = exportGameData();
        const compressed = btoa(encodeURIComponent(JSON.stringify(saveData)));
        localStorage.setItem(SAVE_KEY, compressed);
        if (showLog) {
            addLog('[存档] 游戏已保存');
        }
        return saveData;
    } catch (e) {
        console.error('Save failed:', e);
        if (showLog) {
            addLog('[错误] 保存失败');
        }
        return null;
    }
}

function exportGameData() {
    return {
        tokens: game.tokens,
        radiation: game.radiation,
        radiationHalflifeFrames: game.radiationHalflifeFrames,
        selectedSeed: game.selectedSeed,
        inventory: {
            energy: game.inventory.energy,
            maxEnergy: game.inventory.maxEnergy,
            matter: game.inventory.matter,
            maxMatter: game.inventory.maxMatter,
            items: game.inventory.items || {}
        },
        plots: game.plots.map(plot => plot.toJSON ? plot.toJSON() : {
            id: plot.id,
            seed: plot.seed,
            growth: plot.growth,
            mature: plot.mature,
            autoHarvest: plot.autoHarvest,
            autoPlant: plot.autoPlant,
            lastSeed: plot.lastSeed
        }),
        buildings: {
            prayAgent: { level: game.buildings.prayAgent.level },
            harvestAgent: { level: game.buildings.harvestAgent.level },
            plantAgent: { level: game.buildings.plantAgent.level }
        },
        tech: game.tech,
        stats: {
            tps: game.tps || 0
        },
        timestamp: Date.now()
    };
}

export function loadGame(showLog = true) {
    const compressed = localStorage.getItem(SAVE_KEY);
    if (!compressed) return false;

    try {
        const jsonStr = decodeURIComponent(atob(compressed));
        const saveData = JSON.parse(jsonStr);
        importGameData(saveData);
        if (showLog) {
            addLog('[成功] 游戏已加载');
        }
        return true;
    } catch (e) {
        console.error('Load failed:', e);
        if (showLog) {
            addLog('[错误] 加载存档失败');
        }
        return false;
    }
}

function importGameData(saveData) {
    game.tokens = saveData.tokens || 0;
    game.radiation = saveData.radiation || 0;
    game.radiationHalflifeFrames = saveData.radiationHalflifeFrames || 200;
    game.selectedSeed = saveData.selectedSeed || 'bacteria';
    game.tps = saveData.stats?.tps || 0;

    if (saveData.inventory) {
        game.inventory.energy = saveData.inventory.energy || 0;
        game.inventory.maxEnergy = saveData.inventory.maxEnergy || 100;
        game.inventory.matter = saveData.inventory.matter || 0;
        game.inventory.maxMatter = saveData.inventory.maxMatter || 100;
        game.inventory.items = saveData.inventory.items || {};

        if (game.inventory.items.energy !== undefined) {
            game.inventory.energy = game.inventory.items.energy;
            delete game.inventory.items.energy;
        }
        if (game.inventory.items.matter !== undefined) {
            game.inventory.matter = game.inventory.items.matter;
            delete game.inventory.items.matter;
        }
    }

    if (saveData.plots && saveData.plots.length > 0) {
        game.plots = saveData.plots.map(data => {
            const plot = new Plot(data.id);
            plot.fromJSON(data);
            return plot;
        });
    }

    if (saveData.buildings) {
        if (saveData.buildings.prayAgent) {
            game.buildings.prayAgent = new PrayAgent();
            game.buildings.prayAgent.level = saveData.buildings.prayAgent.level || 0;
        }
        if (saveData.buildings.harvestAgent) {
            game.buildings.harvestAgent = new HarvestAgent();
            game.buildings.harvestAgent.level = saveData.buildings.harvestAgent.level || 0;
        }
        if (saveData.buildings.plantAgent) {
            game.buildings.plantAgent = new PlantAgent();
            game.buildings.plantAgent.level = saveData.buildings.plantAgent.level || 0;
        }
    }

    game.tech = saveData.tech || {};

    for (const techId in game.tech) {
        if (game.tech[techId].unlocked) {
            const tech = techTree[techId];
            if (tech && tech.effect) {
                applyTechEffect(tech);
            }
        }
    }

    if (game.buildings.prayAgent.level > 0) {
        game.buildings.prayAgent.start(game);
    }
}

export function resetGame() {
    if (confirm('确定要清除存档并重新开始吗？')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload(true);
    }
}

export function exportGame() {
    const compressed = localStorage.getItem(SAVE_KEY);
    if (!compressed) {
        addLog('[错误] 没有存档可以导出');
        return null;
    }
    return compressed;
}

export function importGame(saveStr, showLog = true) {
    try {
        localStorage.setItem(SAVE_KEY, saveStr);
        if (showLog) {
            addLog('[导入] 存档已导入，正在重新加载...');
        }
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        if (showLog) {
            addLog('[错误] 导入失败：' + err.message);
        }
    }
}

export function exportToFile() {
    const data = exportGame();
    if (!data) return;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    const filename = `radcrop_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.txt`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addLog('[导出] 存档已保存到文件');
}

export function importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            importGame(event.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
}

export function exportToText() {
    const data = exportGame();
    if (!data) return;

    const textarea = document.getElementById('save-textarea');
    if (textarea) {
        textarea.value = data;
        textarea.select();
    }
    addLog('[导出] 存档已复制到文本框');
}

export function importFromText() {
    const textarea = document.getElementById('save-textarea');
    if (textarea && textarea.value) {
        importGame(textarea.value);
    }
}

export function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

export function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    game.logs.unshift(`[${timestamp}] ${message}`);

    if (game.logs.length > 50) {
        game.logs.pop();
    }

    const logContainer = document.getElementById('log-container');
    if (logContainer) {
        logContainer.innerHTML = game.logs.map(log => `<div class="log-entry">${log}</div>`).join('');
    }
}
