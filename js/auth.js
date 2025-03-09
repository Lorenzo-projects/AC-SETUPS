class Auth {
    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.user = this.loadUserFromStorage();
        this.loginBtn = document.getElementById('login-btn');
        this.profileLink = document.getElementById('profile-link');
        this.setupAuthListeners();
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('user');
        if (!userData) return null;
        try {
            const user = JSON.parse(userData);
            // Verifica se il token è scaduto
            if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
                localStorage.removeItem('user');
                return null;
            }
            return user;
        } catch (e) {
            localStorage.removeItem('user');
            return null;
        }
    }

    setupAuthListeners() {
        this.updateUI();
        this.loginBtn.addEventListener('click', () => {
            if (this.user) {
                this.logout();
            } else {
                this.showLoginModal();
            }
        });
    }

    showLoginModal() {
        // Remove any existing modals
        document.querySelectorAll('.auth-modal').forEach(modal => modal.remove());

        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="modal-header">
                    <i class="fas fa-user-circle"></i>
                    <h2>Welcome to AC Setup Share</h2>
                    <p>Login or create a new account</p>
                </div>
                <div class="auth-tabs">
                    <button class="tab active" data-tab="login">Login</button>
                    <button class="tab" data-tab="register">Register</button>
                </div>
                <form id="login-form" class="auth-form active">
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-envelope"></i>
                            <input type="email" name="email" required placeholder="Email">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-lock"></i>
                            <input type="password" name="password" required placeholder="Password">
                        </div>
                    </div>
                    <button type="submit" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
                <form id="register-form" class="auth-form">
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-user"></i>
                            <input type="text" name="username" required placeholder="Username">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-envelope"></i>
                            <input type="email" name="email" required placeholder="Email">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-phone"></i>
                            <input type="tel" name="phone" placeholder="Phone Number (optional)">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-lock"></i>
                            <input type="password" name="password" required placeholder="Password">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-lock"></i>
                            <input type="password" name="confirmPassword" required placeholder="Confirm Password">
                        </div>
                    </div>
                    <button type="submit" class="register-btn">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </form>
                <div class="social-login">
                    <button type="button" class="google-login">
                        <i class="fab fa-google"></i> Continue with Google
                    </button>
                    <button type="button" class="phone-login">
                        <i class="fas fa-phone"></i> Login with Phone
                    </button>
                </div>
                <div class="divider">
                    <span>or</span>
                </div>
                <button type="button" class="guest-login">
                    <i class="fas fa-user-clock"></i> Continue as Guest
                </button>
                <button class="close-modal" aria-label="Close modal">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.body.style.overflow = 'hidden'; // Prevent body scroll

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Close modal when ESC is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        });

        // Smooth transitions
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });

        // Event listeners
        const tabs = modal.querySelectorAll('.tab');
        const forms = modal.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.toggle('active', t === tab));
                forms.forEach(f => f.classList.toggle('active', f.id === `${target}-form`));
            });
        });

        modal.querySelector('#login-form').onsubmit = async (e) => {
            e.preventDefault();
            const success = await this.handleLogin(
                e.target.email.value,
                e.target.password.value
            );
            if (success) modal.remove();
        };

        modal.querySelector('#register-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            
            if (form.password.value !== form.confirmPassword.value) {
                alert('Passwords do not match');
                return;
            }

            try {
                const userCredential = await this.register({
                    username: form.username.value,
                    email: form.email.value,
                    password: form.password.value,
                    phone: form.phone.value
                });
                
                if (userCredential) {
                    modal.remove();
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert(error.message);
            }
        };

        modal.querySelector('.guest-login').onclick = () => {
            this.loginAsGuest();
            modal.remove();
        };

        modal.querySelector('.close-modal').onclick = () => modal.remove();

        modal.querySelector('.google-login').onclick = () => this.signInWithGoogle();
        modal.querySelector('.phone-login').onclick = () => this.showPhoneLoginUI();
    }

    closeModal(modal) {
        document.body.style.overflow = '';
        modal.style.opacity = '0';
        modal.addEventListener('transitionend', () => {
            modal.remove();
        });
    }

    async handleLogin(email, password) {
        try {
            this.showLoading();
            
            const credential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Attendiamo esplicitamente il recupero dei dati
            const userDoc = await this.db.collection('users').doc(credential.user.uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User data not found');
            }

            const userData = userDoc.data();
            const user = {
                uid: credential.user.uid,
                username: userData.username || email.split('@')[0],
                displayName: userData.firstName ? 
                    `${userData.firstName} ${userData.lastName}` : 
                    userData.username || email.split('@')[0],
                type: 'registered',
                createdAt: userData.createdAt || new Date().toISOString(),
                profile: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    age: userData.age || '',
                    discord: userData.discord || '',
                    instagram: userData.instagram || '',
                    steamId: userData.steamId || '',
                    experienceLevel: userData.experienceLevel || 'beginner',
                    realVehicles: userData.realVehicles || '',
                    bio: userData.bio || '',
                    notifications: userData.notifications || true,
                    setupsShared: userData.setupsShared || 0,
                    setupsDownloaded: userData.setupsDownloaded || 0
                }
            };
            
            this.setUser(user);
            i18n.showNotification('login.success', 'success');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            i18n.showNotification('login.error', 'error');
            return false;
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div>Loading...</div>';
        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }

    async saveProfile(profileData) {
        try {
            // Aggiorna in Firestore
            await this.db.collection('users').doc(this.user.uid).update({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Aggiorna localmente
            this.user.profile = profileData;
            this.user.displayName = `${profileData.firstName} ${profileData.lastName}`.trim() || this.user.username;
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return true;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    async register({ username, email, password, phone }) {
        try {
            this.showLoading();
            
            // Create auth user
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile
            await user.updateProfile({
                displayName: username
            });

            // Create Firestore profile
            const userData = {
                username,
                email,
                phone: phone || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'registered',
                setupsShared: 0,
                setupsDownloaded: 0,
                experienceLevel: 'beginner',
                notifications: true
            };

            // Attendiamo esplicitamente la creazione del documento
            await this.db.collection('users').doc(user.uid).set(userData);

            // Aggiorniamo lo stato locale
            const completeUser = {
                uid: user.uid,
                username: username,
                displayName: username,
                type: 'registered',
                createdAt: new Date().toISOString(),
                profile: userData
            };

            this.setUser(completeUser);
            i18n.showNotification('auth.registrationSuccess', 'success');
            
            return userCredential;
        } catch (error) {
            console.error('Registration error:', error);
            i18n.showNotification('auth.registrationError', 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async signInWithGoogle() {
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Create new user profile
                await this.db.collection('users').doc(user.uid).set({
                    username: user.displayName,
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    type: 'registered',
                    setupsShared: 0,
                    setupsDownloaded: 0,
                    experienceLevel: 'beginner',
                    notifications: true
                });
            }

            return true;
        } catch (error) {
            console.error('Google sign-in error:', error);
            alert(error.message);
            return false;
        }
    }

    showPhoneLoginUI() {
        // Initialize reCAPTCHA verifier
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible'
            });
        }

        const phoneModal = document.createElement('div');
        phoneModal.className = 'auth-modal';
        phoneModal.innerHTML = `
            <div class="auth-modal-content">
                <div class="modal-header">
                    <i class="fas fa-phone"></i>
                    <h2>Phone Authentication</h2>
                </div>
                <form id="phone-auth-form" class="auth-form active">
                    <div class="form-group">
                        <div class="input-with-icon">
                            <i class="fas fa-phone"></i>
                            <input type="tel" name="phone" required placeholder="+1234567890">
                        </div>
                    </div>
                    <div id="recaptcha-container"></div>
                    <button type="submit" class="login-btn">
                        <i class="fas fa-paper-plane"></i> Send Code
                    </button>
                </form>
                <button class="close-modal">&times;</button>
            </div>
        `;

        document.body.appendChild(phoneModal);

        phoneModal.querySelector('#phone-auth-form').onsubmit = async (e) => {
            e.preventDefault();
            const phoneNumber = e.target.phone.value;
            
            try {
                const confirmationResult = await this.auth.signInWithPhoneNumber(
                    phoneNumber, 
                    window.recaptchaVerifier
                );
                
                // Store the confirmation result
                window.confirmationResult = confirmationResult;
                
                // Show verification code input
                this.showVerificationCodeUI(phoneModal);
            } catch (error) {
                console.error('Phone auth error:', error);
                alert(error.message);
            }
        };
    }

    loginAsGuest() {
        const guestUser = {
            uid: 'guest-' + Date.now(),
            username: 'guest',
            displayName: 'Guest User',
            type: 'guest',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 ore
            restrictions: ['upload', 'profile_edit'],
            preferences: {
                favoriteTrack: '',
                favoriteCar: '',
                notifications: false
            }
        };
        this.setUser(guestUser);
    }

    canPerformAction(action) {
        if (!this.user) return false;
        if (this.user.type === 'guest' && this.user.restrictions.includes(action)) {
            alert('This action requires a registered account. Please login or register.');
            return false;
        }
        return true;
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateUI();
        app.loadPage(app.currentPage);
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = `Welcome ${this.user.displayName}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    async logout() {
        this.user = null;
        localStorage.removeItem('user');
        this.updateUI();
        app.loadPage('home');
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = 'Logged out successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    updateUI() {
        if (this.loginBtn) {
            this.loginBtn.textContent = this.user ? 'Logout' : 'Login';
            this.loginBtn.className = this.user ? 'logged-in' : '';
        }
        if (this.profileLink) {
            this.profileLink.style.display = this.user ? 'inline' : 'none';
        }
        // Aggiorna header con info utente
        const userInfo = document.getElementById('user-info') || this.createUserInfo();
        if (this.user) {
            userInfo.innerHTML = `
                <span class="user-name">${this.user.displayName}</span>
                <span class="user-type">${this.user.type}</span>
            `;
            userInfo.style.display = 'flex';
        } else {
            userInfo.style.display = 'none';
        }
    }

    createUserInfo() {
        const userInfo = document.createElement('div');
        userInfo.id = 'user-info';
        document.querySelector('.nav-links').insertBefore(
            userInfo,
            document.querySelector('#login-btn')
        );
        return userInfo;
    }
}

const auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
        const user = JSON.parse(localStorage.getItem('user'));
        callback(user);
    }
};

const authInstance = new Auth();
