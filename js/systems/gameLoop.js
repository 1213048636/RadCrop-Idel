import { game } from '../config.js';
import { plantRegistry } from '../classes/index.js';
import { Plot } from '../classes/Plot.js';
import { updateRadiation } from './radiation.js';
import { updateUI, updateSinglePlot } from '../ui/render.js';
import { plantPlot, harvestPlot, clearPlot } from '../crops.js';
import { addLog } from '../save/saveSystem.js';
import { getMaxPlots } from '../techEffects.js';

export function gameTick() {
    const now = Date.now();
    const delta = (now - game.lastTick) / 1000;
    game.lastTick = now;

    updateRadiation();
    checkNaturalGrowth();
    checkPrayAgent();
    checkAutoPlant();
    checkAutoHarvest();
    checkPlotExpansion();
    updateUI();
}

function checkPlotExpansion() {
    const maxPlots = getMaxPlots();
    while (game.plots.length < maxPlots) {
        const newPlot = new Plot(game.plots.length);
        game.plots.push(newPlot);
        addLog(`[地块] 新增 1 块地块，共 ${game.plots.length} 块`);
    }
}

function checkPrayAgent() {
    const prayAgent = game.buildings.prayAgent;
    if (prayAgent.level === 0) return;

    const effect = prayAgent.getPrayEffect(game);
    if (effect <= 0) return;

    if (prayAgent.level === 1) {
        for (const plot of game.plots) {
            if (plot.seed && !plot.mature) {
                plot.grow(effect);
                break;
            }
        }
    } else if (prayAgent.level >= 2) {
        for (const plot of game.plots) {
            if (plot.seed && !plot.mature) {
                plot.grow(effect);
            }
        }
    }
}

function checkNaturalGrowth() {
    for (const plot of game.plots) {
        if (plot.seed && !plot.mature) {
            if (Math.random() < 0.1) {
                plot.grow(1);
            }
        }
    }
}

function checkAutoHarvest() {
    if (game.buildings.harvestAgent.level === 0) return;

    const autoHarvestPlots = game.plots.filter(plot => plot.mature && plot.autoHarvest);

    for (const plot of autoHarvestPlots) {
        harvestPlot(plot.id);
    }
}

function checkAutoPlant() {
    if (game.buildings.plantAgent.level === 0) return;

    const autoPlantPlots = game.plots.filter(plot => !plot.seed && plot.autoPlant);

    for (const plot of autoPlantPlots) {
        plantPlot(plot.id);
    }
}

function triggerHarvestEffect(plotId) {
    const plotDiv = document.getElementById(`plot-${plotId}`);
    if (plotDiv) {
        plotDiv.classList.add('harvest-flash');
        setTimeout(() => {
            plotDiv.classList.remove('harvest-flash');
        }, 300);
    }
}
