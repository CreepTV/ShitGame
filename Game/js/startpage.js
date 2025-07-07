// Import Firebase utilities
import { AuthManager, RoomManager, generateAvatar, ensureFirebaseReady } from './firebase-config.js';

// DOM-Elemente
const userProfile = document.getElementById('userProfile');
const authButtons = document.getElementById('authButtons');
const profileImage = document.getElementById('profileImage');
const userName = document.getElementById('userName');
const settingsBtn = document.getElementById('settingsBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Modal-Elemente
const settingsModal = document.getElementById('settingsModal');
const createRoomModal = document.getElementById('createRoomModal');
const joinRoomModal = document.getElementById('joinRoomModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeCreateRoomBtn = document.getElementById('closeCreateRoomBtn');
const closeJoinRoomBtn = document.getElementById('closeJoinRoomBtn');

// Buttons
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const quickJoinBtn = document.getElementById('quickJoinBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const confirmCreateRoom = document.getElementById('confirmCreateRoom');
const cancelCreateRoom = document.getElementById('cancelCreateRoom');
const confirmJoinRoom = document.getElementById('confirmJoinRoom');
const cancelJoinRoom = document.getElementById('cancelJoinRoom');
const logoutBtn = document.getElementById('logoutBtn');

// Stats-Elemente
const gamesWonEl = document.getElementById('gamesWon');
const gamesPlayedEl = document.getElementById('gamesPlayed');
const onlinePlayersEl = document.getElementById('onlinePlayers');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// Aktueller Benutzer
let currentUser = null;

// Initialize managers
const authManager = new AuthManager();
const roomManager = new RoomManager();

// Event Listeners einrichten
document.addEventListener('DOMContentLoaded', async () => {
    // Warten auf Firebase-Initialisierung
    await ensureFirebaseReady();
    
    initializeEventListeners();
    await initializeAuth();
    updateOnlinePlayersCount();
    loadUserStats();
});

function initializeEventListeners() {
    // Settings Modal
    settingsBtn?.addEventListener('click', () => openModal(settingsModal));
    closeSettingsBtn?.addEventListener('click', () => closeModal(settingsModal));
    
    // Create Room Modal
    createRoomBtn?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Bitte melde dich zuerst an!', 'warning');
            return;
        }
        resetCreateRoomForm();
        openModal(createRoomModal);
    });
    closeCreateRoomBtn?.addEventListener('click', () => closeModal(createRoomModal));
    cancelCreateRoom?.addEventListener('click', () => closeModal(createRoomModal));
    
    // Join Room Modal
    joinRoomBtn?.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Bitte melde dich zuerst an!', 'warning');
            return;
        }
        resetJoinRoomForm();
        openModal(joinRoomModal);
    });
    closeJoinRoomBtn?.addEventListener('click', () => closeModal(joinRoomModal));
    cancelJoinRoom?.addEventListener('click', () => closeModal(joinRoomModal));
    
    // Auth Buttons
    loginBtn?.addEventListener('click', handleLogin);
    registerBtn?.addEventListener('click', handleRegister);
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Room Actions
    quickJoinBtn?.addEventListener('click', handleQuickJoin);
    confirmCreateRoom?.addEventListener('click', handleCreateRoom);
    confirmJoinRoom?.addEventListener('click', handleJoinRoom);
    
    // Modal Close on Outside Click
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal(settingsModal);
    });
    createRoomModal?.addEventListener('click', (e) => {
        if (e.target === createRoomModal) closeModal(createRoomModal);
    });
    joinRoomModal?.addEventListener('click', (e) => {
        if (e.target === joinRoomModal) closeModal(joinRoomModal);
    });
    
    // Room Code Input Enter Key
    roomCodeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuickJoin();
    });
    
    // Join Room Code Input
    const joinRoomCodeInput = document.getElementById('joinRoomCode');
    joinRoomCodeInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        if (e.target.value.length === 6) {
            validateRoomCode(e.target.value);
        }
    });
    
    joinRoomCodeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.length === 6) {
            handleJoinRoom();
        }
    });
    
    // Profile Upload
    const profileUpload = document.getElementById('profileUpload');
    profileUpload?.addEventListener('change', handleProfileUpload);
    
    // Settings Auto-Save
    const displayName = document.getElementById('displayName');
    const soundEnabled = document.getElementById('soundEnabled');
    
    displayName?.addEventListener('change', saveUserSettings);
    soundEnabled?.addEventListener('change', saveUserSettings);
}

// Firebase Authentication
async function initializeAuth() {
    await authManager.onAuthStateChanged((user) => {
        handleAuthStateChange(user);
    });
}

