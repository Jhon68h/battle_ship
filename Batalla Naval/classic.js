// Classic Mode Configuration
const CLASSIC_CONFIG = {
    boardSize: 10,
    storageKey: 'battleshipHistory',
    ships: [
        { name: 'Portaviones', size: 5, quantity: 1, color: '#FF6B6B' },
        { name: 'Acorazado', size: 4, quantity: 1, color: '#4ECDC4' },
        { name: 'Submarino', size: 3, quantity: 2, color: '#45B7D1' },
        { name: 'Destructor', size: 2, quantity: 1, color: '#96CEB4' }
    ],
    weapons: null
};

let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine(CLASSIC_CONFIG);
});
