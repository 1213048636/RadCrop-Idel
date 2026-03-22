export class PrayAgent {
    constructor() {
        this.name = '祈祷 Agent';
        this.level = 0;
        this.timer = null;
        this.interval = 250;
    }

    getUpgradeCost() {
        const costs = [15];
        return costs[this.level] || costs[costs.length - 1] * Math.pow(2, this.level - costs.length);
    }

    start(game) {
    }

    getPrayEffect(game) {
        if (this.level === 0) return 0;
        const radiation = (game && typeof game.radiation === 'number') ? game.radiation : 0;
        const base = 1 - radiation / 100;
        if (base <= 0) return 0;
        return this.level * (0.5 + base * 0.5);
    }

    getEffectDesc() {
        if (this.level === 0) return '未激活';
        const effect = Math.floor(this.getPrayEffect(null) * 100);
        return `祈祷效率 ${effect}%`;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    upgrade() {
        this.level++;
    }
}
