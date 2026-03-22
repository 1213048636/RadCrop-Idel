import { game, seeds } from '../config.js';
import { plantRegistry } from '../classes/index.js';
import { Plot } from '../classes/Plot.js';
import { ItemID } from '../items.js';
import { techTree, TechCategory, getTechsByCategory } from '../tech.js';
import { isTechUnlocked, getTechStatus, unlockTech, getMaxPlots } from '../techEffects.js';
import { addLog } from '../save/saveSystem.js';

let currentCallbacks = { plant: null, harvest: null, clear: null };
let techTreeEventsBound = false;

export function updateUI() {
    updateInventory();
    renderWarehouse();
    renderFarmOverview();
    updatePlots();
    renderTechTree();
    updateMegastructureTab();
}

function updateMegastructureTab() {
    const megastructureTabBtn = document.getElementById('megastructure-tab-btn');
    const energyRefineCard = document.getElementById('energy-refine-card');
    
    if (megastructureTabBtn) {
        megastructureTabBtn.style.display = isTechUnlocked('energyConversion') ? '' : 'none';
    }
    
    if (energyRefineCard) {
        energyRefineCard.style.display = isTechUnlocked('energyConversion') ? '' : 'none';
    }
}

function updateInventory() {
    const tokenCount = document.getElementById('token-display');
    const energyCount = document.getElementById('energy-count');
    const materialCount = document.getElementById('material-count');

    if (tokenCount) tokenCount.textContent = Math.floor(game.tokens).toLocaleString();
    if (energyCount) energyCount.textContent = Math.floor(game.inventory.energy).toLocaleString();
    if (materialCount) materialCount.textContent = Math.floor(game.inventory.matter || 0).toLocaleString();
}

function renderWarehouse() {
    const container = document.getElementById('warehouse-container');
    if (!container) return;

    const items = game.inventory.items || {};
    const basicResources = ['energy', 'matter'];
    const itemNames = {
        'spore': '孢子',
        'seed': '种子'
    };

    const itemList = Object.entries(items)
        .filter(([id, count]) => count > 0 && !basicResources.includes(id))
        .map(([id, count]) => ({
            id,
            name: itemNames[id] || id,
            count
        }));

    if (itemList.length === 0) {
        container.innerHTML = '<div class="panel-placeholder">暂无物品</div>';
        return;
    }

    container.innerHTML = itemList.map(item => `
        <div class="inventory-item">
            <span>${item.name}</span>
            <span>${item.count}</span>
        </div>
    `).join('');
}

function renderFarmOverview() {
    const container = document.getElementById('farm-overview-container');
    if (!container) return;

    const radiation = game.radiation ? game.radiation.toFixed(1) : '0.0';
    const halflifeFrames = game.radiationHalflifeFrames || 200;
    const halflifeSeconds = (halflifeFrames * 0.25).toFixed(1);
    const buildings = game.buildings;

    const prayAgent = buildings.prayAgent;
    const harvestAgent = buildings.harvestAgent;
    const plantAgent = buildings.plantAgent;

    container.innerHTML = `
        <div class="inventory-item">
            <span>辐射值：</span>
            <span>${radiation}%</span>
        </div>
        <div class="inventory-item">
            <span>辐射半衰期：</span>
            <span>${halflifeSeconds}秒</span>
        </div>
        <div class="inventory-item">
            <span>${prayAgent.name}：</span>
            <span>Lv.${prayAgent.level}</span>
        </div>
        <div class="inventory-item">
            <span>${plantAgent.name}：</span>
            <span>Lv.${plantAgent.level}</span>
        </div>
        <div class="inventory-item">
            <span>${harvestAgent.name}：</span>
            <span>Lv.${harvestAgent.level}</span>
        </div>
    `;
}

export function renderPlots(plantCallback, harvestCallback, clearCallback) {
    const grid = document.getElementById('plots-grid');
    if (!grid) return;

    currentCallbacks = {
        plant: plantCallback,
        harvest: harvestCallback,
        clear: clearCallback
    };

    const allPlants = plantRegistry.getAllPlants();

    game.plots.forEach(plot => {
        let plotDiv = document.getElementById(`plot-${plot.id}`);
        
        if (!plotDiv) {
            plotDiv = document.createElement('div');
            plotDiv.className = `plot-item`;
            plotDiv.dataset.id = plot.id;
            plotDiv.id = `plot-${plot.id}`;
            grid.appendChild(plotDiv);
        }

        updatePlotElement(plotDiv, plot, allPlants);
    });
}

