// Modern Game Room JavaScript for SHIT HAPPENS - Multiplayer Firebase Version
console.log('Game Room JavaScript loaded');

// Import Firebase modules
import { AuthManager, RoomManager, GameStateManager, generateAvatar } from './firebase-config.js';

// Game Room Manager Class
class GameRoom {
    constructor() {
        this.roomId = null;
        this.playerId = null;
        this.playerName = null;
        this.isHost = false;
        this.roomData = null;
        this.scenarios = [];
        this.currentCard = null;
        this.playerHand = [];
        this.unsubscribeRoom = null;
        this.votingPhase = false;
        this.placementPhase = false;
        this.isStartingGame = false; // Flag um mehrfache Spielstarts zu verhindern
        
        // Firebase managers
        this.authManager = new AuthManager();
        this.roomManager = new RoomManager();
        this.gameStateManager = new GameStateManager(this.roomManager);
        
        this.initializeDOM();
        this.loadScenarios();
        this.setupAuth();
    }
    
    
    initializeDOM() {
        console.log('Initializing DOM elements...');
        
        // Get room ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.roomId = urlParams.get('room');
        
        if (!this.roomId) {
            this.showToast('Keine Raum-ID gefunden', 'error');
            setTimeout(() => window.location.href = '../index.html', 2000);
            return;
        }
        
        // Initialize UI elements
        this.setupUIElements();
        this.setupEventListeners();
        
        // Show loading screen initially
        this.showLoadingScreen();
    }
    
    setupAuth() {
        this.authManager.onAuthStateChanged((user) => {
            if (user) {
                this.playerId = user.uid;
                this.playerName = user.displayName || `Spieler${Math.floor(Math.random() * 1000)}`;
                this.joinRoom();
            } else {
                // Sign in anonymously
                this.authManager.signInAnonymously().catch(error => {
                    console.error('Auth error:', error);
                    this.showToast('Authentifizierung fehlgeschlagen', 'error');
                });
            }
        });
    }
    
    async joinRoom() {
        try {
            this.updateLoadingText('Raum beitreten...');
            
            const player = {
                id: this.playerId,
                name: this.playerName,
                avatar: generateAvatar(this.playerId),
                cardsWon: 0,
                isReady: true,
                hand: [],
                joinedAt: new Date()
            };
            
            await this.roomManager.joinRoom(this.roomId, player);
            this.setupRoomListener();
            
        } catch (error) {
            console.error('Error joining room:', error);
            this.showToast(error.message || 'Fehler beim Beitreten', 'error');
            setTimeout(() => window.location.href = '../index.html', 2000);
        }
    }
    
    setupRoomListener() {
        this.unsubscribeRoom = this.roomManager.listenToRoom(this.roomId, (roomData) => {
            this.handleRoomUpdate(roomData);
        });
    }
    
    handleRoomUpdate(roomData) {
        console.log('Room update:', roomData);
        this.roomData = roomData;
        
        // Check if player is host
        this.isHost = roomData.hostId === this.playerId;
        
        // Get current player data
        const currentPlayer = roomData.players?.find(p => p.id === this.playerId);
        if (currentPlayer) {
            this.playerHand = currentPlayer.hand || [];
        }
        
        // Update UI based on game state
        switch (roomData.gameState || roomData.status) {
            case 'waiting':
                this.hideLoadingScreen();
                this.showWaitingScreen();
                break;
            case 'playing':
                this.hideLoadingScreen();
                this.showGameplayArea();
                this.handleGameplayUpdate(roomData);
                break;
            case 'finished':
                this.handleGameEnd(roomData);
                break;
        }
        
        this.updateRoomInfo();
    }
    
    handleGameplayUpdate(roomData) {
        // Update current card display
        if (roomData.currentCard) {
            this.displayCurrentCard(roomData.currentCard);
        }
        
        // Update hand display  
        this.updateHandDisplay();
        
        // Update turn info
        this.updateTurnInfo(roomData);
        
        // Show/hide draw card button (only for host when no card active)
        this.updateDrawCardButton(roomData);
        
        // Handle placement phase - during placement, ALL players place simultaneously
        if (roomData.placementPhase && roomData.currentCard) {
            this.handlePlacementPhase(roomData);
        } else {
            this.hidePlacementInterface();
        }
        
        // Update game stats
        this.updateGameStats(roomData);
        
        // Update game log
        if (roomData.lastAction) {
            this.addLogEntry(roomData.lastAction.message, roomData.lastAction.type || 'info');
        }
    }
    
    handlePlacementPhase(roomData) {
        // Show placement interface for all players
        this.showPlacementInterface();
        
        // Check if all players have placed
        if (this.isHost && this.allPlayersHavePlaced(roomData)) {
            // All players have placed, start evaluation
            setTimeout(() => {
                this.evaluateSimultaneousPlacements();
            }, 1000);
        }
    }
    
