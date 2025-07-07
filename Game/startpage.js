// Import Firebase utilities
import { AuthManager, RoomManager, generateAvatar, showToast } from './js/firebase-config.js';

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
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeCreateRoomBtn = document.getElementById('closeCreateRoomBtn');

// Buttons
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const quickJoinBtn = document.getElementById('quickJoinBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const confirmCreateRoom = document.getElementById('confirmCreateRoom');
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
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeAuth();
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
            showToast('Bitte melde dich zuerst an!', 'error');
            return;
        }
        openModal(createRoomModal);
    });
    closeCreateRoomBtn?.addEventListener('click', () => closeModal(createRoomModal));
    
    // Auth Buttons
    loginBtn?.addEventListener('click', handleLogin);
    registerBtn?.addEventListener('click', handleRegister);
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Room Actions
    quickJoinBtn?.addEventListener('click', handleQuickJoin);
    joinRoomBtn?.addEventListener('click', handleJoinRoom);
    confirmCreateRoom?.addEventListener('click', handleCreateRoom);
    
    // Modal Close on Outside Click
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal(settingsModal);
    });
    createRoomModal?.addEventListener('click', (e) => {
        if (e.target === createRoomModal) closeModal(createRoomModal);
    });
    
    // Room Code Input Enter Key
    roomCodeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuickJoin();
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
function initializeAuth() {
    // Temporäre Mock-Implementierung
    // Ersetze das mit echtem Firebase Auth, sobald konfiguriert
    
    // Mock-Benutzer für Demo
    setTimeout(() => {
        handleAuthStateChange(null); // Nicht angemeldet
    }, 100);
    
    // Uncomment when Firebase is configured:
    /*
    onAuthStateChanged(auth, (user) => {
        handleAuthStateChange(user);
    });
    */
}

function handleAuthStateChange(user) {
    currentUser = user;
    
    if (user) {
        // Benutzer ist angemeldet
        userProfile.style.display = 'flex';
        authButtons.style.display = 'none';
        
        // Profil-Informationen aktualisieren
        userName.textContent = user.displayName || 'Spieler';
        profileImage.src = user.photoURL || generateDefaultAvatar(user.uid);
        
        loadUserStats();
    } else {
        // Benutzer ist nicht angemeldet
        userProfile.style.display = 'none';
        authButtons.style.display = 'flex';
    }
}

async function handleLogin() {
    try {
        showToast('Anmeldung läuft...', 'info');
        
        // Mock-Anmeldung für Demo
        const mockUser = {
            uid: 'demo-user-' + Date.now(),
            displayName: 'Demo Spieler',
            photoURL: null
        };
        
        setTimeout(() => {
            handleAuthStateChange(mockUser);
            showToast('Erfolgreich angemeldet!', 'success');
        }, 1000);
        
        // Uncomment when Firebase is configured:
        /*
        const result = await signInAnonymously(auth);
        showToast('Erfolgreich angemeldet!', 'success');
        */
    } catch (error) {
        console.error('Login error:', error);
        showToast('Anmeldung fehlgeschlagen: ' + error.message, 'error');
    }
}

function handleRegister() {
    // Für Anonymous Auth ist das dasselbe wie Login
    handleLogin();
}

async function handleLogout() {
    try {
        // Mock-Abmeldung
        handleAuthStateChange(null);
        showToast('Erfolgreich abgemeldet!', 'success');
        closeModal(settingsModal);
        
        // Uncomment when Firebase is configured:
        /*
        await signOut(auth);
        showToast('Erfolgreich abgemeldet!', 'success');
        closeModal(settingsModal);
        */
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Abmeldung fehlgeschlagen: ' + error.message, 'error');
    }
}

