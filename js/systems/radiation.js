import { game } from '../config.js';

export const RADIATION_HALFLIFE_FRAMES = 200;
export const RADIATION_HALFLIFE_SECONDS = (RADIATION_HALFLIFE_FRAMES * 0.25).toFixed(1);

export function updateRadiation() {
    const halflife = game.radiationHalflifeFrames || RADIATION_HALFLIFE_FRAMES;
    const decayRate = Math.pow(0.5, 1 / halflife);
    game.radiation *= decayRate;
    if (game.radiation < 0.01) {
        game.radiation = 0;
    }
}

export function getRadiationZone() {
    let zone = '安全区';
    let color = '#00ff88';
    
    if (game.radiation > 30) { 
        zone = '活跃区'; 
        color = '#ffaa00'; 
    }
    if (game.radiation > 60) { 
        zone = '危险区'; 
        color = '#ff5555'; 
    }
    if (game.radiation > 80) { 
        zone = '死寂区'; 
        color = '#ff00ff'; 
    }
    
    return { zone, color };
}
