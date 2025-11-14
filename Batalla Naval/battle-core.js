// Game State Manager
class GameState {
    constructor(config) {
        this.config = config;
        this.phase = 'SETUP';
        this.playerBoard = this.createEmptyBoard();
        this.pcBoard = this.createEmptyBoard();
        this.playerShips = [];
        this.pcShips = [];
        this.currentShipSelection = null;
        this.gameHistory = this.loadHistory();
        this.currentGame = {
            playerHits: 0,
            pcHits: 0,
            playerShots: 0,
            pcShots: 0,
            startTime: Date.now()
        };
    }

    createEmptyBoard() {
        return Array(this.config.boardSize).fill(null).map(() => Array(this.config.boardSize).fill(null));
    }

    loadHistory() {
        const history = localStorage.getItem(this.config.storageKey);
        return history ? JSON.parse(history) : [];
    }

    saveHistory() {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.gameHistory));
    }

    addGameToHistory(winner, playerHits, pcHits, duration) {
        this.gameHistory.unshift({
            date: new Date().toLocaleString('es-ES'),
            winner,
            playerHits,
            pcHits,
            duration: Math.floor(duration / 1000)
        });
        if (this.gameHistory.length > 10) {
            this.gameHistory = this.gameHistory.slice(0, 10);
        }
        this.saveHistory();
    }
}

// Ship class
class Ship {
    constructor(type, size, positions) {
        this.type = type;
        this.size = size;
        this.positions = positions;
        this.hits = new Set();
    }

    hit(row, col) {
        const key = `${row},${col}`;
        this.hits.add(key);
    }

    isSunk() {
        return this.hits.size === this.size;
    }
}

// Weapon Strategies
class SingleShotWeapon {
    constructor() {
        this.name = 'Disparo';
        this.icon = '🎯';
    }

    getTargets(row, col, boardSize) {
        if (row >= boardSize || col >= boardSize) return [];
        return [[row, col]];
    }
}

class BombWeapon {
    constructor() {
        this.name = 'Bomba 3x3';
        this.icon = '💣';
        this.uses = 2;
    }

    getTargets(row, col, boardSize) {
        const targets = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
                    targets.push([r, c]);
                }
            }
        }
        return targets;
    }
}

class MissileWeapon {
    constructor() {
        this.name = 'Misil 3x';
        this.icon = '🚀';
        this.uses = 3;
        this.orientation = 'horizontal';
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    getTargets(row, col, boardSize) {
        const targets = [];
        if (this.orientation === 'horizontal') {
            for (let c = col; c < col + 3 && c < boardSize; c++) {
                targets.push([row, c]);
            }
        } else {
            for (let r = row; r < row + 3 && r < boardSize; r++) {
                targets.push([r, col]);
            }
        }
        return targets;
    }
}

// Game Engine
class GameEngine {
    constructor(config) {
        this.config = config;
        this.state = new GameState(config);
        this.shipCounts = config.ships.map(s => ({...s, placed: 0}));
        this.selectedShipType = null;
        this.selectedOrientation = 'horizontal';
        this.pcShotHistory = new Set();
        this.selectedWeapon = null;
        this.weapons = this.initWeapons();
        this.init();
    }

    initWeapons() {
        const weapons = [new SingleShotWeapon()];
        if (this.config.weapons) {
            this.config.weapons.forEach(weaponType => {
                if (weaponType === 'bomb') weapons.push(new BombWeapon());
                if (weaponType === 'missile') weapons.push(new MissileWeapon());
            });
        }
        this.selectedWeapon = weapons[0];
        return weapons;
    }

    init() {
        this.renderBoards();
        this.renderShipSelection();
        this.renderControls();
        this.renderWeaponSelection();
        this.updatePhaseDisplay();
        this.showInstructions();
    }