    allPlayersHavePlaced(roomData) {
        const totalPlayers = roomData.players?.length || 0;
        const placedPlayers = Object.keys(roomData.playerPlacements || {}).length;
        
        // All players should place (in real game, there's no "current player" during placement)
        return placedPlayers >= totalPlayers;
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
        
        // Buttons
        this.leaveRoomBtn = document.getElementById('leaveRoomBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
        this.drawCardBtn = document.getElementById('drawCardBtn');
        this.voteYesBtn = document.getElementById('voteYesBtn');
        this.voteNoBtn = document.getElementById('voteNoBtn');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Button events
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
        
        // Window beforeunload event
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    async loadScenarios() {
        try {
            // Load scenarios from scenarios.js
            const scenariosModule = await import('../data/scenarios.js');
            this.scenarios = scenariosModule.scenarios || scenariosModule.default;
            console.log('Scenarios loaded:', this.scenarios.length);
        } catch (error) {
            console.error('Error loading scenarios:', error);
            // Fallback scenarios
            this.scenarios = [
                { id: 1, scenario: "Den Vater nackt sehen", miseryIndex: 45 },
                { id: 2, scenario: "Sonnenbrand 3. Grades", miseryIndex: 75 },
                { id: 3, scenario: "Handy ins Klo fallen lassen", miseryIndex: 30 },
                { id: 4, scenario: "Beim ersten Date furzen", miseryIndex: 55 },
                { id: 5, scenario: "Im Fahrstuhl stecken bleiben", miseryIndex: 40 }
            ];
        }
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.style.opacity = '1';
        }
    }
    
    updateLoadingText(text) {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
    
    updateRoomInfo() {
        if (!this.roomData) return;
        
        // Update room code display
        if (this.roomCodeElement) {
            this.roomCodeElement.textContent = this.roomId;
        }
        
        if (this.shareRoomCodeInput) {
            this.shareRoomCodeInput.value = this.roomId;
        }
        
        if (this.shareRoomLinkInput) {
            this.shareRoomLinkInput.value = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        }
        
        // Update player count
        if (this.playerCountElement) {
            this.playerCountElement.textContent = this.roomData.players?.length || 0;
        }
        
        // Update room status
        if (this.roomStatusElement) {
            const statusMap = {
                'waiting': 'Warten auf Spieler...',
                'playing': 'Spiel läuft',
                'finished': 'Spiel beendet'
            };
            const status = this.roomData.gameState || this.roomData.status;
            this.roomStatusElement.textContent = statusMap[status] || 'Unbekannt';
        }
        
        // Show/hide start button for host
        if (this.startGameBtn) {
            const canStart = this.isHost && 
                           (this.roomData.gameState || this.roomData.status) === 'waiting' && 
                           this.roomData.players?.length >= 2;
            this.startGameBtn.style.display = canStart ? 'block' : 'none';
        }
        
        this.updatePlayersList();
    }
    
    updatePlayersList() {
        if (!this.playersListElement || !this.roomData?.players) return;
        
        this.playersListElement.innerHTML = '';
        
        this.roomData.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            if (player.id === this.roomData.hostId) {
                playerCard.classList.add('is-host');
            }
            
            if (player.id === this.playerId) {
                playerCard.classList.add('is-current-player');
            }
            
            const playerScore = this.roomData.playerHands?.[player.id]?.score || 0;
            const playerHandSize = this.roomData.playerHands?.[player.id]?.hand?.length || 0;
            
            let statusText = '';
            if (player.id === this.roomData.hostId) statusText += '👑 Host ';
            if (player.isReady) statusText += '✅ Bereit ';
            
            // Show placement status during placement phase
            if (this.roomData.placementPhase) {
                const hasPlaced = this.roomData.playerPlacements?.[player.id] != null;
                statusText += hasPlaced ? '📍 Platziert ' : '⏳ Platziert... ';
            }
            
            playerCard.innerHTML = `
                <div class="player-avatar">${player.avatar || player.name.charAt(0)}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">${statusText || '⏳ Wartet'}</div>
                    <div class="player-hand-info">${playerHandSize} Karten</div>
                </div>
                <div class="player-score">${playerScore}/10</div>
            `;
            
            this.playersListElement.appendChild(playerCard);
        });
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
    
    async startGame() {
        console.log('Starting game...');
        
        if (!this.isHost) {
            this.showToast('Nur der Host kann das Spiel starten', 'warning');
            return;
        }
        
        if (this.roomData.players.length < 2) {
            this.showToast('Mindestens 2 Spieler benötigt', 'warning');
            return;
        }
        
        // Prüfe ob Spiel bereits läuft oder gestartet wird
        if (this.roomData.gameState === 'playing' || this.roomData.status === 'playing') {
            console.log('Game already started or in progress');
            return;
        }
        
        // Temporärer Flag um mehrfache Aufrufe zu verhindern
        if (this.isStartingGame) {
            console.log('Game start already in progress');
            return;
        }
        
        this.isStartingGame = true;
        
        try {
            this.updateLoadingText('Spiel wird vorbereitet...');
            this.showLoadingScreen();
            
            // Initialisiere Spieler-Hände mit Startkarten
            const initialCards = this.scenarios.slice(0, 4).sort((a, b) => a.miseryIndex - b.miseryIndex);
            const playerHands = {};
            
            this.roomData.players.forEach(player => {
                playerHands[player.id] = {
                    hand: [...initialCards],
                    score: 0
                };
            });
            
            // Spiel starten
            await this.roomManager.updateRoom(this.roomId, {
                gameState: 'playing',
                status: 'playing',
                gameStarted: true,
                playerHands: playerHands,
                currentCard: null,
                placementPhase: false,
                playerPlacements: {},
                placementTimer: 60,
                placementStartTime: null,
                round: 1,
                lastAction: {
                    message: 'Spiel gestartet! Alle Spieler haben 4 Startkarten erhalten.',
                    type: 'success'
                }
            });
            
            this.addLogEntry('Spiel gestartet! Alle Spieler haben ihre Startkarten erhalten.', 'success');
            this.addLogEntry('Host kann jetzt eine Karte ziehen, um eine Runde zu starten.', 'info');
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showToast('Fehler beim Spielstart', 'error');
            this.hideLoadingScreen();
        } finally {
            this.isStartingGame = false;
        }
    }
    
    async drawCard() {
        if (!this.isHost) {
            this.showToast('Nur der Host kann Karten ziehen', 'warning');
            return;
        }
        
        if (this.roomData.gameState !== 'playing') {
            this.showToast('Spiel ist nicht aktiv', 'warning');
            return;
        }
        
        if (this.roomData.currentCard) {
            this.showToast('Es ist bereits eine Karte aktiv', 'warning');
            return;
        }
        
        try {
            // Get random scenario
            const randomIndex = Math.floor(Math.random() * this.scenarios.length);
            const card = this.scenarios[randomIndex];
            
            // Start simultaneous placement phase - ALL players place at once
            await this.roomManager.updateRoom(this.roomId, {
                currentCard: card,
                cardDrawnAt: new Date().toISOString(),
                placementPhase: true,
                playerPlacements: {},
                placementTimer: 60,
                placementStartTime: Date.now(),
                lastAction: {
                    message: `📋 Neue Karte: "${card.scenario}" - Alle Spieler platzieren jetzt gleichzeitig!`,
                    type: 'info'
                }
            });
            
            this.addLogEntry(`🎯 Neue Runde: "${card.scenario}"`, 'info');
            this.addLogEntry(`⏰ Alle Spieler haben 60 Sekunden Zeit zum Platzieren`, 'info');
            
            // Auto-evaluate after timer
            setTimeout(() => {
                if (this.isHost) {
                    this.evaluateSimultaneousPlacements();
                }
            }, 62000); // 60 seconds + 2 seconds buffer
            
        } catch (error) {
            console.error('Error drawing card:', error);
            this.showToast('Fehler beim Karten ziehen', 'error');
        }
    }

    async evaluateSimultaneousPlacements() {
        if (!this.isHost || !this.roomData.currentCard) return;
        
        const currentCard = this.roomData.currentCard;
        const placements = this.roomData.playerPlacements || {};
        
        // Calculate results for all players who placed
        const results = {};
        let firstCorrectPlayerId = null;
        let firstCorrectTimestamp = null;
        
        for (const [playerId, placement] of Object.entries(placements)) {
            const playerHand = this.roomData.playerHands?.[playerId]?.hand || [];
            const sortedHand = [...playerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
            
            // Find correct position
            let correctPosition = 0;
            for (let i = 0; i < sortedHand.length; i++) {
                if (currentCard.miseryIndex > sortedHand[i].miseryIndex) {
                    correctPosition = i + 1;
                }
            }
            
            const isCorrect = placement.position === correctPosition;
            results[playerId] = {
                position: placement.position,
                correctPosition: correctPosition,
                correct: isCorrect,
                timestamp: placement.timestamp,
                playerName: placement.playerName || 'Unbekannt'
            };
            
            // Track first correct player (by timestamp)
            if (isCorrect && (!firstCorrectPlayerId || placement.timestamp < firstCorrectTimestamp)) {
                firstCorrectPlayerId = playerId;
                firstCorrectTimestamp = placement.timestamp;
            }
        }
        
        // Award card to first correct player or discard
        if (firstCorrectPlayerId) {
            await this.awardCardToPlayer(firstCorrectPlayerId, currentCard, results);
        } else {
            await this.discardCard(currentCard, results);
        }
        
        // Show detailed results
        this.showEvaluationResults(results, currentCard.miseryIndex, firstCorrectPlayerId);
        
        // Next round after short delay
        setTimeout(() => {
            this.prepareNextRound();
        }, 4000);
    }
    
    async awardCardToPlayer(playerId, card, results) {
        const player = this.roomData.players.find(p => p.id === playerId);
        const currentHand = this.roomData.playerHands?.[playerId]?.hand || [];
        const correctPosition = results[playerId].correctPosition;
        
        // Add card to player's hand at correct position
        const sortedHand = [...currentHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
        const newHand = [...sortedHand];
        newHand.splice(correctPosition, 0, card);
        
        const newScore = (this.roomData.playerHands?.[playerId]?.score || 0) + 1;
        
        await this.roomManager.updateRoom(this.roomId, {
            [`playerHands.${playerId}.hand`]: newHand,
            [`playerHands.${playerId}.score`]: newScore,
            lastAction: {
                message: `🎉 ${player.name} hat als Erste(r) richtig geschätzt und bekommt die Karte!`,
                type: 'success'
            }
        });
        
        // Check win condition
        if (newScore >= 10) {
            await this.endGame({ id: playerId, name: player.name, score: newScore });
            return;
        }
        
        this.addLogEntry(`🏆 ${player.name} gewinnt die Karte! Score: ${newScore}/10`, 'success');
    }
    
    async discardCard(card, results) {
        await this.roomManager.updateRoom(this.roomId, {
            lastAction: {
                message: 'Niemand hat richtig geschätzt! Karte wird verworfen.',
                type: 'warning'
            }
        });
    }
    
    async prepareNextRound() {
        if (!this.isHost) return;
        
        await this.roomManager.updateRoom(this.roomId, {
            currentCard: null,
            placementPhase: false,
            playerPlacements: {},
            placementTimer: 0,
            placementStartTime: null,
            lastAction: {
                message: '🎲 Bereit für die nächste Runde!',
                type: 'info'
            }
        });
    }
    
    displayCurrentCard(card) {
        if (!this.currentCardElement || !card) return;
        
        this.currentCard = card;
        
        // During placement phase, hide misery index for ALL players
        const isPlacementPhase = this.roomData?.placementPhase;
        const showMiseryIndex = !isPlacementPhase;
        
        this.currentCardElement.innerHTML = `
            <div class="card current-card ${showMiseryIndex ? 'show-misery' : 'hide-misery'}" id="currentCardDraggable">
                <div class="card-header">STUFF HAPPENS</div>
                <div class="card-content">
                    <div class="card-scenario">${card.scenario}</div>
                </div>
                <div class="card-footer">
                    <div class="misery-label">MISERY INDEX</div>
                    <div class="misery-index ${showMiseryIndex ? '' : 'hidden-index'}">
                        ${showMiseryIndex ? card.miseryIndex : '?'}
                    </div>
                </div>
            </div>
        `;
        
        // Show card with animation
        this.currentCardElement.classList.add('card-revealed');
        
        // Show placement interface during placement phase
        if (isPlacementPhase) {
            this.showPlacementInterface();
            
            // Add instruction for all players
            const instruction = document.createElement('div');
            instruction.className = 'card-instruction placement-active';
            instruction.innerHTML = '<p><i class="fas fa-lightbulb"></i> Alle Spieler: Schätzt den Misery Index und platziert die Karte!</p>';
            this.currentCardElement.appendChild(instruction);
        } else {
            this.hidePlacementInterface();
        }
    }
    
    updateHandDisplay() {
        if (!this.playerHandElement) return;
        
        // Get current player's hand from Firebase data
        const currentPlayerHand = this.roomData?.playerHands?.[this.playerId]?.hand || [];
        
        this.playerHandElement.innerHTML = '';
        
        // Sort hand by misery index for display
        const sortedHand = [...currentPlayerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
        
        if (sortedHand.length === 0) {
            this.playerHandElement.innerHTML = '<div class="empty-hand">Keine Karten in der Hand</div>';
            return;
        }
        
        // Create hand with drop zones
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
        
        // Add drag and drop event listeners
        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('drop', this.handleDrop.bind(this));
        dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        
        return dropZone;
    }
    
    // Remove old placement methods - replaced with drag & drop
    
    showVotingArea(roomData) {
        const votingArea = document.getElementById('votingArea');
        const votingPlayerName = document.getElementById('votingPlayerName');
        const placementPreview = document.getElementById('placementPreview');
        const votingProgress = document.getElementById('votingProgress');
        
        if (!votingArea || this.votingPhase) return;
        
        // Skip if current player (they placed the card) or already voted
        if (roomData.currentPlayer === this.playerId || roomData.votes?.[this.playerId] !== undefined) {
            votingArea.style.display = 'none';
            return;
        }
        
        this.votingPhase = true;
        votingArea.style.display = 'block';
        
        // Update voting player name
        const currentPlayer = roomData.players?.find(p => p.id === roomData.currentPlayer);
        if (votingPlayerName && currentPlayer) {
            votingPlayerName.textContent = currentPlayer.name;
        }
        
        // Show placement preview
        if (placementPreview && roomData.placement && roomData.currentCard) {
            const sortedHand = [...this.playerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
            const newCard = roomData.currentCard;
            const position = roomData.placement.position;
            
            let previewText = 'Platzierung: ';
            if (position === 0) {
                previewText += `"${newCard.scenario}" (${newCard.miseryIndex}) am Anfang`;
            } else if (position === sortedHand.length) {
                previewText += `"${newCard.scenario}" (${newCard.miseryIndex}) am Ende`;
            } else {
                previewText += `"${newCard.scenario}" (${newCard.miseryIndex}) an Position ${position + 1}`;
            }
            
            placementPreview.innerHTML = `
                <p>${previewText}</p>
                <div class="card current-card">
                    <div class="card-scenario">${newCard.scenario}</div>
                    <div class="card-misery">Misery Index: ${newCard.miseryIndex}</div>
                </div>
            `;
        }
        
        // Update voting progress
        if (votingProgress && roomData.votes) {
            const totalVoters = roomData.players.filter(p => p.id !== roomData.currentPlayer).length;
            const currentVotes = Object.keys(roomData.votes).length;
            votingProgress.textContent = `${currentVotes}/${totalVoters}`;
        }
        
        this.addLogEntry('Abstimmen: Ist die Platzierung korrekt?', 'warning');
    }
    
    hideVotingArea() {
        const votingArea = document.getElementById('votingArea');
        if (votingArea) {
            votingArea.style.display = 'none';
        }
        this.votingPhase = false;
    }
    
    async submitVote(vote) {
        if (!this.votingPhase) return;
        
        try {
            await this.gameStateManager.submitVote(this.roomId, this.playerId, vote);
            this.hideVotingArea();
            
            this.addLogEntry(`Stimme abgegeben: ${vote ? 'Richtig' : 'Falsch'}`, 'info');
            
            // Check if all votes are in
            this.checkVotingComplete();
            
        } catch (error) {
            console.error('Error submitting vote:', error);
            this.showToast('Fehler beim Abstimmen', 'error');
        }
    }
    
    async checkVotingComplete() {
        if (!this.roomData.votes || !this.roomData.placement) return;
        
        const totalPlayers = this.roomData.players.length;
        const currentPlayer = this.roomData.currentPlayer;
        const votingPlayers = this.roomData.players.filter(p => p.id !== currentPlayer);
        const votes = Object.keys(this.roomData.votes).length;
        
        // Check if all eligible players have voted
        if (votes >= votingPlayers.length) {
            await this.resolveVoting();
        }
    }
    
    async resolveVoting() {
        if (!this.isHost) return;
        
        try {
            const votes = this.roomData.votes;
            const placement = this.roomData.placement;
            const yesVotes = Object.values(votes).filter(v => v === true).length;
            const totalVotes = Object.values(votes).length;
            const approved = yesVotes > totalVotes / 2;
            
            const currentPlayerData = this.roomData.players.find(p => p.id === this.roomData.currentPlayer);
            
            if (approved && placement.correct) {
                // Correct placement and approved
                currentPlayerData.cardsWon = (currentPlayerData.cardsWon || 0) + 1;
                this.addLogEntry(`Korrekt platziert! ${currentPlayerData.name} bekommt die Karte.`, 'success');
                
                // Check for win condition
                if (currentPlayerData.cardsWon >= 10) {
                    await this.endGame(currentPlayerData);
                    return;
                }
            } else {
                this.addLogEntry(`Falsch platziert oder abgelehnt. Karte wird verworfen.`, 'error');
            }
            
            // Move to next player
            await this.nextTurn();
            
        } catch (error) {
            console.error('Error resolving voting:', error);
            this.showToast('Fehler beim Auswerten', 'error');
        }
    }
    
    async nextTurn() {
        if (!this.isHost) return;
        
        const currentIndex = this.roomData.players.findIndex(p => p.id === this.roomData.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.roomData.players.length;
        const nextPlayer = this.roomData.players[nextIndex];
        
        await this.roomManager.updateRoom(this.roomId, {
            currentPlayer: nextPlayer.id,
            currentCard: null,
            currentAttemptingPlayer: null,
            placementAttempt: null,
            lastAction: {
                message: `${nextPlayer.name} ist am Zug und kann eine Karte ziehen`,
                type: 'info'
            }
        });
    }
    
    async endGame(winner) {
        await this.roomManager.updateRoom(this.roomId, {
            gameState: 'finished',
            winner: winner,
            lastAction: {
                message: `🎉 ${winner.name} hat gewonnen!`,
                type: 'success'
            }
        });
    }
    
    handleGameEnd(roomData) {
        if (roomData.winner) {
            this.showToast(`🎉 ${roomData.winner.name} hat das Spiel gewonnen!`, 'success');
            this.addLogEntry(`Spiel beendet! Gewinner: ${roomData.winner.name}`, 'success');
        }
    }
    
    
    async leaveRoom() {
        console.log('Leaving room...');
        this.showToast('Raum verlassen...', 'info');
        
        try {
            await this.roomManager.leaveRoom(this.roomId, this.playerId);
            this.cleanup();
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } catch (error) {
            console.error('Error leaving room:', error);
            // Still redirect even if cleanup fails
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    }
    
    cleanup() {
        if (this.unsubscribeRoom) {
            this.unsubscribeRoom();
            this.unsubscribeRoom = null;
        }
    }
    
    copyRoomCode() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                this.showToast('Raum-Code kopiert!', 'success');
            }).catch(() => {
                this.fallbackCopy(this.roomId);
            });
        } else {
            this.fallbackCopy(this.roomId);
        }
    }
    
    copyRoomLink() {
        const link = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                this.showToast('Raum-Link kopiert!', 'success');
            }).catch(() => {
                this.fallbackCopy(link);
            });
        } else {
            this.fallbackCopy(link);
        }
    }
    
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('Text kopiert!', 'success');
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
        if (!toastContainer) {
            console.warn('Toast container not found');
            return;
        }
        
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
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.remove();
            });
        }
        
        toastContainer.appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }
    
    updateTurnInfo(roomData) {
        const turnInfoElement = document.getElementById('turnInfo');
        
        if (roomData.placementPhase) {
            // During placement phase, all players participate simultaneously
            if (turnInfoElement) {
                const timer = roomData.placementTimer || 0;
                const placedCount = Object.keys(roomData.playerPlacements || {}).length;
                const totalPlayers = roomData.players?.length || 0;
                
                turnInfoElement.innerHTML = `
                    <div class="turn-info placement-phase">
                        <h3>🎯 Platzierungsphase</h3>
                        <p>Alle Spieler platzieren gleichzeitig!</p>
                        <div class="placement-progress">
                            <span>⏰ ${timer}s verbleibend</span>
                            <span>📍 ${placedCount}/${totalPlayers} platziert</span>
                        </div>
                    </div>
                `;
            }
        } else if (roomData.currentCard) {
            // Show evaluation results
            if (turnInfoElement) {
                turnInfoElement.innerHTML = `
                    <div class="turn-info evaluation">
                        <h3>📊 Auswertung</h3>
                        <p>Ergebnisse werden ausgewertet...</p>
                    </div>
                `;
            }
        } else {
            // Waiting for next round
            if (turnInfoElement) {
                const isHost = this.isHost;
                turnInfoElement.innerHTML = `
                    <div class="turn-info waiting">
                        <h3>🎲 Nächste Runde</h3>
                        <p>${isHost ? 'Du kannst eine neue Karte ziehen!' : 'Warten auf neue Karte...'}</p>
                    </div>
                `;
            }
        }
    }
    
    updateDrawCardButton(roomData) {
        const drawCardSection = document.getElementById('drawCardSection');
        const drawCardBtn = document.getElementById('drawCardBtn');
        
        if (drawCardSection && drawCardBtn) {
            const canDrawCard = this.isHost && 
                               roomData.gameState === 'playing' && 
                               !roomData.currentCard && 
                               !roomData.placementPhase;
            
            drawCardSection.style.display = canDrawCard ? 'block' : 'none';
            
            if (canDrawCard) {
                drawCardBtn.textContent = 'Neue Karte ziehen';
                drawCardBtn.disabled = false;
            }
        }
    }
    
    updateGameStats(roomData) {
        const currentRoundElement = document.getElementById('currentRound');
        const cardsInDeckElement = document.getElementById('cardsInDeck');
        const cardsWonElement = document.getElementById('cardsWon');
        
        if (currentRoundElement && roomData.round) {
            currentRoundElement.textContent = roomData.round;
        }
        
        if (cardsInDeckElement && roomData.deck) {
            cardsInDeckElement.textContent = roomData.deck.length;
        }
        
        if (cardsWonElement) {
            const currentPlayer = roomData.players?.find(p => p.id === this.playerId);
            cardsWonElement.textContent = currentPlayer?.cardsWon || 0;
        }
    }
    
    showWaitingForPlacement(roomData) {
        const currentCard = roomData.currentCard;
        const currentPlayer = roomData.players?.find(p => p.id === roomData.currentPlayer);
        
        if (currentCard && this.roomData?.currentPlayer !== this.playerId) {
            // Start simultaneous placement phase for all non-active players
            this.startSimultaneousPlacement(currentCard, currentPlayer, roomData);
        }
    }

    startSimultaneousPlacement(currentCard, currentPlayer, roomData) {
        const waitingArea = document.getElementById('waitingForPlacementArea') || this.createWaitingArea();
        const placementTimer = roomData.placementPhase?.timer || 30; // Default 30 seconds
        
        waitingArea.style.display = 'block';
        waitingArea.innerHTML = `
            <div class="simultaneous-placement-content">
                <h3>🎯 Alle platzieren gleichzeitig!</h3>
                <p><strong>${currentPlayer?.name}</strong> hat eine Karte gezogen:</p>
                <div class="drawn-card-display">
                    <div class="card">
                        <div class="card-scenario">${currentCard.scenario}</div>
                        <div class="card-misery-hidden">Misery Index: ???</div>
                    </div>
                </div>
                <div class="placement-timer">
                    <div class="timer-circle">
                        <span class="timer-text" id="placementTimerText">${placementTimer}</span>
                    </div>
                    <p>Ziehe die Karte an die richtige Position in deiner Hand!</p>
                </div>
                <div class="placement-status">
                    <div class="players-ready" id="playersReadyList">
                        ${this.renderPlayersPlacementStatus(roomData)}
                    </div>
                </div>
            </div>
        `;
        
        // Enable drag & drop for all non-active players
        if (!roomData.placementPhase?.placements?.[this.playerId]) {
            this.enableSimultaneousCardPlacement(currentCard);
        }
        
        // Start countdown timer
        this.startPlacementTimer(placementTimer);
    }

    renderPlayersPlacementStatus(roomData) {
        const placements = roomData.placementPhase?.placements || {};
        const nonActivePlayers = roomData.players?.filter(p => p.id !== roomData.currentPlayer) || [];
        
        return nonActivePlayers.map(player => {
            const hasPlaced = placements[player.id] !== undefined;
            const isMe = player.id === this.playerId;
            
            return `
                <div class="player-status ${hasPlaced ? 'placed' : 'waiting'} ${isMe ? 'me' : ''}">
                    <div class="player-avatar">
                        <img src="${player.avatar}" alt="${player.name}">
                    </div>
                    <div class="player-info">
                        <span class="player-name">${player.name} ${isMe ? '(Du)' : ''}</span>
                        <span class="placement-status">
                            ${hasPlaced ? '✅ Platziert' : '⏳ Warten...'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    startPlacementTimer(initialTime) {
        if (this.placementTimerInterval) {
            clearInterval(this.placementTimerInterval);
        }
        
        let timeLeft = initialTime;
        const timerElement = document.getElementById('placementTimerText');
        
        this.placementTimerInterval = setInterval(() => {
            timeLeft--;
            if (timerElement) {
                timerElement.textContent = timeLeft;
                
                // Change color when time is running out
                if (timeLeft <= 10) {
                    timerElement.parentElement.classList.add('timer-warning');
                }
                if (timeLeft <= 5) {
                    timerElement.parentElement.classList.add('timer-critical');
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.placementTimerInterval);
                this.placementTimerInterval = null;
                
                // Submit auto-placement if player hasn't placed yet
                if (!this.hasSubmittedPlacement) {
                    this.submitAutoPlacement();
                }
            }
        }, 1000);
    }
    
    showOtherPlayerPlacing(roomData) {
        const waitingArea = document.getElementById('waitingForPlacementArea') || this.createWaitingArea();
        if (waitingArea && roomData.currentAttemptingPlayer) {
            const attemptingPlayer = roomData.players?.find(p => p.id === roomData.currentAttemptingPlayer);
            waitingArea.innerHTML = `
                <div class="waiting-placement-content">
                    <h3>Platzierungsversuch läuft</h3>
                    <p><strong>${attemptingPlayer?.name}</strong> versucht gerade die Karte zu platzieren...</p>
                    <div class="placement-progress">
                        <div class="loading-spinner small"></div>
                        <span>Warten auf Platzierung...</span>
                    </div>
                </div>
            `;
            waitingArea.style.display = 'block';
        }
    }
    
    createWaitingArea() {
        // Check if area already exists
        let waitingArea = document.getElementById('waitingForPlacementArea');
        if (waitingArea) return waitingArea;
        
        // Create new waiting area
        waitingArea = document.createElement('div');
        waitingArea.id = 'waitingForPlacementArea';
        waitingArea.className = 'waiting-placement-area';
        waitingArea.style.display = 'none';
        
        // Insert after current card element
        const currentCardElement = document.getElementById('currentCard');
        if (currentCardElement && currentCardElement.parentNode) {
            currentCardElement.parentNode.insertBefore(waitingArea, currentCardElement.nextSibling);
        }
        
        return waitingArea;
    }
    
    async requestPlacementTurn() {
        // Spieler möchte versuchen, die Karte zu platzieren
        try {
            await this.roomManager.updateRoom(this.roomId, {
                currentAttemptingPlayer: this.playerId,
                lastAction: {
                    message: `${this.playerName} versucht die Karte zu platzieren`,
                    type: 'info'
                }
            });
            
            // Hide waiting area
            const waitingArea = document.getElementById('waitingForPlacementArea');
            if (waitingArea) {
                waitingArea.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error requesting placement turn:', error);
            this.showToast('Fehler beim Anfordern des Platzierungsversuchs', 'error');
        }
    }
    
    // Drag & Drop functionality for simultaneous placement
    enableSimultaneousCardPlacement(currentCard) {
        if (this.roomData?.currentPlayer === this.playerId) return; // Active player can't guess
        
        const currentCardElement = document.getElementById('currentCardDraggable');
        const instructionsElement = document.getElementById('placementInstructions');
        
        if (currentCardElement) {
            currentCardElement.draggable = true;
            currentCardElement.classList.add('draggable');
            
            currentCardElement.addEventListener('dragstart', this.handleDragStart.bind(this));
            currentCardElement.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            // Show instructions
            if (instructionsElement) {
                instructionsElement.style.display = 'block';
                instructionsElement.innerHTML = `
                    <p><i class="fas fa-hand-paper"></i> Schätze den Misery Index und platziere die Karte!</p>
                    <p><small>Du siehst den Index nicht - verwende dein Urteilsvermögen!</small></p>
                `;
            }
            
            this.addLogEntry('💡 Schätze den Misery Index und ziehe die Karte an die richtige Position!', 'info');
        }
    }
    
    showPlacementMade() {
        const instructionsElement = document.getElementById('placementInstructions');
        if (instructionsElement) {
            instructionsElement.style.display = 'block';
            instructionsElement.innerHTML = `
                <p><i class="fas fa-check"></i> Du hast deine Platzierung gewählt!</p>
                <p><small>Warte auf andere Spieler...</small></p>
            `;
            instructionsElement.className = 'placement-instructions placement-made';
        }
        this.disableCardPlacement();
    }
    
    shouldStartEvaluation(roomData) {
        if (!roomData.currentCard || !roomData.playerPlacements) return false;
        
        // Count non-active players who should place
        const nonActivePlayers = roomData.players.filter(p => p.id !== roomData.currentPlayer);
        const placementCount = Object.keys(roomData.playerPlacements).length;
        
        return placementCount >= nonActivePlayers.length;
    }
    
    async startPlacementEvaluation(roomData) {
        if (!this.isHost) return;
        
        // System evaluates all placements and determines winner
        const placements = roomData.playerPlacements;
        const currentCard = roomData.currentCard;
        let winner = null;
        let evaluationResults = {};
        
        // Check each placement for correctness
        for (const [playerId, placement] of Object.entries(placements)) {
            const playerHand = roomData.playerHands?.[playerId]?.hand || [];
            const sortedHand = [...playerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
            
            // Calculate correct position
            let correctPosition = 0;
            for (let i = 0; i < sortedHand.length; i++) {
                if (currentCard.miseryIndex > sortedHand[i].miseryIndex) {
                    correctPosition = i + 1;
                }
            }
            
            const isCorrect = placement.position === correctPosition;
            evaluationResults[playerId] = {
                correct: isCorrect,
                position: placement.position,
                correctPosition: correctPosition,
                timestamp: placement.timestamp
            };
            
            // First correct placement wins (or earliest if multiple correct)
            if (isCorrect && (!winner || placement.timestamp < evaluationResults[winner].timestamp)) {
                winner = playerId;
            }
        }
        
        await this.resolvePlacements(winner, evaluationResults, currentCard);
    }
    
    async resolvePlacements(winnerId, results, currentCard) {
        let logMessage = `🎯 Auflösung: Misery Index der Karte ist ${currentCard.miseryIndex}\n`;
        
        if (winnerId) {
            // Someone won the card
            const winnerName = this.roomData.players.find(p => p.id === winnerId)?.name;
            const winnerHand = this.roomData.playerHands?.[winnerId]?.hand || [];
            const correctPosition = results[winnerId].correctPosition;
            
            // Add card to winner's hand
            const sortedHand = [...winnerHand].sort((a, b) => a.miseryIndex - b.miseryIndex);
            const newHand = [...sortedHand];
            newHand.splice(correctPosition, 0, currentCard);
            
            const newScore = (this.roomData.playerHands?.[winnerId]?.score || 0) + 1;
            
            await this.roomManager.updateRoom(this.roomId, {
                [`playerHands.${winnerId}.hand`]: newHand,
                [`playerHands.${winnerId}.score`]: newScore,
                currentCard: null,
                playerPlacements: {},
                lastAction: {
                    message: `🎉 ${winnerName} hat richtig geschätzt! Karte an Position ${correctPosition + 1} platziert.`,
                    type: 'success'
                }
            });
            
            // Check win condition
            if (newScore >= 10) {
                await this.endGame({ id: winnerId, name: winnerName, score: newScore });
                return;
            }
            
        } else {
            // Nobody was correct
            await this.roomManager.updateRoom(this.roomId, {
                currentCard: null,
                playerPlacements: {},
                lastAction: {
                    message: 'Niemand hat richtig geschätzt! Karte wird verworfen.',
                    type: 'warning'
                }
            });
        }
        
        // Show detailed results to all players
        this.showEvaluationResults(results, currentCard.miseryIndex, winnerId);
        
        // Next turn
        setTimeout(() => {
            this.nextTurn();
        }, 3000);
    }
    
    showEvaluationResults(results, actualMiseryIndex, winnerId) {
        let resultText = `🎯 Auflösung: Der Misery Index war ${actualMiseryIndex}\n\n`;
        
        // Show all player results
        const sortedResults = Object.entries(results).sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        sortedResults.forEach(([playerId, result]) => {
            const playerName = result.playerName || this.roomData.players.find(p => p.id === playerId)?.name || 'Unbekannt';
            const status = result.correct ? '✅ Richtig' : '❌ Falsch';
            const positionText = result.position === 0 ? 'Anfang' : 
                                result.position === this.roomData.playerHands?.[playerId]?.hand?.length ? 'Ende' : 
                                `Position ${result.position + 1}`;
            resultText += `${playerName}: ${positionText} ${status}\n`;
        });
        
        if (winnerId) {
            const winnerName = results[winnerId].playerName || this.roomData.players.find(p => p.id === winnerId)?.name;
            resultText += `\n🏆 ${winnerName} war am schnellsten richtig und gewinnt die Karte!`;
        } else {
            resultText += '\n💨 Karte verworfen - niemand hatte die richtige Position!';
        }
        
        this.addLogEntry(resultText, winnerId ? 'success' : 'warning');
        
        // Show toast with summary
        if (winnerId) {
            const winnerName = results[winnerId].playerName || this.roomData.players.find(p => p.id === winnerId)?.name;
            this.showToast(`🎉 ${winnerName} gewinnt die Karte!`, 'success');
        } else {
            this.showToast('Niemand hatte die richtige Position!', 'warning');
        }
    }
    
    showPlacementInterface() {
        const placementArea = this.getOrCreatePlacementArea();
        const hasPlaced = this.roomData.playerPlacements?.[this.playerId] != null;
        const timer = this.roomData.placementTimer || 0;
        
        placementArea.innerHTML = `
            <div class="placement-interface">
                <div class="placement-header">
                    <h3>🎯 Simultane Platzierung</h3>
                    <div class="placement-timer">
                        <span class="timer-icon">⏰</span>
                        <span class="timer-text">${timer}s</span>
                    </div>
                </div>
                <div class="placement-status">
                    ${hasPlaced ? 
                        '<div class="placement-success">✅ Deine Platzierung wurde übermittelt!</div>' :
                        '<div class="placement-instructions">📍 Ziehe die Karte an die richtige Position in deiner Reihe</div>'
                    }
                </div>
                <div class="other-players-status">
                    ${this.generateOtherPlayersStatus()}
                </div>
            </div>
        `;
        
        placementArea.style.display = 'block';
        
        // Start timer if not already running
        if (!this.placementTimerInterval) {
            this.startPlacementTimer();
        }
        
        // Show drag and drop interface
        this.showPlayerHand();
        this.enableDragAndDrop();
    }
    
    hidePlacementInterface() {
        const placementArea = document.getElementById('placementArea');
        if (placementArea) {
            placementArea.style.display = 'none';
        }
        
        if (this.placementTimerInterval) {
            clearInterval(this.placementTimerInterval);
            this.placementTimerInterval = null;
        }
        
        this.disableDragAndDrop();
    }
    
    getOrCreatePlacementArea() {
        let placementArea = document.getElementById('placementArea');
        if (!placementArea) {
            placementArea = document.createElement('div');
            placementArea.id = 'placementArea';
            placementArea.className = 'placement-area';
            
            // Insert after current card
            const currentCard = document.getElementById('currentCard');
            if (currentCard && currentCard.parentNode) {
                currentCard.parentNode.insertBefore(placementArea, currentCard.nextSibling);
            }
        }
        return placementArea;
    }
    
    generateOtherPlayersStatus() {
        if (!this.roomData.players) return '';
        
        const otherPlayers = this.roomData.players.filter(p => p.id !== this.playerId);
        
        return otherPlayers.map(player => {
            const hasPlaced = this.roomData.playerPlacements?.[player.id] != null;
            
            return `
                <div class="player-status ${hasPlaced ? 'placed' : 'waiting'}">
                    <div class="player-avatar">
                        <img src="${player.avatar}" alt="${player.name}">
                    </div>
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="placement-status">
                            ${hasPlaced ? '✅ Platziert' : '⏳ Warten...'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    startPlacementTimer() {
        if (this.placementTimerInterval) return;
        
        const startTime = this.roomData.placementStartTime || Date.now();
        const timerDuration = this.roomData.placementTimer || 60;
        
        this.placementTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, timerDuration - elapsed);
            
            const timerElement = document.querySelector('.timer-text');
            if (timerElement) {
                timerElement.textContent = `${remaining}s`;
                
                // Add visual warnings
                const timerContainer = timerElement.parentElement;
                if (remaining <= 10) {
                    timerContainer.classList.add('timer-warning');
                }
                if (remaining <= 5) {
                    timerContainer.classList.add('timer-critical');
                }
            }
            
            if (remaining <= 0) {
                clearInterval(this.placementTimerInterval);
                this.placementTimerInterval = null;
                
                // Auto-submit if player hasn't placed
                if (!this.roomData.playerPlacements?.[this.playerId]) {
                    this.submitAutoPlacement();
                }
            }
        }, 1000);
    }
    
    async submitAutoPlacement() {
        // Auto-place at random position if player didn't place manually
        const currentHand = this.roomData?.playerHands?.[this.playerId]?.hand || [];
        const randomPosition = Math.floor(Math.random() * (currentHand.length + 1));
        
        await this.submitPlacement(randomPosition);
        this.showToast('Zeit abgelaufen - automatisch platziert!', 'warning');
    }
    
    async submitPlacement(position) {
        if (!this.roomData.currentCard) return;
        
        // Check if player already placed
        if (this.roomData.playerPlacements?.[this.playerId]) {
            this.showToast('Du hast bereits platziert!', 'warning');
            return;
        }
        
        try {
            const timestamp = Date.now();
            
            await this.roomManager.updateRoom(this.roomId, {
                [`playerPlacements.${this.playerId}`]: {
                    position: position,
                    timestamp: timestamp,
                    playerName: this.playerName
                }
            });
            
            this.showToast(`Platzierung übermittelt: Position ${position + 1}`, 'success');
            this.addLogEntry(`📍 Du hast die Karte an Position ${position + 1} platziert`, 'info');
            
            // Disable further placement
            this.disableDragAndDrop();
            
        } catch (error) {
            console.error('Error submitting placement:', error);
            this.showToast('Fehler beim Übermitteln der Platzierung', 'error');
        }
    }
    
    showPlayerHand() {
        // Make sure hand is visible during placement
        if (this.playerHandElement) {
            this.playerHandElement.style.display = 'block';
            this.updateHandDisplay();
        }
    }
    
    enableDragAndDrop() {
        // Enable drag and drop for current card
        const currentCard = document.getElementById('currentCardDraggable');
        if (currentCard) {
            currentCard.draggable = true;
            currentCard.addEventListener('dragstart', this.handleDragStart.bind(this));
        }
        
        // Enable drop zones in hand
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
    }
    
    disableDragAndDrop() {
        // Disable drag and drop
        const currentCard = document.getElementById('currentCardDraggable');
        if (currentCard) {
            currentCard.draggable = false;
        }
        
        // Remove drop zone listeners
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.removeEventListener('dragover', this.handleDragOver);
            zone.removeEventListener('drop', this.handleDrop);
        });
    }
    
    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', 'currentCard');
        event.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback
        const currentCard = event.target;
        currentCard.classList.add('dragging');
        
        // Highlight drop zones
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => zone.classList.add('drag-active'));
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        // Add hover effect
        event.target.classList.add('drag-over');
    }
    
    handleDrop(event) {
        event.preventDefault();
        
        const dropZone = event.target.closest('.drop-zone');
        if (dropZone) {
            const position = parseInt(dropZone.dataset.position);
            this.submitPlacement(position);
        }
        
        // Remove visual feedback
        this.cleanupDragFeedback();
    }
    
    cleanupDragFeedback() {
        const currentCard = document.getElementById('currentCardDraggable');
        if (currentCard) {
            currentCard.classList.remove('dragging');
        }
        
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('drag-active', 'drag-over');
        });
    }

    // ...existing code...
}

// Initialize game room when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Game Room...');
    try {
        window.gameRoom = new GameRoom();
    } catch (error) {
        console.error('Error initializing Game Room:', error);
        
        // Show error message to user
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
            <h3>Fehler beim Laden des Spielraums</h3>
            <p>${error.message || 'Unbekannter Fehler'}</p>
            <button onclick="window.location.href='../index.html'" 
                    style="background: white; color: #ff4757; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                Zurück zur Startseite
            </button>
        `;
        document.body.appendChild(errorContainer);
    }
});
