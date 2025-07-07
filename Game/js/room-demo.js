// Demo Game Room JavaScript - Vollständige Gameplay-Simulation
console.log('Demo Game Room JavaScript loaded');

// Simulierte Scenarios für das Demo
const DEMO_SCENARIOS = [
    { id: 1, scenario: "Den Vater nackt sehen", miseryIndex: 45 },
    { id: 2, scenario: "Sonnenbrand 3. Grades", miseryIndex: 75 },
    { id: 3, scenario: "Handy ins Klo fallen lassen", miseryIndex: 30 },
    { id: 4, scenario: "Beim ersten Date furzen", miseryIndex: 55 },
    { id: 5, scenario: "Im Fahrstuhl stecken bleiben", miseryIndex: 40 },
    { id: 6, scenario: "Mit Socken in eine Pfütze treten", miseryIndex: 25 },
    { id: 7, scenario: "Den Bus verpassen und zu spät kommen", miseryIndex: 35 },
    { id: 8, scenario: "Ein wichtiges Meeting vergessen", miseryIndex: 65 },
    { id: 9, scenario: "Beim Zahnarzt eine Wurzelbehandlung", miseryIndex: 80 },
    { id: 10, scenario: "Den falschen Namen sagen beim Vorstellen", miseryIndex: 20 },
    { id: 11, scenario: "Kaffee über den Laptop verschütten", miseryIndex: 50 },
    { id: 12, scenario: "Im falschen Kino-Film sitzen", miseryIndex: 15 },
    { id: 13, scenario: "Schlüssel im Auto einschließen", miseryIndex: 60 },
    { id: 14, scenario: "Eine Prüfung nicht bestehen", miseryIndex: 70 },
    { id: 15, scenario: "Vor allen Leuten stolpern", miseryIndex: 32 }
];

// Demo Game Room Manager
class DemoGameRoom {
    constructor() {
        this.roomId = null;
        this.playerId = 'demo-player-1';
        this.playerName = 'Du';
        this.isHost = true;
        this.gameState = 'waiting';
        this.currentPlayer = null;
        this.currentCard = null;
        this.playerHand = [];
        this.votingPhase = false;
        this.placementPhase = false;
        this.deck = [...DEMO_SCENARIOS];
        this.round = 1;
        
        // Demo players
        this.players = [
            { id: 'demo-player-1', name: 'Du', avatar: '🎮', cardsWon: 0, isReady: true, hand: [] },
            { id: 'demo-player-2', name: 'Anna', avatar: '👩', cardsWon: 0, isReady: true, hand: [] },
            { id: 'demo-player-3', name: 'Max', avatar: '👨', cardsWon: 0, isReady: true, hand: [] }
        ];
        
        this.initializeDOM();
        this.startDemo();
    }
    