    renderBoards() {
        const playerBoardEl = document.getElementById('board');
        const pcBoardEl = document.getElementById('boardAttack');
        
        playerBoardEl.innerHTML = '';
        pcBoardEl.innerHTML = '';

        for (let i = 0; i < this.config.boardSize; i++) {
            const playerRow = document.createElement('div');
            const pcRow = document.createElement('div');
            playerRow.className = 'board-row';
            pcRow.className = 'board-row';

            for (let j = 0; j < this.config.boardSize; j++) {
                const playerCell = this.createCell(i, j, 'player');
                const pcCell = this.createCell(i, j, 'pc');
                playerRow.appendChild(playerCell);
                pcRow.appendChild(pcCell);
            }

            playerBoardEl.appendChild(playerRow);
            pcBoardEl.appendChild(pcRow);
        }
    }

    createCell(row, col, owner) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.owner = owner;

        if (owner === 'player') {
            cell.addEventListener('click', (e) => this.handlePlayerBoardClick(e));
            cell.addEventListener('mouseenter', (e) => this.handlePlayerBoardHover(e));
            cell.addEventListener('mouseleave', (e) => this.handlePlayerBoardLeave(e));
        } else {
            cell.addEventListener('click', (e) => this.handleAttack(e));
            cell.addEventListener('mouseenter', (e) => this.handleEnemyBoardHover(e));
            cell.addEventListener('mouseleave', (e) => this.handleEnemyBoardLeave(e));
        }

        return cell;
    }

    renderShipSelection() {
        const container = document.getElementById('ships');
        container.innerHTML = '<h4>Selecciona tus naves:</h4>';

        this.shipCounts.forEach((ship, index) => {
            // Crear un solo elemento de nave con contador
            const shipItem = document.createElement('div');
            shipItem.className = 'ship-item';
            shipItem.dataset.type = index;
            
            const nameEl = document.createElement('div');
            nameEl.className = 'ship-name';
            nameEl.textContent = ship.name;
            
            const sizeEl = document.createElement('div');
            sizeEl.className = 'ship-size';
            sizeEl.textContent = `${ship.size}`;

            // Mostrar cuántas naves quedan por colocar
            const countEl = document.createElement('div');
            countEl.className = 'ship-count';
            countEl.textContent = ship.quantity - ship.placed;
            countEl.id = `count-${index}`;

            const orientations = document.createElement('div');
            orientations.className = 'orientations';

            const horizBtn = document.createElement('button');
            horizBtn.className = 'orientation-btn horizontal-btn';
            horizBtn.textContent = '―';
            horizBtn.dataset.orientation = 'horizontal';
            horizBtn.onclick = () => this.selectShip(index, 'horizontal', shipItem);

            const vertBtn = document.createElement('button');
            vertBtn.className = 'orientation-btn vertical-btn';
            vertBtn.textContent = '|';
            vertBtn.dataset.orientation = 'vertical';
            vertBtn.onclick = () => this.selectShip(index, 'vertical', shipItem);

            orientations.appendChild(horizBtn);
            orientations.appendChild(vertBtn);

            shipItem.appendChild(nameEl);
            shipItem.appendChild(sizeEl);
            shipItem.appendChild(orientations);
            shipItem.appendChild(countEl);

            container.appendChild(shipItem);
        });
    }

