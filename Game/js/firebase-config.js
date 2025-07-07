// Firebase Configuration
const firebaseConfig = {
    // Ersetze mit deinen echten Firebase-Konfigurationsdaten
    apiKey: "AIzaSyCyWBnRZ95ZUn9qAaWRjvtmJk82DYKOL2M",
    authDomain: "stuff-happens-7b0a6.firebaseapp.com",
    projectId: "stuff-happens-7b0a6",
    storageBucket: "stuff-happens-7b0a6.firebasestorage.app",
    messagingSenderId: "355014820989",
    appId: "1:355014820989:web:4bbf20bbb0e97a651c1d14",
};

// Firebase wird über CDN geladen - wir verwenden die globalen Objekte
let app, auth, db;

// Firebase initialisieren wenn verfügbar
function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            // Prüfen ob Firebase bereits initialisiert ist
            try {
                app = firebase.app(); // Versuche existierende App zu bekommen
                console.log('Firebase app already exists, using existing instance');
            } catch (e) {
                // App existiert nicht, neue erstellen
                app = firebase.initializeApp(firebaseConfig);
                console.log('Firebase initialized successfully');
            }
            
            auth = firebase.auth();
            db = firebase.firestore();
            return true;
        } else {
            console.warn('Firebase SDK not loaded, using mock mode');
            return false;
        }
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        return false;
    }
}

// Warten auf Firebase-Verfügbarkeit
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined') {
                resolve(initializeFirebase());
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// Firebase initialisieren mit Retry-Logik
let firebaseAvailable = false;
waitForFirebase().then((available) => {
    firebaseAvailable = available;
    if (available) {
        console.log('Firebase ready and initialized');
    } else {
        console.log('Firebase not available, continuing with mock mode');
    }
});

// Globale Firebase-Bereitschaftsprüfung
export async function ensureFirebaseReady() {
    if (firebaseAvailable) {
        return true;
    }
    
    return await waitForFirebase();
}

// Firebase-Konfiguration und Instanzen exportieren
export { firebaseConfig, app, auth, db };

// Bereitschaftsstatus exportieren
export function isFirebaseReady() {
    return firebaseAvailable;
}

