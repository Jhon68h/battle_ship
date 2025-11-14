// War Mode Configuration
const WAR_CONFIG = {
    boardSize: 12,
    storageKey: 'battleshipHistoryWar',
    ships: [
        { name: 'Portaviones', size: 5, quantity: 2, color: '#FF6B6B' },
        { name: 'Acorazado', size: 4, quantity: 2, color: '#4ECDC4' },
        { name: 'Submarino', size: 3, quantity: 4, color: '#45B7D1' },
        { name: 'Destructor', size: 2, quantity: 2, color: '#96CEB4' }
    ],
    weapons: ['bomb', 'missile']
};

let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine(WAR_CONFIG);
});
