export class PlantAgent {
    constructor() {
        this.name = '播种 Agent';
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
        const prob = Math.floor(this.getFreePlantProb() * 100);
        return `免费播种 ${prob}%`;
    }

    getFreePlantProb() {
        if (this.level === 0) return 0;
        return 0.8 * (1 - Math.pow(0.5, this.level));
    }

    isFreePlant() {
        if (this.level === 0) return false;
        return Math.random() < this.getFreePlantProb();
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