// Auth State Manager
export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.callbacks = [];
    }

    async onAuthStateChanged(callback) {
        this.callbacks.push(callback);
        
        // Warten auf Firebase-Initialisierung
        await waitForFirebase();
        
        if (auth && firebaseAvailable) {
            auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.callbacks.forEach(cb => cb(user));
            });
        } else {
            // Mock für lokale Entwicklung
            setTimeout(() => {
                const mockUser = {
                    uid: 'mock-user-' + Date.now(),
                    displayName: 'Test User',
                    email: 'test@example.com',
                    isAnonymous: true
                };
                this.currentUser = mockUser;
                this.callbacks.forEach(cb => cb(mockUser));
            }, 100);
        }
    }

    async signInAnonymously() {
        if (auth && firebaseAvailable) {
            return await auth.signInAnonymously();
        } else {
            // Mock return
            return { user: this.currentUser };
        }
    }

    async signOut() {
        if (auth && firebaseAvailable) {
            return await auth.signOut();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Room Manager für Firebase
export class RoomManager {
    constructor() {
        this.roomListeners = new Map();
    }

    async createRoom(roomData) {
        if (!db || !firebaseAvailable) {
            // Mock für lokale Entwicklung
            const roomCode = this.generateRoomCode();
            const mockRoom = {
                id: roomCode,
                ...roomData,
                createdAt: new Date(),
                players: [],
                status: 'waiting',
                gameState: 'waiting',
                deck: [],
                currentCard: null,
                currentPlayer: null,
                playerHands: {},
                playerPlacements: {},
                placementPhase: false,
                placementTimer: roomData.placementTimer || 60,
                placementStartTime: null,
                lastAction: null
            };
            console.log('Mock room created:', mockRoom);
            return mockRoom;
        }

        try {
            const roomCode = this.generateRoomCode();
            const room = {
                id: roomCode,
                ...roomData,
                createdAt: new Date(),
                players: [],
                status: 'waiting',
                gameState: 'waiting',
                deck: [],
                currentCard: null,
                currentPlayer: null,
                playerHands: {},
                playerPlacements: {},
                placementPhase: false,
                placementTimer: roomData.placementTimer || 60,
                placementStartTime: null,
                lastAction: null
            };
            
            await db.collection('rooms').doc(roomCode).set(room);
            return room;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    async joinRoom(roomId, player) {
        if (!db || !firebaseAvailable) {
            console.log('Mock joining room:', roomId, player);
            return true;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (!roomSnap.exists) {
                throw new Error('Raum nicht gefunden');
            }

            const room = roomSnap.data();
            if (room.players.length >= room.maxPlayers) {
                throw new Error('Raum ist voll');
            }

            const updatedPlayers = [...room.players, player];
            await roomRef.update({ players: updatedPlayers });
            
            return true;
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    async leaveRoom(roomId, playerId) {
        if (!db || !firebaseAvailable) {
            console.log('Mock leaving room:', roomId, playerId);
            return;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (roomSnap.exists) {
                const room = roomSnap.data();
                const updatedPlayers = room.players.filter(p => p.id !== playerId);
                
                if (updatedPlayers.length === 0) {
                    await roomRef.delete();
                } else {
                    await roomRef.update({ players: updatedPlayers });
                }
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    listenToRoom(roomId, callback) {
        if (!db || !firebaseAvailable) {
            // Mock listener
            console.log('Mock room listener for:', roomId);
            return () => console.log('Mock unsubscribe');
        }

        const roomRef = db.collection('rooms').doc(roomId);
        const unsubscribe = roomRef.onSnapshot((doc) => {
            if (doc.exists) {
                callback(doc.data());
            }
        });

        this.roomListeners.set(roomId, unsubscribe);
        return unsubscribe;
    }

    stopListening(roomId) {
        const unsubscribe = this.roomListeners.get(roomId);
        if (unsubscribe) {
            unsubscribe();
            this.roomListeners.delete(roomId);
        }
    }

    async updateRoom(roomId, updates) {
        if (!db || !firebaseAvailable) {
            console.log('Mock updating room:', roomId, updates);
            return;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            await roomRef.update({
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    }

    async checkRoomExists(roomId) {
        if (!db || !firebaseAvailable) {
            // Mock für lokale Entwicklung
            console.log('Mock checking room:', roomId);
            return {
                exists: true,
                data: {
                    id: roomId,
                    name: 'Test Raum',
                    players: [
                        { id: 'player1', name: 'Spieler1' },
                        { id: 'player2', name: 'Spieler2' }
                    ],
                    maxPlayers: 4,
                    gameMode: 'classic',
                    status: 'waiting',
                    isPrivate: false
                }
            };
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (roomSnap.exists) {
                return {
                    exists: true,
                    data: roomSnap.data()
                };
            } else {
                return {
                    exists: false,
                    data: null
                };
            }
        } catch (error) {
            console.error('Error checking room:', error);
            return {
                exists: false,
                data: null
            };
        }
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Game State Manager
export class GameStateManager {
    constructor(roomManager) {
        this.roomManager = roomManager;
    }

    async startGame(roomId, scenarios) {
        if (!db || !firebaseAvailable) {
            console.log('Mock game start for room:', roomId);
            return;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (!roomSnap.exists) {
                throw new Error('Raum nicht gefunden');
            }

            const room = roomSnap.data();
            const playersWithHands = {};
            
            // Jedem Spieler eine leere Hand geben (im echten Spiel haben alle Spieler zu Beginn 4 Karten)
            const initialCards = scenarios.slice(0, 4).sort((a, b) => a.miseryIndex - b.miseryIndex);
            
            room.players.forEach(player => {
                playersWithHands[player.id] = {
                    hand: [...initialCards], // Alle starten mit den gleichen 4 Karten
                    score: 0
                };
            });

            await roomRef.update({
                gameState: 'playing',
                status: 'playing',
                gameStarted: true,
                playerHands: playersWithHands,
                currentCard: null,
                placementPhase: false,
                playerPlacements: {},
                placementTimer: 60,
                placementStartTime: null,
                round: 1,
                lastAction: {
                    message: 'Spiel gestartet! Alle Spieler haben ihre Startkarten erhalten.',
                    type: 'success'
                }
            });
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    }

    async drawCard(roomId) {
        if (!db || !firebaseAvailable) {
            console.log('Mock draw card for room:', roomId);
            return null;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (roomSnap.exists) {
                const room = roomSnap.data();
                const deck = [...room.deck];
                const drawnCard = deck.shift();
                
                await roomRef.update({
                    deck: deck,
                    currentCard: drawnCard,
                    votes: {}
                });
                
                return drawnCard;
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            throw error;
        }
    }

    async submitVote(roomId, playerId, vote) {
        if (!db || !firebaseAvailable) {
            console.log('Mock vote submission:', roomId, playerId, vote);
            return;
        }

        try {
            const roomRef = db.collection('rooms').doc(roomId);
            const roomSnap = await roomRef.get();
            
            if (roomSnap.exists) {
                const room = roomSnap.data();
                const updatedVotes = { ...room.votes };
                updatedVotes[playerId] = vote;
                
                await roomRef.update({ votes: updatedVotes });
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    }
}

// Utility Functions
export function generateAvatar(uid) {
    const colors = ['#ff6b35', '#f7931e', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    const colorIndex = uid ? uid.length % colors.length : 0;
    const color = colors[colorIndex];
    
    const svg = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="${color}"/>
            <text x="50" y="55" font-family="Arial" font-size="30" fill="white" text-anchor="middle" font-weight="bold">
                ${uid ? uid.charAt(0).toUpperCase() : 'U'}
            </text>
        </svg>
    `)}`;
    
    return svg;
}

export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}
