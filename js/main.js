import { initGameState, game } from './config.js';
import { 
    saveGame, loadGame, resetGame, addLog,
    exportToFile, importFromFile, importFromText,
    exportToText
} from './save/saveSystem.js';
import { upgradeBuilding } from './buildings.js';
import { plantPlot, harvestPlot, clearPlot, recharge, emit, refineEnergy } from './crops.js';
import { gameTick } from './systems/gameLoop.js';
import { updateUI, renderPlots, renderBuildings } from './ui/render.js';
import { isTechUnlocked } from './techEffects.js';

function init() {
    initGameState();
    
    const loaded = loadGame();
    if (!loaded) {
        addLog('游戏初始化完成！');
        addLog('欢迎来到 RadCrop - 辐射作物自动化农场');
        addLog('放射菌是零成本作物，可以无限次播种！');
        addLog('点击土地上的"播种"按钮种植作物，等待成熟后收获！');
    }
    
    startAgents();
    
    renderBuildings(upgradeBuilding);
    renderPlots(plantPlot, harvestPlot, clearPlot);
    updateUI();
    
    bindEvents();
    
    setInterval(gameTick, 250);
}

function startAgents() {
    if (game.buildings.prayAgent.level > 0) {
        game.buildings.prayAgent.start(game);
    }
}

function bindEvents() {
    document.getElementById('recharge-btn').onclick = recharge;
    document.getElementById('emit-btn').onclick = emit;
    document.getElementById('refine-energy-btn').onclick = refineEnergy;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        };
    });

    document.querySelectorAll('.tech-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.techTab;
            document.querySelectorAll('.tech-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tech-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tech-${tabId}`).classList.add('active');
        };
    });

    document.querySelectorAll('.building-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.buildingTab;
            document.querySelectorAll('.building-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.building-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`building-${tabId}`).classList.add('active');
        };
    });

    const saveBtnMain = document.getElementById('save-btn-main');
    const loadBtnMain = document.getElementById('load-btn-main');
    const resetBtnMain = document.getElementById('reset-btn-main');
    const exportFileBtn = document.getElementById('export-file-btn');
    const importFileBtn = document.getElementById('import-file-btn');
    const exportTextBtn = document.getElementById('export-text-btn');
    const importTextBtn = document.getElementById('import-text-btn');

    if (saveBtnMain) saveBtnMain.onclick = saveGame;
    if (loadBtnMain) loadBtnMain.onclick = loadGame;
    if (resetBtnMain) resetBtnMain.onclick = resetGame;
    if (exportFileBtn) exportFileBtn.onclick = exportToFile;
    if (importFileBtn) importFileBtn.onclick = importFromFile;
    if (exportTextBtn) exportTextBtn.onclick = exportToText;
    if (importTextBtn) importTextBtn.onclick = () => {
        const textarea = document.getElementById('save-textarea');
        if (textarea && textarea.value) {
            importFromText(textarea.value);
        }
    };

    window.addEventListener('gameReset', () => {
        updateUI();
        renderBuildings(upgradeBuilding);
        renderPlots(plantPlot, harvestPlot, clearPlot);
    });
}

window.onload = function() {
    init();
};