function handleAuthStateChange(user) {
    currentUser = user;
    
    if (user) {
        // User is signed in
        userProfile.style.display = 'flex';
        authButtons.style.display = 'none';
        
        // Set user info
        userName.textContent = user.displayName || 'Spieler';
        profileImage.src = generateAvatar(user.uid);
        
        // Load user data
        loadUserStats();
        
        showToast('Erfolgreich angemeldet!', 'success');
    } else {
        // User is signed out
        userProfile.style.display = 'none';
        authButtons.style.display = 'flex';
    }
}

// Auth Functions
function handleLogin() {
    // Weiterleitung zur Authentifizierungsseite
    window.location.href = 'pages/auth.html';
}

function handleRegister() {
    // Weiterleitung zur Authentifizierungsseite mit Register-Parameter
    window.location.href = 'pages/auth.html?mode=register';
}

async function handleLogout() {
    try {
        await authManager.signOut();
        currentUser = null;
        showToast('Erfolgreich abgemeldet!', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Fehler bei der Abmeldung', 'error');
    }
}

// Room Management
function handleQuickJoin() {
    const roomCode = roomCodeInput.value.trim();
    if (!roomCode) {
        showToast('Bitte gib einen Raum-Code ein!', 'warning');
        return;
    }
    
    if (!currentUser) {
        showToast('Bitte melde dich zuerst an!', 'warning');
        return;
    }
    
    joinRoom(roomCode);
}

async function handleJoinRoom() {
    const roomCode = document.getElementById('joinRoomCode')?.value.trim();
    const playerName = document.getElementById('playerName')?.value.trim();
    
    if (!roomCode) {
        showToast('Bitte gib einen Raum-Code ein!', 'warning');
        return;
    }
    
    if (!currentUser) {
        showToast('Bitte melde dich zuerst an!', 'warning');
        return;
    }
    
    // Set player name if provided
    if (playerName) {
        currentUser.displayName = playerName;
    }
    
    await joinRoom(roomCode);
}

async function joinRoom(roomCode) {
    try {
        // Validate room code format
        if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
            showToast('Ungültiger Raum-Code! (6 Zeichen erwartet)', 'error');
            return;
        }

        showToast('Raum wird beigetreten...', 'info');
        
        // Navigate to room page
        window.location.href = `pages/room.html?room=${roomCode}`;
    } catch (error) {
        console.error('Error joining room:', error);
        showToast('Fehler beim Beitreten: ' + error.message, 'error');
    }
}

async function handleCreateRoom() {
    if (!currentUser) {
        showToast('Bitte melde dich zuerst an!', 'warning');
        return;
    }
    
    const roomName = document.getElementById('roomName')?.value.trim() || 'Neues Spiel';
    const maxPlayers = parseInt(document.getElementById('maxPlayers')?.value) || 4;
    const gameMode = document.getElementById('gameMode')?.value || 'classic';
    const placementTimer = parseInt(document.getElementById('placementTimer')?.value) || 60;
    const isPrivate = document.getElementById('isPrivate')?.checked || false;
    const allowSpectators = document.getElementById('allowSpectators')?.checked || false;
    
    // Validate input
    if (!roomName || roomName.length < 3) {
        showToast('Raumname muss mindestens 3 Zeichen lang sein!', 'warning');
        return;
    }
    
    try {
        showToast('Raum wird erstellt...', 'info');
        
        // Show loading state
        const createBtn = document.getElementById('confirmCreateRoom');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<div class="spinner"></div> Erstelle Raum...';
        createBtn.disabled = true;
        
        const roomData = {
            name: roomName,
            maxPlayers: maxPlayers,
            gameMode: gameMode,
            placementTimer: placementTimer,
            isPrivate: isPrivate,
            allowSpectators: allowSpectators,
            hostId: currentUser.uid,
            hostName: currentUser.displayName || 'Host',
            createdBy: currentUser.uid,
            status: 'waiting',
            gameState: 'waiting',
            players: [],
            createdAt: new Date().toISOString()
        };
        
        const room = await roomManager.createRoom(roomData);
        
        showToast('Raum erstellt!', 'success');
        closeModal(createRoomModal);
        
        // Reset button
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
        
        // Navigate to room
        window.location.href = `pages/room.html?room=${room.id}`;
    } catch (error) {
        console.error('Error creating room:', error);
        showToast('Fehler beim Erstellen des Raums: ' + error.message, 'error');
        
        // Reset button
        const createBtn = document.getElementById('confirmCreateRoom');
        createBtn.innerHTML = '<i class="fas fa-plus"></i> Raum erstellen';
        createBtn.disabled = false;
    }
}

