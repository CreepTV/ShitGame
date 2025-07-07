// Modern Game Room JavaScript for THINGS HAPPENS - Demo Version
console.log('Game Room JavaScript loaded');

// Game Room Manager Class
class GameRoom {
    constructor() {
        this.roomId = null;
        this.playerId = null;
        this.playerName = null;
        this.isHost = false;
        this.roomData = null;
        this.scenarios = [];
        
        this.initializeDOM();
        this.loadScenarios();
        this.mockAuth();
    }
    
    initializeDOM() {
        console.log('Initializing DOM elements...');
        
        // Get room ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.roomId = urlParams.get('room') || 'DEMO123';
        
        // Mock user data for demo
        this.playerId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.playerName = 'Spieler' + Math.floor(Math.random() * 1000);
        this.isHost = true; // For demo purposes
        
        // Initialize UI elements
        this.setupUIElements();
        this.setupEventListeners();
        
        // Hide loading screen and show waiting area
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showDemoRoom();
        }, 1000);
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
        
        // Buttons
        this.leaveRoomBtn = document.getElementById('leaveRoomBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
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
    }
    
    loadScenarios() {
        // Demo scenarios
        this.scenarios = [
            { id: 1, scenario: "Den Vater nackt sehen", miseryIndex: 45 },
            { id: 2, scenario: "Sonnenbrand 3. Grades", miseryIndex: 75 },
            { id: 3, scenario: "Handy ins Klo fallen lassen", miseryIndex: 30 },
            { id: 4, scenario: "Beim ersten Date furzen", miseryIndex: 55 },
            { id: 5, scenario: "Im Fahrstuhl stecken bleiben", miseryIndex: 40 },
            { id: 6, scenario: "Falsche Person küssen", miseryIndex: 65 },
            { id: 7, scenario: "Bei der Arbeit einschlafen", miseryIndex: 35 },
            { id: 8, scenario: "Hose in der Öffentlichkeit reißt", miseryIndex: 50 }
        ];
        console.log('Scenarios loaded:', this.scenarios.length);
    }
    
    mockAuth() {
        // Mock authentication for demo
        console.log('Mock authentication completed');
    }
    
    showDemoRoom() {
        console.log('Showing demo room...');
        
        // Update room info
        if (this.roomCodeElement) {
            this.roomCodeElement.textContent = this.roomId;
        }
        
        if (this.shareRoomCodeInput) {
            this.shareRoomCodeInput.value = this.roomId;
        }
        
        if (this.shareRoomLinkInput) {
            this.shareRoomLinkInput.value = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        }
        
        // Create demo players
        this.createDemoPlayers();
        
        // Update UI
        this.updateRoomInfo();
        this.addLogEntry('Willkommen im Raum!', 'success');
        this.addLogEntry(`Du bist als ${this.playerName} beigetreten`, 'info');
        
        if (this.isHost) {
            this.addLogEntry('Du bist der Host dieses Raums', 'info');
            if (this.startGameBtn) {
                this.startGameBtn.style.display = 'block';
            }
        }
    }
    
    createDemoPlayers() {
        this.roomData = {
            roomId: this.roomId,
            hostId: this.playerId,
            gameState: 'waiting',
            players: [
                {
                    id: this.playerId,
                    name: this.playerName,
                    avatar: '🎮',
                    cardsWon: 0,
                    isReady: true
                },
                {
                    id: 'demo_player_2',
                    name: 'Anna',
                    avatar: '😊',
                    cardsWon: 0,
                    isReady: false
                }
            ],
            currentRound: 1,
            deck: [...this.scenarios]
        };
    }
    
    updateRoomInfo() {
        if (!this.roomData) return;
        
        if (this.playerCountElement) {
            this.playerCountElement.textContent = this.roomData.players?.length || 0;
        }
        
        if (this.roomStatusElement) {
            const statusMap = {
                'waiting': 'Warten auf Spieler...',
                'playing': 'Spiel läuft',
                'finished': 'Spiel beendet'
            };
            this.roomStatusElement.textContent = statusMap[this.roomData.gameState] || 'Unbekannt';
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
            
            playerCard.innerHTML = `
                <div class="player-avatar">${player.avatar || player.name.charAt(0)}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">
                        ${player.id === this.roomData.hostId ? '👑 Host' : ''}
                        ${player.isReady ? '✅ Bereit' : '⏳ Wartet'}
                    </div>
                </div>
                <div class="player-score">${player.cardsWon || 0}/10</div>
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
    
    startGame() {
        console.log('Starting game...');
        
        if (!this.isHost) {
            this.showToast('Nur der Host kann das Spiel starten', 'warning');
            return;
        }
        
        if (this.roomData.players.length < 2) {
            this.showToast('Mindestens 2 Spieler benötigt', 'warning');
            return;
        }
        
        // Update game state
        this.roomData.gameState = 'playing';
        this.roomData.currentTurn = this.roomData.players[0].id;
        
        // Shuffle and distribute cards
        const shuffledDeck = [...this.scenarios].sort(() => Math.random() - 0.5);
        this.roomData.deck = shuffledDeck;
        
        this.addLogEntry('Spiel gestartet!', 'success');
        this.addLogEntry('Karten werden verteilt...', 'info');
        
        // Show gameplay area
        this.showGameplayArea();
        this.updateRoomInfo();
        
        this.showToast('Spiel erfolgreich gestartet!', 'success');
    }
    
    leaveRoom() {
        console.log('Leaving room...');
        this.showToast('Raum verlassen...', 'info');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
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
}

// Initialize game room when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Game Room...');
    try {
        new GameRoom();
    } catch (error) {
        console.error('Error initializing Game Room:', error);
    }
});