export function updateSinglePlot(plotId) {
    const plotDiv = document.getElementById(`plot-${plotId}`);
    if (!plotDiv) return;

    const plot = game.plots[plotId];
    if (!plot) return;

    const statusType = plot.getStatus();
    const plotInfo = plotDiv.querySelector('.plot-info');

    if (statusType === 'empty') {
        if (!plotInfo.querySelector('.plot-status')) {
            plotInfo.innerHTML = '<div class="plot-status">空闲</div>';
        }
    } else if (statusType === 'growing') {
        const plant = plot.getPlant();
        if (!plant) return;
        const progress = Math.min(100, Math.round((plot.growth / plant.growthTime) * 100));
        
        let cropName = plotInfo.querySelector('.crop-name');
        if (!cropName) {
            plotInfo.innerHTML = `
                <div class="crop-name">${plant.name}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(plot.growth)}/${plant.growthTime}</div>
            `;
        } else {
            cropName.textContent = plant.name;
            const progressFill = plotInfo.querySelector('.progress-fill');
            const progressText = plotInfo.querySelector('.progress-text');
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${Math.round(plot.growth)}/${plant.growthTime}`;
        }
    } else if (statusType === 'mature') {
        const plant = plot.getPlant();
        if (!plant) return;
        plotInfo.innerHTML = `
            <div class="crop-name">${plant.name}</div>
            <div class="mature-label">成熟</div>
        `;
    }

    plotDiv.className = `plot-item ${statusType}`;
}

function getPlantTooltipText(plant) {
    if (!plant) return '';
    
    const itemNames = { 'tokens': 'Token', 'spore': '孢子', 'seed': '种子', 'energy': '能量', 'matter': '物质' };
    
    let harvestText = [];
    const harvest = plant.harvest({});
    for (const [item, amount] of Object.entries(harvest)) {
        const name = itemNames[item] || item;
        harvestText.push(`+${amount} ${name}`);
    }
    
    let costText = [];
    if (plant.seedCost) {
        for (const [item, amount] of Object.entries(plant.seedCost)) {
            const name = itemNames[item] || item;
            costText.push(`-${amount} ${name}`);
        }
    }
    
    const radiation = plant.radiationIncrease > 0 ? `+${plant.radiationIncrease}%` : `${plant.radiationIncrease}%`;
    
    let text = `${plant.name}\n`;
    text += `生长: ${plant.growthTime} 祈祷\n`;
    if (costText.length > 0) {
        text += `成本: ${costText.join(', ')}\n`;
    }
    text += `收获: ${harvestText.join(', ')}\n`;
    text += `辐射: ${radiation}`;
    
    return text;
}

function updatePlotElement(plotDiv, plot, allPlants) {
    const statusType = plot.getStatus();

    plotDiv.className = `plot-item ${statusType}`;

    const currentSeed = plot.lastSeed || (allPlants.length > 0 ? allPlants[0].id : '');
    const currentPlant = plantRegistry.getPlant(currentSeed);

    const autoPlantBtnClass = plot.autoPlant ? 'toggle-btn active' : 'toggle-btn';
    const autoPlantBtn = `<button class="${autoPlantBtnClass}" data-action="autoPlant">自动播种</button>`;

    const autoHarvestBtnClass = plot.autoHarvest ? 'toggle-btn active' : 'toggle-btn';
    const autoHarvestBtn = `<button class="${autoHarvestBtnClass}" data-action="autoHarvest">自动收获</button>`;

    let infoHtml = '';
    if (statusType === 'empty') {
        infoHtml = `<div class="plot-status">空闲</div>`;
    } else if (statusType === 'growing') {
        const plant = plot.getPlant();
        const progress = Math.min(100, Math.round((plot.growth / plant.growthTime) * 100));
        infoHtml = `
            <div class="crop-name">${plant.name}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${Math.round(plot.growth)}/${plant.growthTime}</div>
        `;
    } else if (statusType === 'mature') {
        const plant = plot.getPlant();
        infoHtml = `
            <div class="crop-name">${plant.name}</div>
            <div class="mature-label">成熟</div>
        `;
    }

    const html = `
        <div class="plot-info">${infoHtml}</div>
        <div class="plot-actions">
            ${autoPlantBtn}
            <button class="btn action-btn" data-action="main">${statusType === 'empty' ? '播种' : '收获'}</button>
            ${autoHarvestBtn}
        </div>
        <div class="plot-seed-row">
            <select class="seed-select" id="seed-select-${plot.id}">
                ${allPlants.map(p => `<option value="${p.id}" ${p.id === currentSeed ? 'selected' : ''} title="${getPlantTooltipText(p)}">${p.name}</option>`).join('')}
            </select>
        </div>
    `;

    plotDiv.innerHTML = html;

    const seedSelect = plotDiv.querySelector(`#seed-select-${plot.id}`);
    if (seedSelect) {
        seedSelect.onchange = (e) => {
            e.stopPropagation();
            plot.lastSeed = e.target.value;
        };
    }

    const mainBtn = plotDiv.querySelector('[data-action="main"]');
    if (mainBtn) {
        mainBtn.onclick = (e) => {
            e.stopPropagation();
            if (statusType === 'empty') {
                if (currentCallbacks.plant) currentCallbacks.plant(plot.id);
            } else {
                if (currentCallbacks.harvest) currentCallbacks.harvest(plot.id);
            }
        };
    }

    const autoPlantBtnEl = plotDiv.querySelector('[data-action="autoPlant"]');
    if (autoPlantBtnEl) {
        autoPlantBtnEl.onclick = (e) => {
            e.stopPropagation();
            plot.autoPlant = !plot.autoPlant;
            autoPlantBtnEl.className = plot.autoPlant ? 'toggle-btn active' : 'toggle-btn';
        };
    }

    const autoHarvestBtnEl = plotDiv.querySelector('[data-action="autoHarvest"]');
    if (autoHarvestBtnEl) {
        autoHarvestBtnEl.onclick = (e) => {
            e.stopPropagation();
            plot.autoHarvest = !plot.autoHarvest;
            autoHarvestBtnEl.className = plot.autoHarvest ? 'toggle-btn active' : 'toggle-btn';
        };
    }
}

function updatePlots() {
    const grid = document.getElementById('plots-grid');
    if (!grid) return;

    const allPlants = plantRegistry.getAllPlants();

    game.plots.forEach(plot => {
        const plotDiv = document.getElementById(`plot-${plot.id}`);
        if (!plotDiv) return;

        const statusType = plot.getStatus();
        
        if (statusType === 'growing') {
            const plant = plot.getPlant();
            const progressText = plotDiv.querySelector('.progress-text');
            const progressFill = plotDiv.querySelector('.progress-fill');

            if (progressText) {
                progressText.textContent = `${Math.round(plot.growth)}/${plant.growthTime}`;
            }
            if (progressFill) {
                const progress = Math.min(100, Math.round((plot.growth / plant.growthTime) * 100));
                progressFill.style.width = `${progress}%`;
            }
        }
    });
}

export function renderBuildings(upgradeCallback) {
    const grid = document.getElementById('buildings-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let key in game.buildings) {
        const b = game.buildings[key];
        const cost = b.getUpgradeCost ? b.getUpgradeCost() : 0;
        const canAfford = game.tokens >= cost;

        const card = document.createElement('div');
        card.className = 'building-card';

        const nameDiv = document.createElement('h3');
        nameDiv.textContent = b.name;
        card.appendChild(nameDiv);

        const levelDiv = document.createElement('div');
        levelDiv.className = 'level';
        levelDiv.textContent = `Lv.${b.level}`;
        card.appendChild(levelDiv);

        const costDiv = document.createElement('div');
        costDiv.className = 'cost';
        costDiv.textContent = `${cost} Token`;
        card.appendChild(costDiv);

        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'btn';
        upgradeBtn.textContent = '升级';
        upgradeBtn.disabled = !canAfford;
        upgradeBtn.onclick = () => {
            if (upgradeCallback) upgradeCallback(key);
        };
        card.appendChild(upgradeBtn);

        grid.appendChild(card);
    }
}

export function renderTechTree() {
    const categories = [TechCategory.AGRI, TechCategory.INDUSTRY, TechCategory.GENE, TechCategory.CULTURE];

    for (const category of categories) {
        const container = document.getElementById(`tech-${category}`);
        if (!container) continue;

        const techs = getTechsByCategory(category);
        const availableTechs = techs.filter(tech => {
            const status = getTechStatus(tech.id);
            return !status.unlocked && status.requiresMet;
        });

        if (availableTechs.length === 0) {
            container.innerHTML = '<div class="tech-placeholder">暂无可用研究</div>';
            continue;
        }

        container.innerHTML = availableTechs.map(tech => renderTechItem(tech)).join('');
    }

    if (!techTreeEventsBound) {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.unlock-btn');
            if (btn) {
                const techId = btn.dataset.techId;
                handleTechUnlock(techId);
            }
        });
        techTreeEventsBound = true;
    }
}