async function validateRoomCode(roomCode) {
    try {
        // Show loading state
        const roomInfo = document.getElementById('roomInfo');
        const joinBtn = document.getElementById('confirmJoinRoom');
        
        roomInfo.innerHTML = '<div class="modal-loading"><div class="spinner"></div> Suche Raum...</div>';
        roomInfo.style.display = 'block';
        joinBtn.disabled = true;
        
        // Check if room exists
        const roomCheck = await roomManager.checkRoomExists(roomCode);
        
        if (roomCheck.exists) {
            const room = roomCheck.data;
            
            // Check if room is full
            const isFull = room.players.length >= room.maxPlayers;
            const canJoin = !isFull && room.status === 'waiting';
            
            roomInfo.innerHTML = `
                <div class="room-preview">
                    <div class="room-details">
                        <h4>${room.name}</h4>
                        <div class="room-stats">
                            <span class="${isFull ? 'room-full' : ''}">${room.players.length}/${room.maxPlayers} Spieler</span>
                            <span>${getGameModeName(room.gameMode)}</span>
                            <span class="status-${room.status}">${getStatusName(room.status)}</span>
                        </div>
                    </div>
                    <div class="room-players">
                        ${room.players.map(player => `
                            <div class="room-player">
                                <img src="${generateAvatar(player.id || player.name)}" alt="${player.name}">
                                <span>${player.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${!canJoin ? `
                        <div class="room-warning">
                            ${isFull ? '⚠️ Raum ist voll' : '⚠️ Spiel bereits gestartet'}
                        </div>
                    ` : ''}
                </div>
            `;
            
            joinBtn.disabled = !canJoin;
            joinBtn.textContent = canJoin ? 'Beitreten' : 'Kann nicht beitreten';
            
        } else {
            roomInfo.innerHTML = `
                <div class="room-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Raum nicht gefunden!</span>
                    <small>Überprüfe den Code und versuche es erneut.</small>
                </div>
            `;
            joinBtn.disabled = true;
            joinBtn.textContent = 'Raum nicht gefunden';
        }
        
    } catch (error) {
        console.error('Error validating room code:', error);
        const roomInfo = document.getElementById('roomInfo');
        roomInfo.innerHTML = `
            <div class="room-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Fehler beim Suchen des Raums</span>
                <small>Versuche es später noch einmal.</small>
            </div>
        `;
        
        const joinBtn = document.getElementById('confirmJoinRoom');
        joinBtn.disabled = true;
        joinBtn.textContent = 'Fehler';
    }
}

function getGameModeName(mode) {
    switch (mode) {
        case 'classic': return 'Klassisch';
        case 'quick': return 'Schnell';
        case 'marathon': return 'Marathon';
        default: return 'Klassisch';
    }
}

function getStatusName(status) {
    switch (status) {
        case 'waiting': return 'Warten';
        case 'playing': return 'Spielt';
        case 'finished': return 'Beendet';
        default: return 'Unbekannt';
    }
}

function resetCreateRoomForm() {
    document.getElementById('roomName').value = '';
    document.getElementById('maxPlayers').value = '4';
    document.getElementById('gameMode').value = 'classic';
    document.getElementById('placementTimer').value = '60';
    document.getElementById('isPrivate').checked = false;
    document.getElementById('allowSpectators').checked = false;
}

function resetJoinRoomForm() {
    document.getElementById('joinRoomCode').value = '';
    document.getElementById('playerName').value = currentUser?.displayName || '';
    document.getElementById('roomInfo').style.display = 'none';
    document.getElementById('confirmJoinRoom').disabled = true;
}

// Utility Functions
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// User Settings
function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Bildvalidierung
    if (!file.type.startsWith('image/')) {
        showToast('Bitte wähle eine Bilddatei aus!', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Bild ist zu groß (max. 5MB)!', 'error');
        return;
    }
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        profileImage.src = e.target.result;
        showToast('Profilbild aktualisiert!', 'success');
    };
    reader.readAsDataURL(file);
}

function saveUserSettings() {
    if (!currentUser) return;
    
    const displayName = document.getElementById('displayName')?.value || 'Spieler';
    const soundEnabled = document.getElementById('soundEnabled')?.checked || false;
    
    // Update UI
    userName.textContent = displayName;
    showToast('Einstellungen gespeichert!', 'success');
    
    // TODO: Save to Firebase when configured
}

// Stats Management
function loadUserStats() {
    if (!currentUser) {
        gamesWonEl.textContent = '0';
        gamesPlayedEl.textContent = '0';
        return;
    }
    
    // Mock-Daten für Demo
    gamesWonEl.textContent = Math.floor(Math.random() * 20);
    gamesPlayedEl.textContent = Math.floor(Math.random() * 50);
    
    // TODO: Load from Firebase when configured
}

function updateOnlinePlayersCount() {
    // Mock-Implementierung
    const count = Math.floor(Math.random() * 100) + 20;
    onlinePlayersEl.textContent = count;
    
    // Aktualisiere alle 30 Sekunden
    setTimeout(updateOnlinePlayersCount, 30000);
    
    // TODO: Use real Firebase listener when configured
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // ESC schließt Modals
    if (e.key === 'Escape') {
        closeModal(settingsModal);
        closeModal(createRoomModal);
    }
});

// Service Worker für PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => console.log('SW registration failed'));
    });
}

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-info-circle';
    }
}
