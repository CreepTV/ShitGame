// auth.js - Authentifizierungslogik für die Auth-Seite

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyWBnRZ95ZUn9qAaWRjvtmJk82DYKOL2M",
    authDomain: "stuff-happens-7b0a6.firebaseapp.com",
    projectId: "stuff-happens-7b0a6",
    storageBucket: "stuff-happens-7b0a6.firebasestorage.app",
    messagingSenderId: "355014820989",
    appId: "1:355014820989:web:4bbf20bbb0e97a651c1d14",
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.app = null;
        this.auth = null;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            // Warten auf Firebase-Initialisierung
            await this.waitForFirebase();
            
            // Firebase initialisieren
            this.initializeFirebase();
            
            // Event Listeners setzen
            this.setupEventListeners();
            
            // Auth State Observer
            this.setupAuthStateObserver();
            
            // Check URL parameters for initial form display
            this.checkUrlParams();
            
            this.isInitialized = true;
            console.log('AuthManager initialized successfully');
        } catch (error) {
            console.error('Error initializing AuthManager:', error);
            this.showToast('Fehler beim Laden der Authentifizierung', 'error');
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase && window.firebase.auth) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    initializeFirebase() {
        try {
            // Firebase App initialisieren
            this.app = window.firebase.initializeApp(firebaseConfig);
            this.auth = window.firebase.auth();
            this.db = window.firebase.firestore();
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Form switches
        document.getElementById('showRegisterForm')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });

        document.getElementById('showLoginForm')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('reset');
        });

        document.getElementById('backToLoginForm')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Password toggles
        document.getElementById('loginPasswordToggle')?.addEventListener('click', () => {
            this.togglePassword('loginPassword', 'loginPasswordToggle');
        });

        document.getElementById('registerPasswordToggle')?.addEventListener('click', () => {
            this.togglePassword('registerPassword', 'registerPasswordToggle');
        });

        // Form submissions
        document.getElementById('loginFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('resetFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordReset();
        });

        // Social login buttons
        document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        document.getElementById('googleRegisterBtn')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        document.getElementById('guestLoginBtn')?.addEventListener('click', () => {
            this.handleGuestLogin();
        });

        // Password strength checker
        document.getElementById('registerPassword')?.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Password confirmation checker
        document.getElementById('registerPasswordConfirm')?.addEventListener('input', () => {
            this.checkPasswordConfirmation();
        });

        // Real-time validation
        document.getElementById('registerName')?.addEventListener('input', (e) => {
            this.validatePlayerName(e.target.value);
        });

        document.getElementById('registerEmail')?.addEventListener('input', (e) => {
            this.validateEmail(e.target.value, 'registerEmailError');
        });

        document.getElementById('loginEmail')?.addEventListener('input', (e) => {
            this.validateEmail(e.target.value, 'loginEmailError');
        });

        document.getElementById('resetEmail')?.addEventListener('input', (e) => {
            this.validateEmail(e.target.value, 'resetEmailError');
        });
    }

    setupAuthStateObserver() {
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('User signed in:', user.email);
                    // Redirect to main page after successful login
                    this.showToast('Erfolgreich angemeldet!', 'success');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                } else {
                    console.log('User signed out');
                    this.currentUser = null;
                }
            });
        }
    }

    // Check URL parameters for initial form display
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'register') {
            this.showForm('register');
        } else if (mode === 'reset') {
            this.showForm('reset');
        }
        // Default is login form (already shown)
        
        // Clean up URL parameters for better UX
        if (mode) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }

    showForm(formType) {
        const forms = ['loginForm', 'registerForm', 'resetForm'];
        
        forms.forEach(form => {
            const element = document.getElementById(form);
            if (element) {
                element.style.display = 'none';
            }
        });

        const targetForm = document.getElementById(formType + 'Form');
        if (targetForm) {
            targetForm.style.display = 'block';
            targetForm.scrollIntoView({ behavior: 'smooth' });
        }

        // Clear previous errors
        this.clearErrors();
    }

    togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        
        if (input && toggle) {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!this.validateEmail(email, 'loginEmailError') || !this.validatePassword(password, 'loginPasswordError')) {
            return;
        }

        this.showLoading('Anmeldung läuft...');

        try {
            // Firebase Auth Persistence
            const persistence = rememberMe ? 
                window.firebase.auth.Auth.Persistence.LOCAL : 
                window.firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);

            // Sign in
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Update user profile if needed
            await this.updateUserProfile(userCredential.user);
            
            this.showToast('Erfolgreich angemeldet!', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError(error);
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerPasswordConfirm').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validation
        if (!this.validatePlayerName(name) || 
            !this.validateEmail(email, 'registerEmailError') || 
            !this.validatePassword(password, 'registerPasswordError') ||
            !this.checkPasswordConfirmation() ||
            !acceptTerms) {
            
            if (!acceptTerms) {
                this.showToast('Bitte akzeptiere die Nutzungsbedingungen', 'error');
            }
            return;
        }

        this.showLoading('Registrierung läuft...');

        try {
            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            await this.createUserProfile(userCredential.user, name);
            
            // Send verification email
            await userCredential.user.sendEmailVerification();
            
            this.showToast('Registrierung erfolgreich! Bitte bestätige deine E-Mail.', 'success');
            
        } catch (error) {
            console.error('Registration error:', error);
            this.handleAuthError(error);
        } finally {
            this.hideLoading();
        }
    }

    async handlePasswordReset() {
        const email = document.getElementById('resetEmail').value.trim();

        if (!this.validateEmail(email, 'resetEmailError')) {
            return;
        }

        this.showLoading('Reset-Link wird gesendet...');

        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showToast('Reset-Link wurde an deine E-Mail gesendet!', 'success');
            this.showForm('login');
        } catch (error) {
            console.error('Password reset error:', error);
            this.handleAuthError(error);
        } finally {
            this.hideLoading();
        }
    }

    async handleGoogleLogin() {
        this.showLoading('Google-Anmeldung läuft...');

        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await this.auth.signInWithPopup(provider);
            
            // Create/update user profile
            await this.updateUserProfile(result.user);
            
            this.showToast('Erfolgreich mit Google angemeldet!', 'success');
            
        } catch (error) {
            console.error('Google login error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                this.handleAuthError(error);
            }
        } finally {
            this.hideLoading();
        }
    }

    async handleGuestLogin() {
        this.showLoading('Gast-Anmeldung läuft...');

        try {
            const result = await this.auth.signInAnonymously();
            
            // Set guest display name
            await result.user.updateProfile({
                displayName: 'Gast_' + Math.random().toString(36).substr(2, 5)
            });
            
            this.showToast('Als Gast angemeldet!', 'success');
            
        } catch (error) {
            console.error('Guest login error:', error);
            this.handleAuthError(error);
        } finally {
            this.hideLoading();
        }
    }

    async createUserProfile(user, displayName) {
        try {
            if (this.db) {
                await this.db.collection('users').doc(user.uid).set({
                    displayName: displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                    gamesPlayed: 0,
                    gamesWon: 0,
                    isOnline: true
                });
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    async updateUserProfile(user) {
        try {
            if (this.db) {
                const userRef = this.db.collection('users').doc(user.uid);
                
                // Check if user document exists
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    // Update existing user
                    await userRef.update({
                        lastLoginAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                        isOnline: true
                    });
                } else {
                    // Create new user document
                    await userRef.set({
                        displayName: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL,
                        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                        lastLoginAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                        gamesPlayed: 0,
                        gamesWon: 0,
                        isOnline: true
                    });
                }
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    }

    validatePlayerName(name) {
        const errorElement = document.getElementById('registerNameError');
        
        if (!name || name.length < 2) {
            this.showError(errorElement, 'Name muss mindestens 2 Zeichen lang sein');
            return false;
        }
        
        if (name.length > 20) {
            this.showError(errorElement, 'Name darf maximal 20 Zeichen lang sein');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            this.showError(errorElement, 'Name darf nur Buchstaben, Zahlen, - und _ enthalten');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    }

    validateEmail(email, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError(errorElement, 'E-Mail ist erforderlich');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError(errorElement, 'Ungültige E-Mail-Adresse');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    }

    validatePassword(password, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        
        if (!password) {
            this.showError(errorElement, 'Passwort ist erforderlich');
            return false;
        }
        
        if (password.length < 6) {
            this.showError(errorElement, 'Passwort muss mindestens 6 Zeichen lang sein');
            return false;
        }
        
        this.hideError(errorElement);
        return true;
    }

    checkPasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        const strengthText = strengthElement.querySelector('.strength-text');
        
        if (!password) {
            strengthElement.className = 'password-strength';
            strengthText.textContent = 'Passwortstärke';
            return;
        }

        let score = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        // Determine strength
        if (score < 2) {
            strengthElement.className = 'password-strength weak';
            feedback = 'Schwach';
        } else if (score < 4) {
            strengthElement.className = 'password-strength fair';
            feedback = 'Ausreichend';
        } else if (score < 6) {
            strengthElement.className = 'password-strength good';
            feedback = 'Gut';
        } else {
            strengthElement.className = 'password-strength strong';
            feedback = 'Stark';
        }

        strengthText.textContent = feedback;
    }

    checkPasswordConfirmation() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerPasswordConfirm').value;
        const errorElement = document.getElementById('registerPasswordConfirmError');

        if (!confirmPassword) {
            this.hideError(errorElement);
            return true; // Don't show error if field is empty
        }

        if (password !== confirmPassword) {
            this.showError(errorElement, 'Passwörter stimmen nicht überein');
            return false;
        }

        this.hideError(errorElement);
        return true;
    }

    showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    hideError(element) {
        if (element) {
            element.classList.remove('show');
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
        });
    }

    handleAuthError(error) {
        let message = 'Ein Fehler ist aufgetreten';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Kein Benutzer mit dieser E-Mail gefunden';
                break;
            case 'auth/wrong-password':
                message = 'Falsches Passwort';
                break;
            case 'auth/email-already-in-use':
                message = 'Diese E-Mail ist bereits registriert';
                break;
            case 'auth/weak-password':
                message = 'Passwort ist zu schwach';
                break;
            case 'auth/invalid-email':
                message = 'Ungültige E-Mail-Adresse';
                break;
            case 'auth/user-disabled':
                message = 'Dieses Konto wurde deaktiviert';
                break;
            case 'auth/too-many-requests':
                message = 'Zu viele Anmeldeversuche. Bitte versuche es später erneut';
                break;
            case 'auth/network-request-failed':
                message = 'Netzwerkfehler. Bitte prüfe deine Internetverbindung';
                break;
            default:
                message = error.message || 'Ein unbekannter Fehler ist aufgetreten';
        }
        
        this.showToast(message, 'error');
    }

    showLoading(text = 'Wird geladen...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay && loadingText) {
            loadingText.textContent = text;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-exclamation-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            default:
                return 'fas fa-info-circle';
        }
    }
}

// Initialize AuthManager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.authManager && window.authManager.currentUser) {
        // Update user online status
        if (document.hidden) {
            // User switched away from page
            window.authManager.updateUserStatus(false);
        } else {
            // User returned to page
            window.authManager.updateUserStatus(true);
        }
    }
});

// Add method to update user online status
AuthManager.prototype.updateUserStatus = async function(isOnline) {
    try {
        if (this.currentUser && this.db) {
            await this.db.collection('users').doc(this.currentUser.uid).update({
                isOnline: isOnline,
                lastSeenAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating user status:', error);
    }
};