function renderTechItem(tech) {
    const status = getTechStatus(tech.id);
    const itemNames = {
        'spore': '孢子',
        'seed': '种子',
        'energy': '能量',
        'matter': '物质',
        'tokens': 'Token'
    };

    let costHtml = '';
    let canAffordAll = true;
    if (tech.cost) {
        costHtml = Object.entries(tech.cost).map(([itemId, amount]) => {
            const costStatus = status.costStatus[itemId] || { current: 0, affordable: false };
            if (!costStatus.affordable) canAffordAll = false;
            return `
                <div class="cost-item ${costStatus.affordable ? 'affordable' : 'not-affordable'}">
                    <span>${itemNames[itemId] || itemId}：</span>
                    <span>${Math.floor(costStatus.current)}/${amount}</span>
                </div>
            `;
        }).join('');
    }

    let conditionHtml = '';
    if (tech.condition && tech.condition.radiationMin !== undefined) {
        const met = status.conditionMet;
        if (!met) canAffordAll = false;
        conditionHtml = `
            <div class="cost-item ${met ? 'affordable' : 'not-affordable'}">
                <span>辐射值 ≥ ${tech.condition.radiationMin}%：</span>
                <span>${game.radiation.toFixed(1)}%</span>
            </div>
        `;
    }

    const canUnlock = status.canUnlock;

    return `
        <div class="locked-research-item">
            <div class="locked-research-header">
                <span class="locked-research-name">${tech.name}</span>
            </div>
            <div class="tech-description">${tech.description}</div>
            <div class="locked-research-cost">
                ${costHtml}
                ${conditionHtml}
            </div>
            <button class="unlock-btn" data-tech-id="${tech.id}" ${canUnlock ? '' : 'disabled'}>
                ${canUnlock ? '解锁' : (!status.conditionMet ? '条件未满足' : '资源不足')}
            </button>
        </div>
    `;
}

