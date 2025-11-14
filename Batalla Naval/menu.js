function loadHistory() {
    const classicHistory = localStorage.getItem('battleshipHistory') || '[]';
    const warHistory = localStorage.getItem('battleshipHistoryWar') || '[]';
    
    return {
        classic: JSON.parse(classicHistory),
        war: JSON.parse(warHistory)
    };
}

function showHistory() {
    const history = loadHistory();
    const allGames = [
        ...history.classic.map(g => ({...g, mode: 'Clásico'})),
        ...history.war.map(g => ({...g, mode: 'Guerra'}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    if (allGames.length === 0) {
        document.getElementById('historyContent').innerHTML = '<p>No hay partidas guardadas aún.</p>';
    } else {
        let tableHTML = '<table class="history-table"><thead><tr><th>Fecha</th><th>Modo</th><th>Ganador</th><th>Impactos J</th><th>Impactos PC</th><th>Duración (s)</th></tr></thead><tbody>';
        
        allGames.forEach(game => {
            tableHTML += `<tr>
                <td>${game.date}</td>
                <td>${game.mode}</td>
                <td class="${game.winner === 'Jugador' ? 'winner' : 'loser'}">${game.winner}</td>
                <td>${game.playerHits}</td>
                <td>${game.pcHits}</td>
                <td>${game.duration}</td>
            </tr>`;
        });
        
        tableHTML += '</tbody></table>';
        document.getElementById('historyContent').innerHTML = tableHTML;
    }
    
    document.getElementById('historyModal').style.display = 'flex';
}

function closeHistory() {
    document.getElementById('historyModal').style.display = 'none';
}

function showInstructions() {
    document.getElementById('instructionsModal').style.display = 'flex';
}

function closeInstructions() {
    document.getElementById('instructionsModal').style.display = 'none';
}