// Room Management
function handleQuickJoin() {
    const roomCode = roomCodeInput.value.trim();
    if (!roomCode) {
        showToast('Bitte gib einen Raum-Code ein!', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Bitte melde dich zuerst an!', 'error');
        return;
    }
    
    joinRoom(roomCode);
}

function handleJoinRoom() {
    const roomCode = prompt('Raum-Code eingeben:');
    if (roomCode) {
        joinRoom(roomCode.trim());
    }
}

async function joinRoom(roomCode) {
    try {
        showToast('Raum wird betreten...', 'info');
        
        // Mock-Implementation
        setTimeout(() => {
            showToast(`Raum ${roomCode} erfolgreich betreten!`, 'success');
            // Hier würdest du zur Spielseite weiterleiten
            // window.location.href = `game.html?room=${roomCode}`;
        }, 1000);
        
        // Uncomment when Firebase is configured:
        /*
        const roomRef = doc(db, 'rooms', roomCode);
        const roomDoc = await getDoc(roomRef);
        
        if (!roomDoc.exists()) {
            showToast('Raum nicht gefunden!', 'error');
            return;
        }
        
        const roomData = roomDoc.data();
        if (roomData.players && roomData.players.length >= roomData.maxPlayers) {
            showToast('Raum ist voll!', 'error');
            return;
        }
        
        // Spieler zum Raum hinzufügen
        await setDoc(roomRef, {
            ...roomData,
            players: [...(roomData.players || []), {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Spieler',
                joinedAt: new Date()
            }]
        });
        
        showToast('Raum erfolgreich betreten!', 'success');
        // Zur Spielseite weiterleiten
        window.location.href = `game.html?room=${roomCode}`;
        */
    } catch (error) {
        console.error('Join room error:', error);
        showToast('Fehler beim Betreten des Raums: ' + error.message, 'error');
    }
}

async function handleCreateRoom() {
    if (!currentUser) {
        showToast('Bitte melde dich zuerst an!', 'error');
        return;
    }
    
    const roomName = document.getElementById('roomName').value.trim();
    const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    const isPrivate = document.getElementById('isPrivate').checked;
    
    if (!roomName) {
        showToast('Bitte gib einen Raumnamen ein!', 'error');
        return;
    }
    
    try {
        showToast('Raum wird erstellt...', 'info');
        
        // Mock-Implementation
        const roomCode = generateRoomCode();
        setTimeout(() => {
            showToast(`Raum "${roomName}" erstellt! Code: ${roomCode}`, 'success');
            closeModal(createRoomModal);
            // Hier würdest du zur Spielseite weiterleiten
            // window.location.href = `game.html?room=${roomCode}&host=true`;
        }, 1000);
        
        // Uncomment when Firebase is configured:
        /*
        const roomCode = generateRoomCode();
        const roomData = {
            name: roomName,
            code: roomCode,
            hostId: currentUser.uid,
            maxPlayers: maxPlayers,
            isPrivate: isPrivate,
            players: [{
                uid: currentUser.uid,
                name: currentUser.displayName || 'Spieler',
                joinedAt: new Date(),
                isHost: true
            }],
            createdAt: new Date(),
            status: 'waiting', // waiting, playing, finished
            deck: [], // Wird beim Spielstart gefüllt
            hands: {},
            placedCount: {}
        };
        
        await setDoc(doc(db, 'rooms', roomCode), roomData);
        
        showToast(`Raum "${roomName}" erstellt! Code: ${roomCode}`, 'success');
        closeModal(createRoomModal);
        
        // Zur Spielseite weiterleiten
        window.location.href = `game.html?room=${roomCode}&host=true`;
        */
    } catch (error) {
        console.error('Create room error:', error);
        showToast('Fehler beim Erstellen des Raums: ' + error.message, 'error');
    }
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

function generateDefaultAvatar(uid) {
    // Einfacher Avatar-Generator basierend auf UID
    const colors = ['#ff6b35', '#f7931e', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    const colorIndex = uid ? uid.length % colors.length : 0;
    const color = colors[colorIndex];
    
    // Erstelle einen einfachen SVG-Avatar
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

function openModal(modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Toast anzeigen
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Toast nach 4 Sekunden entfernen
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// User Settings
function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Bildvalidierung
    if (!file.type.startsWith('image/')) {
        showToast('Bitte wähle eine gültige Bilddatei!', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        showToast('Bild ist zu groß! Maximum 5MB.', 'error');
        return;
    }
    
    // Mock-Implementation
    const reader = new FileReader();
    reader.onload = (e) => {
        const newImageUrl = e.target.result;
        profileImage.src = newImageUrl;
        document.getElementById('currentProfileImg').src = newImageUrl;
        showToast('Profilbild erfolgreich aktualisiert!', 'success');
        
        // Hier würdest du das Bild zu Firebase Storage hochladen
        // und die URL in der Firestore-Datenbank speichern
    };
    reader.readAsDataURL(file);
}

function saveUserSettings() {
    if (!currentUser) return;
    
    const displayName = document.getElementById('displayName').value;
    const soundEnabled = document.getElementById('soundEnabled').checked;
    
    // Mock-Implementation
    userName.textContent = displayName || 'Spieler';
    showToast('Einstellungen gespeichert!', 'success');
    
    // Uncomment when Firebase is configured:
    /*
    const userRef = doc(db, 'users', currentUser.uid);
    setDoc(userRef, {
        displayName: displayName,
        soundEnabled: soundEnabled,
        updatedAt: new Date()
    }, { merge: true });
    */
}

// Stats Management
function loadUserStats() {
    if (!currentUser) {
        gamesWonEl.textContent = '0';
        gamesPlayedEl.textContent = '0';
        return;
    }
    
    // Mock-Daten
    gamesWonEl.textContent = Math.floor(Math.random() * 20);
    gamesPlayedEl.textContent = Math.floor(Math.random() * 50);
    
    // Uncomment when Firebase is configured:
    /*
    const userStatsRef = doc(db, 'userStats', currentUser.uid);
    getDoc(userStatsRef).then((doc) => {
        if (doc.exists()) {
            const stats = doc.data();
            gamesWonEl.textContent = stats.gamesWon || 0;
            gamesPlayedEl.textContent = stats.gamesPlayed || 0;
        }
    });
    */
}

function updateOnlinePlayersCount() {
    // Mock-Implementierung
    const count = Math.floor(Math.random() * 100) + 20;
    onlinePlayersEl.textContent = count;
    
    // Aktualisiere alle 30 Sekunden
    setTimeout(updateOnlinePlayersCount, 30000);
    
    // Uncomment when Firebase is configured:
    /*
    const onlineUsersRef = collection(db, 'onlineUsers');
    onSnapshot(onlineUsersRef, (snapshot) => {
        onlinePlayersEl.textContent = snapshot.size;
    });
    */
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // ESC schließt Modals
    if (e.key === 'Escape') {
        closeModal(settingsModal);
        closeModal(createRoomModal);
    }
    
    // Ctrl/Cmd + Enter für schnelles Raum erstellen
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && currentUser) {
        if (!createRoomModal.classList.contains('active')) {
            openModal(createRoomModal);
        }
    }
});

// Service Worker für PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}