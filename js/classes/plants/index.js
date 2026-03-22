import { Plant } from './Plant.js';
import { Bacteria } from './Bacteria.js';
import { Fungi } from './Fungi.js';
import { SporeFlower } from './SporeFlower.js';
import { RadiumPotato } from './RadiumPotato.js';
import { HighEntropyPumpkin } from './HighEntropyPumpkin.js';

const bacteria = new Bacteria();
const fungi = new Fungi();
const sporeFlower = new SporeFlower();
const radiumPotato = new RadiumPotato();
const highEntropyPumpkin = new HighEntropyPumpkin();

const plantRegistry = {
    bacteria: bacteria,
    fungi: fungi,
    sporeFlower: sporeFlower,
    radiumPotato: radiumPotato,
    highEntropyPumpkin: highEntropyPumpkin,

    getPlant(id) {
        if (this[id]) return this[id];
        const allPlants = this.getAllPlantsArray();
        return allPlants.find(p => p.id === id) || null;
    },

    getAllPlants() {
        return [bacteria, fungi, sporeFlower, radiumPotato, highEntropyPumpkin].filter(p => !p.locked);
    },

    getAllPlantsArray() {
        return [bacteria, fungi, sporeFlower, radiumPotato, highEntropyPumpkin];
    },

    unlockPlant(id) {
        const plant = this.getPlant(id);
        if (plant) {
            plant.locked = false;
        }
    },

    resetAllPlants() {
        const allPlants = this.getAllPlantsArray();
        for (const plant of allPlants) {
            if (plant.id !== 'bacteria' && plant.id !== 'fungi') {
                plant.locked = true;
            }
        }
    }
};

export { Plant, Bacteria, Fungi, SporeFlower, RadiumPotato, HighEntropyPumpkin, plantRegistry };