function handleTechUnlock(techId) {
    const tech = techTree[techId];
    if (!tech) return;

    const success = unlockTech(techId);

    if (success) {
        addLog(`解锁了科技：${tech.name}！`, 'success');

        if (tech.effect.type === 'unlockPlant') {
            rebuildPlots();
        }

        if (tech.effect.type === 'unlockPlots') {
            const maxPlots = getMaxPlots();
            while (game.plots.length < maxPlots) {
                game.plots.push(new Plot(game.plots.length));
                addLog(`[地块] 新增 1 块地块，共 ${game.plots.length} 块`);
            }
            renderPlots(currentCallbacks.plant, currentCallbacks.harvest, currentCallbacks.clear);
        }

        updateUI();
    }
}

function rebuildPlots() {
    const grid = document.getElementById('plots-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const allPlants = plantRegistry.getAllPlants();
    game.plots.forEach(plot => {
        const plotDiv = document.createElement('div');
        plotDiv.className = `plot-item`;
        plotDiv.dataset.id = plot.id;
        plotDiv.id = `plot-${plot.id}`;

        updatePlotElement(plotDiv, plot, allPlants);

        const mainBtn = plotDiv.querySelector('[data-action="main"]');
        if (mainBtn) {
            mainBtn.onclick = (e) => {
                e.stopPropagation();
                const status = plot.getStatus();
                if (currentCallbacks.plant && status === 'empty') {
                    currentCallbacks.plant(plot.id);
                } else if (currentCallbacks.harvest && status === 'mature') {
                    currentCallbacks.harvest(plot.id);
                }
            };
        }

        const autoPlantBtnEl = plotDiv.querySelector('[data-action="autoPlant"]');
        if (autoPlantBtnEl) {
            autoPlantBtnEl.onclick = (e) => {
                e.stopPropagation();
                plot.autoPlant = !plot.autoPlant;
                autoPlantBtnEl.className = plot.autoPlant ? 'toggle-btn active' : 'toggle-btn';
            };
        }

        const autoHarvestBtnEl = plotDiv.querySelector('[data-action="autoHarvest"]');
        if (autoHarvestBtnEl) {
            autoHarvestBtnEl.onclick = (e) => {
                e.stopPropagation();
                plot.autoHarvest = !plot.autoHarvest;
                autoHarvestBtnEl.className = plot.autoHarvest ? 'toggle-btn active' : 'toggle-btn';
            };
        }

        grid.appendChild(plotDiv);
    });
}