    renderWeaponSelection() {
        if (this.weapons.length <= 1) return;

        const container = document.getElementById('weapons');
        if (!container) return;

        container.innerHTML = '<h4>Armas Especiales:</h4>';
        const weaponsDiv = document.createElement('div');
        weaponsDiv.className = 'weapons-grid';

        this.weapons.forEach((weapon, index) => {
            // Crear un contenedor para cada arma
            const weaponItemDiv = document.createElement('div');
            weaponItemDiv.className = 'weapon-item';
            
            const weaponBtn = document.createElement('button');
            weaponBtn.className = 'weapon-btn';
            weaponBtn.dataset.index = index;
            weaponBtn.innerHTML = `${weapon.icon} ${weapon.name}`;
            
            if (weapon.uses !== undefined) {
                const uses = document.createElement('span');
                uses.className = 'weapon-uses';
                uses.textContent = ` (${weapon.uses})`;
                weaponBtn.appendChild(uses);
            }

            weaponBtn.onclick = () => this.selectWeapon(index, weaponBtn);
            
            if (index === 0) {
                weaponBtn.classList.add('selected');
            }

            weaponItemDiv.appendChild(weaponBtn);

            // Agregar botones de orientación si es misil
            if (weapon instanceof MissileWeapon) {
                const orientations = document.createElement('div');
                orientations.className = 'weapon-orientations';
                
                const horizBtn = document.createElement('button');
                horizBtn.className = 'orientation-btn horizontal-btn';
                horizBtn.textContent = '―';
                horizBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.setMissileOrientation('horizontal');
                };
                horizBtn.classList.add('selected');

                const vertBtn = document.createElement('button');
                vertBtn.className = 'orientation-btn vertical-btn';
                vertBtn.textContent = '|';
                vertBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.setMissileOrientation('vertical');
                };

                orientations.appendChild(horizBtn);
                orientations.appendChild(vertBtn);
                weaponItemDiv.appendChild(orientations);
            }

            weaponsDiv.appendChild(weaponItemDiv);
        });

        container.appendChild(weaponsDiv);
    }

    selectWeapon(index, btn) {
        if (this.state.phase !== 'BATTLE') return;

        document.querySelectorAll('.weapon-btn').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedWeapon = this.weapons[index];
    }

    setMissileOrientation(orientation) {
        const missile = this.weapons.find(w => w instanceof MissileWeapon);
        if (missile) {
            missile.setOrientation(orientation);
            const buttons = document.querySelectorAll('.weapon-orientations .orientation-btn');
            buttons.forEach(btn => {
                btn.classList.toggle('selected', 
                    (orientation === 'horizontal' && btn.textContent.includes('―')) ||
                    (orientation === 'vertical' && btn.textContent.includes('|'))
                );
            });
        }
    }

    renderControls() {
        const controls = document.getElementById('controls');
        controls.innerHTML = `
            <button id="startBtn" class="btn-primary" disabled>Iniciar Batalla</button>
            <button id="newGameBtn" class="btn-secondary">Nueva Partida</button>
            <button id="historyBtn" class="btn-secondary">📊 Historial</button>
            <button id="menuBtn" class="btn-secondary">Menú Principal</button>
            <button id="helpBtn" class="btn-info">?</button>
        `;

        document.getElementById('newGameBtn').onclick = () => this.newGame();
        document.getElementById('historyBtn').onclick = () => this.showHistory();
        document.getElementById('menuBtn').onclick = () => window.location.href = 'menu.html';
        document.getElementById('startBtn').onclick = () => this.startBattle();
        document.getElementById('helpBtn').onclick = () => this.showInstructions();
    }

    updatePhaseDisplay() {
        const phaseEl = document.getElementById('phaseDisplay');
        const phases = {
            'SETUP': 'Fase: Preparación - Coloca tus naves',
            'BATTLE': 'Fase: Batalla - ¡Ataca al enemigo!',
            'END': 'Fase: Fin del juego'
        };
        phaseEl.textContent = phases[this.state.phase];
        phaseEl.className = `phase-display phase-${this.state.phase.toLowerCase()}`;
    }

    selectShip(typeIndex, orientation, shipItem) {
        if (this.state.phase !== 'SETUP') return;
        
        document.querySelectorAll('.ship-item').forEach(el => el.classList.remove('selected'));
        
        this.selectedShipType = typeIndex;
        this.selectedOrientation = orientation;
        shipItem.classList.add('selected');
    }

    handlePlayerBoardHover(e) {
        if (this.state.phase !== 'SETUP' || this.selectedShipType === null) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const ship = this.config.ships[this.selectedShipType];

        this.clearPreview();
        const positions = this.getShipPositions(row, col, ship.size, this.selectedOrientation);
        
        if (positions && this.isValidPlacement(positions)) {
            positions.forEach(([r, c]) => {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="player"]`);
                if (cell) cell.classList.add('preview-valid');
            });
        } else if (positions) {
            positions.forEach(([r, c]) => {
                if (r < this.config.boardSize && c < this.config.boardSize) {
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="player"]`);
                    if (cell) cell.classList.add('preview-invalid');
                }
            });
        }
    }

    handleEnemyBoardHover(e) {
        if (this.state.phase !== 'BATTLE' || !this.selectedWeapon) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        this.clearAttackPreview();
        const targets = this.selectedWeapon.getTargets(row, col, this.config.boardSize);
        
        targets.forEach(([r, c]) => {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="pc"]`);
            if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
                cell.classList.add('attack-preview');
            }
        });
    }

    handleEnemyBoardLeave(e) {
        this.clearAttackPreview();
    }

    handlePlayerBoardLeave(e) {
        this.clearPreview();
    }

    clearPreview() {
        document.querySelectorAll('.preview-valid, .preview-invalid').forEach(el => {
            el.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    clearAttackPreview() {
        document.querySelectorAll('.attack-preview').forEach(el => {
            el.classList.remove('attack-preview');
        });
    }

    handlePlayerBoardClick(e) {
        if (this.state.phase !== 'SETUP' || this.selectedShipType === null) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const shipConfig = this.config.ships[this.selectedShipType];

        const positions = this.getShipPositions(row, col, shipConfig.size, this.selectedOrientation);

        if (!positions || !this.isValidPlacement(positions)) {
            this.showMessage('Posición inválida. Intenta en otro lugar.', 'error');
            return;
        }

        const ship = new Ship(shipConfig.name, shipConfig.size, positions);
        this.state.playerShips.push(ship);
        
        positions.forEach(([r, c]) => {
            this.state.playerBoard[r][c] = ship;
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="player"]`);
            cell.classList.add('ship-placed');
            cell.style.backgroundColor = shipConfig.color;
        });

        this.shipCounts[this.selectedShipType].placed++;
        
        // Actualizar contador de naves disponibles
        const countEl = document.getElementById(`count-${this.selectedShipType}`);
        if (countEl) {
            countEl.textContent = this.shipCounts[this.selectedShipType].quantity - this.shipCounts[this.selectedShipType].placed;
        }

        const selectedItem = document.querySelector('.ship-item.selected');
        if (selectedItem) {
            selectedItem.classList.remove('selected');
            // Desactivar si no hay más naves de este tipo
            if (this.shipCounts[this.selectedShipType].placed >= this.shipCounts[this.selectedShipType].quantity) {
                selectedItem.style.opacity = '0.5';
                selectedItem.style.pointerEvents = 'none';
            }
        }

        this.selectedShipType = null;
        this.selectedOrientation = 'horizontal';
        
        this.clearPreview();
        this.checkAllShipsPlaced();
    }

    getShipPositions(row, col, size, orientation) {
        const positions = [];
        
        for (let i = 0; i < size; i++) {
            if (orientation === 'horizontal') {
                if (col + i >= this.config.boardSize) return null;
                positions.push([row, col + i]);
            } else {
                if (row + i >= this.config.boardSize) return null;
                positions.push([row + i, col]);
            }
        }
        
        return positions;
    }

    isValidPlacement(positions) {
        return positions.every(([r, c]) => {
            return r < this.config.boardSize && c < this.config.boardSize && this.state.playerBoard[r][c] === null;
        });
    }

    checkAllShipsPlaced() {
        const totalShips = this.config.ships.reduce((sum, ship) => sum + ship.quantity, 0);
        const placedShips = this.state.playerShips.length;

        if (placedShips === totalShips) {
            document.getElementById('startBtn').disabled = false;
            this.showReadyModal();
        }
    }

    showReadyModal() {
        const modal = document.createElement('div');
        modal.className = 'ready-modal';
        modal.innerHTML = `
            <div class="ready-modal-content">
                <div class="ready-checkmark">✅</div>
                <h2>¡Naves Listas!</h2>
                <p>Todos tus barcos han sido colocados correctamente.</p>
                <p class="ready-subtext">Haz clic en el botón para comenzar la batalla.</p>
                <button class="btn-primary" onclick="game.startBattle()">⚔️ Iniciar Batalla</button>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        document.body.appendChild(modal);
        
        // Auto cerrar después de 4 segundos si no se hace clic
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 4000);
    }

    startBattle() {
        this.state.phase = 'BATTLE';
        this.updatePhaseDisplay();
        this.placePCShips();
        
        // Verificar cantidad de barcos del PC
        const pcShipCount = this.state.pcShips.length;
        const playerShipCount = this.state.playerShips.length;
        const expectedShipCount = this.config.ships.reduce((sum, ship) => sum + ship.quantity, 0);
        
        console.log(`Barcos del Jugador: ${playerShipCount}`);
        console.log(`Barcos del PC: ${pcShipCount}`);
        console.log(`Barcos Esperados: ${expectedShipCount}`);
        
        // Si el PC no tiene la cantidad correcta de barcos, reintentar
        if (pcShipCount !== expectedShipCount) {
            console.warn(`Error: El PC tiene ${pcShipCount} barcos, se esperaban ${expectedShipCount}. Reintentando...`);
            this.placePCShips();
        }
        
        document.getElementById('startBtn').style.display = 'none';
        // Ocultar contenedor de naves durante la batalla
        const shipsContainer = document.getElementById('ships');
        if (shipsContainer) {
            shipsContainer.style.display = 'none';
        }
        this.showMessage('¡La batalla ha comenzado! Dispara al tablero enemigo.', 'info');
    }

    placePCShips() {
        // Reiniciar el tablero del PC
        this.state.pcBoard = Array(this.config.boardSize).fill(null).map(() => Array(this.config.boardSize).fill(null));
        this.state.pcShips = [];
        
        this.config.ships.forEach(shipConfig => {
            for (let i = 0; i < shipConfig.quantity; i++) {
                let placed = false;
                let attempts = 0;
                const maxAttempts = 500;
                
                while (!placed && attempts < maxAttempts) {
                    attempts++;
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * this.config.boardSize);
                    const col = Math.floor(Math.random() * this.config.boardSize);
                    const positions = this.getShipPositions(row, col, shipConfig.size, orientation);

                    if (positions && this.isValidPCPlacement(positions)) {
                        const ship = new Ship(shipConfig.name, shipConfig.size, positions);
                        this.state.pcShips.push(ship);
                        positions.forEach(([r, c]) => {
                            this.state.pcBoard[r][c] = ship;
                        });
                        placed = true;
                    }
                }
                
                // Si no se pudo colocar después de los intentos, reintentar con otro tipo
                if (!placed && attempts >= maxAttempts) {
                    console.warn(`No se pudo colocar ${shipConfig.name} del PC. Reintentando...`);
                    i--; // Reintenta este barco
                }
            }
        });
    }

    isValidPCPlacement(positions) {
        return positions.every(([r, c]) => {
            return r < this.config.boardSize && c < this.config.boardSize && this.state.pcBoard[r][c] === null;
        });
    }

    handleAttack(e) {
        if (this.state.phase !== 'BATTLE') return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        const targets = this.selectedWeapon.getTargets(row, col, this.config.boardSize);
        
        const alreadyAttacked = targets.some(([r, c]) => {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="pc"]`);
            return cell && (cell.classList.contains('hit') || cell.classList.contains('miss'));
        });

        if (alreadyAttacked) {
            this.showMessage('Ya disparaste en esa área. Elige otra casilla.', 'warning');
            return;
        }

        if (this.selectedWeapon.uses !== undefined) {
            this.selectedWeapon.uses--;
            if (this.selectedWeapon.uses === 0) {
                this.weapons = this.weapons.filter(w => w !== this.selectedWeapon);
                this.selectedWeapon = this.weapons.length > 0 ? this.weapons[0] : null;
                this.renderWeaponSelection();
                
                // Ocultar contenedor de armas si no hay más armas especiales
                const weaponsContainer = document.getElementById('weapons');
                if (weaponsContainer && this.weapons.length <= 1) {
                    weaponsContainer.style.display = 'none';
                }
            } else {
                this.renderWeaponSelection();
            }
        }

        this.clearAttackPreview();

        let hits = 0;
        targets.forEach(([r, c]) => {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"][data-owner="pc"]`);
            if (!cell) return;

            this.state.currentGame.playerShots++;

            if (this.state.pcBoard[r][c]) {
                const ship = this.state.pcBoard[r][c];
                ship.hit(r, c);
                cell.classList.add('hit');
                this.state.currentGame.playerHits++;
                hits++;

                if (ship.isSunk()) {
                    this.showMessage(`¡Hundiste el ${ship.type} enemigo!`, 'success');
                    this.markShipAsSunk(ship, 'pc');
                }
            } else {
                cell.classList.add('miss');
            }
        });

        if (hits > 0) {
            this.showMessage(hits > 1 ? `¡${hits} impactos!` : '¡Impacto!', 'success');
        } else {
            this.showMessage('Agua. Turno del enemigo...', 'info');
        }

        if (this.checkWin('player')) {
            this.endGame('player');
            return;
        }

        if (this.state.phase === 'BATTLE') {
            setTimeout(() => this.pcAttack(), 1000);
        }
    }

    pcAttack() {
        if (this.state.phase !== 'BATTLE') return;

        let row, col;
        let attempts = 0;
        
        do {
            row = Math.floor(Math.random() * this.config.boardSize);
            col = Math.floor(Math.random() * this.config.boardSize);
            attempts++;
            if (attempts > 200) break;
        } while (this.pcShotHistory.has(`${row},${col}`));

        this.pcShotHistory.add(`${row},${col}`);
        this.state.currentGame.pcShots++;

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-owner="player"]`);
        if (!cell) return;

        if (this.state.playerBoard[row][col]) {
            const ship = this.state.playerBoard[row][col];
            ship.hit(row, col);
            cell.classList.add('hit');
            this.state.currentGame.pcHits++;

            if (ship.isSunk()) {
                this.showMessage(`El enemigo hundió tu ${ship.type}!`, 'error');
                this.markShipAsSunk(ship, 'player');
            } else {
                this.showMessage('¡El enemigo te dio!', 'error');
            }

            if (this.checkWin('pc')) {
                this.endGame('pc');
                return;
            }
        } else {
            cell.classList.add('miss');
            this.showMessage('El enemigo falló. Tu turno.', 'info');
        }
    }

    markShipAsSunk(ship, owner) {
        ship.positions.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"][data-owner="${owner}"]`);
            if (cell) cell.classList.add('sunk');
        });
    }

    checkWin(player) {
        const ships = player === 'player' ? this.state.pcShips : this.state.playerShips;
        return ships.every(ship => ship.isSunk());
    }

    endGame(winner) {
        this.state.phase = 'END';
        this.updatePhaseDisplay();

        const duration = Date.now() - this.state.currentGame.startTime;
        const message = winner === 'player' 
            ? '¡GANASTE! Hundiste todas las naves enemigas!' 
            : 'Perdiste. El enemigo hundió todas tus naves.';

        this.showMessage(message, winner === 'player' ? 'success' : 'error');
        
        this.state.addGameToHistory(
            winner === 'player' ? 'Jugador' : 'PC',
            this.state.currentGame.playerHits,
            this.state.currentGame.pcHits,
            duration
        );

        setTimeout(() => this.showEndGameModal(winner, message), 1500);
    }

    showEndGameModal(winner, message) {
        const modal = document.createElement('div');
        modal.className = 'end-game-modal';
        modal.innerHTML = `
            <div class="end-game-content">
                <div class="end-game-icon">${winner === 'player' ? '🏆' : '💀'}</div>
                <h2>${message}</h2>
                <div class="end-game-stats">
                    <p><strong>Tus impactos:</strong> ${this.state.currentGame.playerHits}</p>
                    <p><strong>Impactos del PC:</strong> ${this.state.currentGame.pcHits}</p>
                    <p><strong>Duración:</strong> ${Math.floor((Date.now() - this.state.currentGame.startTime) / 1000)}s</p>
                </div>
                <div class="end-game-buttons">
                    <button onclick="game.newGame(); this.closest('.end-game-modal').remove();" class="btn-primary">Nueva Partida</button>
                    <button onclick="window.location.href='menu.html'" class="btn-secondary">Menú Principal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    newGame() {
        this.state = new GameState(this.config);
        this.shipCounts = this.config.ships.map(s => ({...s, placed: 0}));
        this.selectedShipType = null;
        this.selectedOrientation = 'horizontal';
        this.pcShotHistory = new Set();
        this.weapons = this.initWeapons();
        this.init();
    }

    showInstructions() {
        const weaponInfo = this.config.weapons ? `
            <h3>Armas Especiales (Modo Guerra)</h3>
            <ul>
                <li><strong>Bomba 💣:</strong> Ataque en área 3x3 (3 usos)</li>
                <li><strong>Misil 🚀:</strong> Ataque lineal de 3 casillas (2 usos)</li>
            </ul>
        ` : '';

        const instructions = `
            <div class="modal"><div class="modal-content">
                <h2>Cómo Jugar</h2>
                <ol>
                    <li><strong>Colocar Naves:</strong> Selecciona una nave (horizontal o vertical) y haz clic en tu tablero (izquierda)</li>
                    <li><strong>Naves Disponibles:</strong> ${this.config.ships.map(s => `${s.quantity} ${s.name}(${s.size})`).join(', ')}</li>
                    <li><strong>Iniciar Batalla:</strong> Cuando todas las naves estén colocadas, haz clic en "Iniciar Batalla"</li>
                    <li><strong>Atacar:</strong> Haz clic en el tablero enemigo (derecha) para disparar</li>
                    <li><strong>Ganar:</strong> Hunde todas las naves enemigas antes de que hundan las tuyas</li>
                </ol>
                ${weaponInfo}
                <p><strong>Colores:</strong></p>
                <ul>
                    <li>🔴 Rojo = Impacto</li>
                    <li>⚪ Gris = Agua (fallo)</li>
                    <li>🔵 Azul = Tu nave</li>
                    <li>⚫ Negro = Nave hundida</li>
                </ul>
                <button onclick="game.closeInstructions()" class="btn-primary">Entendido</button>
            </div></div>
        `;

        const modal = document.createElement('div');
        modal.id = 'instructionsModal';
        modal.innerHTML = instructions;
        document.body.appendChild(modal);
    }

    closeInstructions() {
        const modal = document.getElementById('instructionsModal');
        if (modal) modal.remove();
    }

    showHistory() {
        const history = this.state.gameHistory;
        
        if (history.length === 0) {
            this.showMessage('No hay partidas guardadas aún.', 'info');
            return;
        }

        const historyHTML = `
            <div class="history-modal">
                <div class="history-content">
                    <h2>📊 Historial de Partidas</h2>
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Ganador</th>
                                <th>Tus Impactos</th>
                                <th>Impactos PC</th>
                                <th>Duración</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map((game, index) => `
                                <tr class="history-row ${game.winner === 'Jugador' ? 'victory' : 'defeat'}">
                                    <td>${game.date}</td>
                                    <td>${game.winner === 'Jugador' ? '🏆 Jugador' : '💀 PC'}</td>
                                    <td>${game.playerHits}</td>
                                    <td>${game.pcHits}</td>
                                    <td>${game.duration}s</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button onclick="document.querySelector('.history-modal').remove()" class="btn-primary">Cerrar</button>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.innerHTML = historyHTML;
        document.body.appendChild(modal);
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.className = `message message-${type} visible`;

        setTimeout(() => {
            messageEl.classList.remove('visible');
        }, 3000);
    }
}