    initializeDOM() {
        console.log('Initializing Demo DOM elements...');
        
        // Get room ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.roomId = urlParams.get('room') || 'DEMO-ROOM';
        
        this.setupUIElements();
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Simulate connection delay
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showWaitingScreen();
            this.updateRoomInfo();
        }, 1500);
    }
    
    setupUIElements() {
        // Loading screen
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingText = document.getElementById('loadingText');
        
        // Header elements
        this.roomCodeElement = document.getElementById('roomCode');
        this.playerCountElement = document.getElementById('playerCount');
        this.roomStatusElement = document.getElementById('roomStatus');
        
        // Waiting screen elements
        this.waitingScreen = document.getElementById('waitingScreen');
        this.shareRoomCodeInput = document.getElementById('shareRoomCode');
        this.shareRoomLinkInput = document.getElementById('shareRoomLink');
        this.startGameBtn = document.getElementById('startGameBtn');
        
        // Gameplay elements
        this.gameplayArea = document.getElementById('gameplayArea');
        this.playersListElement = document.getElementById('playersList');
        this.gameLog = document.getElementById('gameLog');
        this.currentCardElement = document.getElementById('currentCard');
        this.playerHandElement = document.getElementById('playerHand');
        this.placementArea = document.getElementById('placementArea');
        this.votingArea = document.getElementById('votingArea');
        this.drawCardSection = document.getElementById('drawCardSection');
        
        // Buttons
        this.leaveRoomBtn = document.getElementById('leaveRoomBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
        this.drawCardBtn = document.getElementById('drawCardBtn');
        this.voteYesBtn = document.getElementById('voteYesBtn');
        this.voteNoBtn = document.getElementById('voteNoBtn');
    }
    
    setupEventListeners() {
        console.log('Setting up demo event listeners...');
        
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', () => this.startGame());
        }
        
        if (this.leaveRoomBtn) {
            this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());
        }
        
        if (this.copyCodeBtn) {
            this.copyCodeBtn.addEventListener('click', () => this.copyRoomCode());
        }
        
        if (this.copyLinkBtn) {
            this.copyLinkBtn.addEventListener('click', () => this.copyRoomLink());
        }
        
        if (this.drawCardBtn) {
            this.drawCardBtn.addEventListener('click', () => this.drawCard());
        }
        
        if (this.voteYesBtn) {
            this.voteYesBtn.addEventListener('click', () => this.submitVote(true));
        }
        
        if (this.voteNoBtn) {
            this.voteNoBtn.addEventListener('click', () => this.submitVote(false));
        }
    }
    
    startDemo() {
        this.addLogEntry('Demo-Modus gestartet - Alle Funktionen werden simuliert', 'info');
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.style.opacity = '1';
        }
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300);
        }
    }
    
    showWaitingScreen() {
        if (this.waitingScreen) {
            this.waitingScreen.style.display = 'block';
        }
        if (this.gameplayArea) {
            this.gameplayArea.style.display = 'none';
        }
    }
    
    showGameplayArea() {
        if (this.waitingScreen) {
            this.waitingScreen.style.display = 'none';
        }
        if (this.gameplayArea) {
            this.gameplayArea.style.display = 'block';
        }
    }
    
    updateRoomInfo() {
        if (this.roomCodeElement) {
            this.roomCodeElement.textContent = this.roomId;
        }
        
        if (this.shareRoomCodeInput) {
            this.shareRoomCodeInput.value = this.roomId;
        }
        
        if (this.shareRoomLinkInput) {
            this.shareRoomLinkInput.value = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        }
        
        if (this.playerCountElement) {
            this.playerCountElement.textContent = this.players.length;
        }
        
        const statusMap = {
            'waiting': 'Warten auf Spieler...',
            'playing': 'Spiel läuft',
            'finished': 'Spiel beendet'
        };
        
        if (this.roomStatusElement) {
            this.roomStatusElement.textContent = statusMap[this.gameState] || 'Demo-Modus';
        }
        
        if (this.startGameBtn) {
            this.startGameBtn.style.display = this.isHost && this.gameState === 'waiting' ? 'block' : 'none';
        }
        
        this.updatePlayersList();
        this.updateGameStats();
    }
    
    updatePlayersList() {
        if (!this.playersListElement) return;
        
        this.playersListElement.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            if (player.id === this.playerId) {
                playerCard.classList.add('is-host');
                playerCard.classList.add('is-current-player');
            }
            
            const isCurrentTurn = this.currentPlayer === player.id;
            const turnIndicator = isCurrentTurn ? '🎯 ' : '';
            
            playerCard.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-info">
                    <div class="player-name">${turnIndicator}${player.name}</div>
                    <div class="player-status">
                        ${player.id === this.playerId ? '👑 Host' : ''}
                        ${player.isReady ? '✅ Bereit' : '⏳ Wartet'}
                        ${isCurrentTurn ? '🎲 Am Zug' : ''}
                    </div>
                </div>
                <div class="player-score">${player.cardsWon}/10</div>
            `;
            
            this.playersListElement.appendChild(playerCard);
        });
    }
    
    updateGameStats() {
        const currentRoundElement = document.getElementById('currentRound');
        const cardsInDeckElement = document.getElementById('cardsInDeck');
        const cardsWonElement = document.getElementById('cardsWon');
        
        if (currentRoundElement) {
            currentRoundElement.textContent = this.round;
        }
        
        if (cardsInDeckElement) {
            cardsInDeckElement.textContent = this.deck.length;
        }
        
        if (cardsWonElement) {
            const currentPlayer = this.players.find(p => p.id === this.playerId);
            cardsWonElement.textContent = currentPlayer?.cardsWon || 0;
        }
    }
    
    async startGame() {
        console.log('Starting demo game...');
        
        this.gameState = 'playing';
        this.showLoadingScreen();
        this.updateLoadingText('Spiel wird vorbereitet...');
        
        // Simulate game setup delay
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showGameplayArea();
            this.updateRoomInfo();
            
            // Deal initial cards to all players
            this.dealInitialCards();
            
            // Start first turn
            this.currentPlayer = this.playerId;
            this.updateTurnInfo();
            this.updateDrawCardButton();
            
            this.addLogEntry('🎮 Demo-Spiel gestartet! Du bist am Zug.', 'success');
            this.addLogEntry('Ziehe eine Karte und platziere sie in deiner Hand.', 'info');
        }, 2000);
    }
    
    dealInitialCards() {
        // Give each player 3 random cards
        this.players.forEach(player => {
            player.hand = [];
            for (let i = 0; i < 3; i++) {
                if (this.deck.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.deck.length);
                    const card = this.deck.splice(randomIndex, 1)[0];
                    player.hand.push(card);
                }
            }
        });
        
        // Update player hand display
        const currentPlayer = this.players.find(p => p.id === this.playerId);
        this.playerHand = currentPlayer.hand;
        this.updateHandDisplay();
    }
    
    updateTurnInfo() {
        const currentPlayerElement = document.getElementById('currentPlayerName');
        const currentPlayerAvatar = document.getElementById('currentPlayerAvatar');
        
        if (this.currentPlayer && currentPlayerElement) {
            const currentPlayer = this.players.find(p => p.id === this.currentPlayer);
            if (currentPlayer) {
                currentPlayerElement.textContent = currentPlayer.name;
                if (currentPlayerAvatar) {
                    currentPlayerAvatar.alt = currentPlayer.name;
                }
            }
        }
    }
    
    updateDrawCardButton() {
        if (this.drawCardSection) {
            const isCurrentPlayer = this.currentPlayer === this.playerId;
            const hasCurrentCard = !!this.currentCard;
            
            this.drawCardSection.style.display = (isCurrentPlayer && !hasCurrentCard) ? 'block' : 'none';
        }
    }
    
    async drawCard() {
        if (this.currentPlayer !== this.playerId) {
            this.showToast('Du bist nicht am Zug', 'warning');
            return;
        }
        
        if (this.deck.length === 0) {
            this.showToast('Keine Karten mehr im Deck', 'error');
            return;
        }
        
        // Draw random card
        const randomIndex = Math.floor(Math.random() * this.deck.length);
        this.currentCard = this.deck.splice(randomIndex, 1)[0];
        
        this.addLogEntry(`Karte gezogen: "${this.currentCard.scenario}"`, 'info');
        this.displayCurrentCard(this.currentCard);
        this.updateDrawCardButton();
        this.updateGameStats();
        
        // Start placement phase for OTHER players (not the active player)
        setTimeout(() => {
            this.addLogEntry('Andere Spieler können jetzt versuchen, die Karte zu platzieren!', 'info');
            this.simulateOtherPlayersPlacement();
        }, 1000);
    }
    
    displayCurrentCard(card) {
        if (!this.currentCardElement || !card) return;
        
        this.currentCardElement.innerHTML = `
            <div class="card current-card" id="currentCardDraggable">
                <div class="card-header">SHIT HAPPENS</div>
                <div class="card-content">
                    <div class="card-scenario">${card.scenario}</div>
                </div>
                <div class="card-footer">
                    <div class="misery-label">MISERY INDEX</div>
                    <div class="misery-index">${card.miseryIndex}</div>
                </div>
            </div>
        `;
        
        this.currentCardElement.classList.add('card-revealed');
        
        // Enable drag & drop for demo
        setTimeout(() => {
            this.enableDragAndDrop();
        }, 1000);
    }
    
    enableDragAndDrop() {
        const currentCardElement = document.getElementById('currentCardDraggable');
        const instructionsElement = document.getElementById('placementInstructions');
        
        if (currentCardElement) {
            currentCardElement.draggable = true;
            currentCardElement.classList.add('draggable');
            
            if (instructionsElement) {
                instructionsElement.style.display = 'block';
            }
            
            this.addLogEntry('💡 Demo: Ziehe die Karte an die richtige Position!', 'info');
        }
    }
    
    updateHandDisplay() {
        if (!this.playerHandElement || !this.playerHand) return;
        
        this.playerHandElement.innerHTML = '';
        
        // Sort hand by misery index
        const sortedHand = [...this.playerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
        
        if (sortedHand.length === 0) {
            this.playerHandElement.innerHTML = '<div class="empty-hand">Keine Karten in der Hand</div>';
            return;
        }
        
        // Create hand with drop zones for demo
        const handContainer = document.createElement('div');
        handContainer.className = 'hand-with-drops';
        
        // Add initial drop zone
        const firstDropZone = this.createDropZone(0, 'Anfang');
        handContainer.appendChild(firstDropZone);
        
        // Add cards with drop zones between them
        sortedHand.forEach((card, index) => {
            // Add card
            const cardElement = this.createHandCard(card, index);
            handContainer.appendChild(cardElement);
            
            // Add drop zone after card (except after last card)
            if (index < sortedHand.length - 1) {
                const dropZone = this.createDropZone(index + 1, `Position ${index + 2}`);
                handContainer.appendChild(dropZone);
            }
        });
        
        // Add final drop zone
        const lastDropZone = this.createDropZone(sortedHand.length, 'Ende');
        handContainer.appendChild(lastDropZone);
        
        this.playerHandElement.appendChild(handContainer);
    }
    
    createHandCard(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card hand-card';
        cardElement.innerHTML = `
            <div class="card-header">SHIT HAPPENS</div>
            <div class="card-content">
                <div class="card-scenario">${card.scenario}</div>
            </div>
            <div class="card-footer">
                <div class="misery-label">MISERY INDEX</div>
                <div class="misery-index">${card.miseryIndex}</div>
            </div>
        `;
        
        return cardElement;
    }
    
    createDropZone(position, label) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.textContent = label;
        dropZone.dataset.position = position;
        
        // Add click handler for demo (simpler than drag/drop)
        dropZone.addEventListener('click', () => {
            if (this.currentCard) {
                this.placeCard(position);
            }
        });
        
        return dropZone;
    }
    
    // Removed old placement phase - now using direct drag & drop / click placement
    
    async placeCard(position) {
        if (!this.currentCard) return;
        
        // Calculate correct placement
        const newCard = this.currentCard;
        const sortedHand = [...this.playerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
        
        let correctPosition = 0;
        for (let i = 0; i < sortedHand.length; i++) {
            if (newCard.miseryIndex > sortedHand[i].miseryIndex) {
                correctPosition = i + 1;
            }
        }
        
        const isCorrect = position === correctPosition;
        
        // Hide instructions
        const instructionsElement = document.getElementById('placementInstructions');
        if (instructionsElement) {
            instructionsElement.style.display = 'none';
        }
        
        if (isCorrect) {
            this.addLogEntry(`✅ Korrekt! Position ${position + 1} war richtig (Misery Index: ${newCard.miseryIndex})`, 'success');
            
            // Add card to hand
            this.playerHand.splice(position, 0, newCard);
            
            const currentPlayer = this.players.find(p => p.id === this.playerId);
            currentPlayer.cardsWon += 1;
            
            this.updateHandDisplay();
            this.updateGameStats();
            
            // Check win condition
            if (currentPlayer.cardsWon >= 10) {
                this.endGame(currentPlayer);
                return;
            }
            
            this.addLogEntry('🎉 Du bekommst die Karte und sie wird deiner Hand hinzugefügt!', 'success');
        } else {
            this.addLogEntry(`❌ Falsch! Position ${position + 1} ist nicht korrekt. Richtige Position wäre ${correctPosition + 1} (Misery Index: ${newCard.miseryIndex})`, 'error');
            this.addLogEntry('Demo: In einem echten Spiel würde jetzt der nächste Spieler versuchen!', 'info');
        }
        
        // Reset for next turn
        this.currentCard = null;
        this.currentCardElement.innerHTML = `
            <div class="card-placeholder">
                <i class="fas fa-question"></i>
                <p>Warte auf gezogene Karte...</p>
            </div>
        `;
        
        // Next turn (simulate other players)
        setTimeout(() => {
            this.nextTurn();
        }, 2000);
    }
    
    nextTurn() {
        // Simulate other players' turns
        const currentIndex = this.players.findIndex(p => p.id === this.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.players.length;
        this.currentPlayer = this.players[nextIndex].id;
        
        this.currentCard = null;
        this.currentCardElement.innerHTML = `
            <div class="card-placeholder">
                <i class="fas fa-question"></i>
                <p>Warte auf gezogene Karte...</p>
            </div>
        `;
        
        this.updateTurnInfo();
        this.updateDrawCardButton();
        this.updatePlayersList();
        
        const currentPlayer = this.players.find(p => p.id === this.currentPlayer);
        this.addLogEntry(`${currentPlayer.name} ist am Zug und kann eine Karte ziehen`, 'info');
        
        // Simulate AI players
        if (this.currentPlayer !== this.playerId) {
            setTimeout(() => {
                this.simulateAITurn();
            }, 2000);
        }
    }
    
    simulateAITurn() {
        const currentPlayer = this.players.find(p => p.id === this.currentPlayer);
        if (!currentPlayer) return;
        
        this.addLogEntry(`${currentPlayer.name} zieht eine Karte...`, 'info');
        
        // Draw card for AI
        if (this.deck.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.deck.length);
            const card = this.deck.splice(randomIndex, 1)[0];
            
            this.addLogEntry(`${currentPlayer.name} hat "${card.scenario}" gezogen`, 'info');
            
            // Show the card briefly
            this.displayCurrentCard(card);
            this.currentCard = card;
            
            setTimeout(() => {
                this.addLogEntry(`Andere Spieler können jetzt versuchen zu platzieren...`, 'info');
                
                // Simulate other players trying to place (including the human player in demo)
                const otherPlayers = this.players.filter(p => p.id !== this.currentPlayer);
                
                // Random chance that one of the other players gets it right
                const successfulPlayer = Math.random() > 0.4 ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)] : null;
                
                if (successfulPlayer) {
                    setTimeout(() => {
                        this.addLogEntry(`${successfulPlayer.name} versucht zu platzieren...`, 'info');
                        
                        setTimeout(() => {
                            successfulPlayer.cardsWon += 1;
                            successfulPlayer.hand.push(card);
                            this.addLogEntry(`✅ ${successfulPlayer.name} hat korrekt platziert!`, 'success');
                            
                            if (successfulPlayer.cardsWon >= 10) {
                                this.endGame(successfulPlayer);
                                return;
                            }
                            
                            this.updateGameStats();
                            this.nextTurn();
                        }, 1500);
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.addLogEntry(`❌ Niemand konnte die Karte korrekt platzieren`, 'error');
                        this.nextTurn();
                    }, 2000);
                }
            }, 1500);
        }
    }
    
    endGame(winner) {
        this.gameState = 'finished';
        this.addLogEntry(`🎉 ${winner.name} hat gewonnen!`, 'success');
        this.showToast(`🎉 ${winner.name} hat das Spiel gewonnen!`, 'success');
        
        // Show game end modal
        setTimeout(() => {
            this.showGameEndModal(winner);
        }, 2000);
    }
    
    showGameEndModal(winner) {
        const modal = document.getElementById('gameEndModal');
        const winnerName = document.getElementById('winnerName');
        const finalScores = document.getElementById('finalScores');
        
        if (modal) {
            modal.style.display = 'flex';
        }
        
        if (winnerName) {
            winnerName.textContent = winner.name;
        }
        
        if (finalScores) {
            finalScores.innerHTML = '';
            
            // Sort players by cards won
            const sortedPlayers = [...this.players].sort((a, b) => b.cardsWon - a.cardsWon);
            
            sortedPlayers.forEach((player, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                if (index === 0) scoreItem.classList.add('winner');
                
                scoreItem.innerHTML = `
                    <span>${player.avatar} ${player.name}</span>
                    <span>${player.cardsWon}/10 Karten</span>
                `;
                
                finalScores.appendChild(scoreItem);
            });
        }
    }
    
    updateLoadingText(text) {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
    
    async submitVote(vote) {
        this.showToast(`Du hast ${vote ? 'Richtig' : 'Falsch'} gestimmt`, 'info');
        this.addLogEntry(`Stimme abgegeben: ${vote ? 'Richtig' : 'Falsch'}`, 'info');
    }
    
    leaveRoom() {
        this.showToast('Demo verlassen...', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
    
    copyRoomCode() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                this.showToast('Raum-Code kopiert!', 'success');
            });
        }
    }
    
    copyRoomLink() {
        const link = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                this.showToast('Raum-Link kopiert!', 'success');
            });
        }
    }
    
    addLogEntry(message, type = 'info') {
        if (!this.gameLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        const now = new Date();
        const time = now.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        logEntry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;
        
        this.gameLog.appendChild(logEntry);
        this.gameLog.scrollTop = this.gameLog.scrollHeight;
        
        // Keep only last 50 entries
        while (this.gameLog.children.length > 50) {
            this.gameLog.removeChild(this.gameLog.firstChild);
        }
    }
    
    showToast(message, type = 'info') {
        console.log(`Toast [${type}]: ${message}`);
        
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check',
            error: 'fas fa-times',
            warning: 'fas fa-exclamation',
            info: 'fas fa-info'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => toast.remove());
        }
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    simulateOtherPlayersPlacement() {
        // In der Demo simulieren wir, dass andere Spieler versuchen zu platzieren
        const otherPlayers = this.players.filter(p => p.id !== this.currentPlayer);
        
        this.addLogEntry('Demo: Simuliere Platzierungsversuche anderer Spieler...', 'info');
        
        // Zufällig bestimmen, wer als erstes versucht
        const attemptingPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        
        setTimeout(() => {
            this.addLogEntry(`${attemptingPlayer.name} versucht die Karte zu platzieren...`, 'info');
            
            // Zufällige Chance für korrektes Platzieren (70% Chance)
            const isCorrect = Math.random() > 0.3;
            
            setTimeout(() => {
                if (isCorrect) {
                    // Korrekt platziert - Spieler bekommt die Karte
                    attemptingPlayer.cardsWon += 1;
                    attemptingPlayer.hand.push(this.currentCard);
                    
                    this.addLogEntry(`✅ ${attemptingPlayer.name} hat korrekt platziert und bekommt die Karte!`, 'success');
                    
                    // Check win condition
                    if (attemptingPlayer.cardsWon >= 10) {
                        this.endGame(attemptingPlayer);
                        return;
                    }
                    
                    // Next turn
                    this.nextTurn();
                    
                } else {
                    // Falsch platziert - nächster Spieler darf versuchen
                    this.addLogEntry(`❌ ${attemptingPlayer.name} hat falsch platziert.`, 'error');
                    
                    const remainingPlayers = otherPlayers.filter(p => p.id !== attemptingPlayer.id);
                    
                    if (remainingPlayers.length > 0) {
                        // Nächster Spieler versucht
                        const nextPlayer = remainingPlayers[0];
                        
                        setTimeout(() => {
                            this.addLogEntry(`${nextPlayer.name} versucht es als nächstes...`, 'info');
                            
                            // Dieser Versuch ist fast immer erfolgreich (90% Chance)
                            const secondAttemptSuccess = Math.random() > 0.1;
                            
                            setTimeout(() => {
                                if (secondAttemptSuccess) {
                                    nextPlayer.cardsWon += 1;
                                    nextPlayer.hand.push(this.currentCard);
                                    this.addLogEntry(`✅ ${nextPlayer.name} hat es geschafft!`, 'success');
                                    
                                    if (nextPlayer.cardsWon >= 10) {
                                        this.endGame(nextPlayer);
                                        return;
                                    }
                                } else {
                                    this.addLogEntry(`❌ Niemand konnte die Karte korrekt platzieren. Karte wird verworfen.`, 'warning');
                                }
                                
                                this.nextTurn();
                            }, 1500);
                        }, 1000);
                    } else {
                        // Alle haben versucht und versagt
                        this.addLogEntry(`❌ Alle Spieler haben versagt. Karte wird verworfen.`, 'warning');
                        this.nextTurn();
                    }
                }
            }, 2000);
        }, 1000);
    }
}

// Initialize demo game room when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Demo Game Room...');
    try {
        window.demoGameRoom = new DemoGameRoom();
    } catch (error) {
        console.error('Error initializing Demo Game Room:', error);
        
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4757;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        errorContainer.innerHTML = `
            <h3>Fehler beim Laden des Demo-Spielraums</h3>
            <p>${error.message || 'Unbekannter Fehler'}</p>
            <button onclick="window.location.href='../index.html'" 
                    style="background: white; color: #ff4757; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                Zurück zur Startseite
            </button>
        `;
        document.body.appendChild(errorContainer);
    }
});
