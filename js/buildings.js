import { game } from './config.js';
import { addLog, saveGame } from './save/saveSystem.js';
import { updateUI, renderBuildings } from './ui/render.js';

export function upgradeBuilding(key) {
    const building = game.buildings[key];
    if (!building) {
        addLog(`[错误] 建筑不存在！`);
        return;
    }

    const cost = building.getUpgradeCost();
    if (game.tokens < cost) {
        addLog(`[错误] Token 不足！需要 ${cost} Token，当前 ${game.tokens}`);
        return;
    }

    game.tokens -= cost;
    building.upgrade();
    addLog(`[升级] ${building.name} 到 Lv.${building.level}！`);

    if (key === 'prayAgent' && building.level > 0) {
        building.start(game);
    }

    saveGame(false);

    updateUI();
    renderBuildings(upgradeBuilding);
}
