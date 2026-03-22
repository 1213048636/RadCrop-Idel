import { game } from '../config.js';

export function bindEvents(handlers) {
    if (handlers.pray && document.getElementById('harvest-btn')) {
        document.getElementById('harvest-btn').onclick = handlers.pray;
    }
    
    if (handlers.save && document.getElementById('save-btn')) {
        document.getElementById('save-btn').onclick = handlers.save;
    }
    
    if (handlers.export && document.getElementById('export-btn')) {
        document.getElementById('export-btn').onclick = handlers.export;
    }
    
    if (handlers.import && document.getElementById('import-btn')) {
        document.getElementById('import-btn').onclick = handlers.import;
    }
    
    if (handlers.reset && document.getElementById('reset-btn')) {
        document.getElementById('reset-btn').onclick = handlers.reset;
    }

    document.querySelectorAll('.tech-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.dataset.techTab;
            document.querySelectorAll('.tech-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tech-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tech-${tabId}`).classList.add('active');
        };
    });
}
