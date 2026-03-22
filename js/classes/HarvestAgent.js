export class HarvestAgent {
    constructor() {
        this.name = '收获 Agent';
        this.level = 0;
    }

    upgrade() {
        this.level++;
    }

    getUpgradeCost() {
        const costs = [15];
        return costs[this.level] || costs[costs.length - 1] * Math.pow(2, this.level - costs.length);
    }

    getEffectDesc() {
        if (this.level === 0) return '未激活';
        const prob = Math.floor(this.getDoubleHarvestProb() * 100);
        return `双倍收获 ${prob}%`;
    }

    getDoubleHarvestProb() {
        if (this.level === 0) return 0;
        return 0.9 * (1 - Math.pow(0.5, this.level));
    }

    isDoubleHarvest() {
        if (this.level === 0) return false;
        return Math.random() < this.getDoubleHarvestProb();
    }

    toJSON() {
        return {
            name: this.name,
            level: this.level
        };
    }

    fromJSON(data) {
        this.name = data.name;
        this.level = data.level;
        return this;
    }
}
