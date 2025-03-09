const translations = {
    en: {
        home: {
            title: 'Welcome to AC Setup Share',
            description: 'Free Assetto Corsa setup sharing platform',
            donateMsg: 'Support this project'
        },
        search: {
            title: 'Search Setups',
            filterCar: 'Filter by Car',
            filterTrack: 'Filter by Track',
            searchPlaceholder: 'Search setups...'
        },
        upload: {
            title: 'Upload Setup',
            selectCar: 'Select Car',
            selectTrack: 'Select Track',
            description: 'Setup Description',
            submit: 'Upload Setup'
        },
        profile: {
            title: 'Profile Settings',
            steamId: 'Steam ID',
            experience: 'Experience Level',
            save: 'Save Profile',
            updateSuccess: 'Profile updated successfully',
            updateError: 'Error updating profile'
        },
        notifications: {
            login: {
                success: 'Successfully logged in',
                error: 'Login failed',
                required: 'Please login to continue'
            },
            profile: {
                saved: 'Profile successfully updated',
                error: 'Error updating profile'
            },
            upload: {
                success: 'Setup successfully uploaded',
                error: 'Error uploading setup',
                restricted: 'Only registered users can upload setups'
            },
            auth: {
                passwordMismatch: 'Passwords do not match',
                invalidCredentials: 'Invalid credentials',
                registrationSuccess: 'Registration successful',
                registrationError: 'Registration failed'
            }
        },
        buttons: {
            save: 'Save',
            cancel: 'Cancel',
            upload: 'Upload',
            login: 'Login',
            register: 'Register',
            close: 'Close'
        }
    },
    it: {
        home: {
            title: 'Benvenuto su AC Setup Share',
            description: 'Piattaforma gratuita di condivisione setup per Assetto Corsa',
            donateMsg: 'Supporta questo progetto'
        },
        search: {
            title: 'Cerca Setup',
            filterCar: 'Filtra per Auto',
            filterTrack: 'Filtra per Circuito',
            searchPlaceholder: 'Cerca setup...'
        },
        upload: {
            title: 'Carica Setup',
            selectCar: 'Seleziona Auto',
            selectTrack: 'Seleziona Circuito',
            description: 'Descrizione Setup',
            submit: 'Carica Setup'
        },
        profile: {
            title: 'Impostazioni Profilo',
            steamId: 'ID Steam',
            experience: 'Livello Esperienza',
            save: 'Salva Profilo',
            updateSuccess: 'Profilo aggiornato con successo',
            updateError: 'Errore durante aggiornamento'
        },
        notifications: {
            login: {
                success: 'Accesso effettuato con successo',
                error: 'Accesso fallito',
                required: 'Effettua il login per continuare'
            },
            profile: {
                saved: 'Profilo aggiornato con successo',
                error: 'Errore durante l\'aggiornamento del profilo'
            },
            upload: {
                success: 'Setup caricato con successo',
                error: 'Errore durante il caricamento',
                restricted: 'Solo gli utenti registrati possono caricare setup'
            },
            auth: {
                passwordMismatch: 'Le password non coincidono',
                invalidCredentials: 'Credenziali non valide',
                registrationSuccess: 'Registrazione completata',
                registrationError: 'Registrazione fallita'
            }
        },
        buttons: {
            save: 'Salva',
            cancel: 'Annulla',
            upload: 'Carica',
            login: 'Accedi',
            register: 'Registrati',
            close: 'Chiudi'
        }
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.languageSelect = document.getElementById('language-select');
        this.setupListeners();
    }

    setupListeners() {
        this.languageSelect.value = this.currentLang;
        this.languageSelect.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.updateContent();
    }

    translate(key) {
        try {
            return key.split('.').reduce((obj, i) => obj[i], translations[this.currentLang]) || key;
        } catch (error) {
            console.error(`Translation error for key: ${key}`, error);
            return key;
        }
    }

    updateContent() {
        try {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.translate(key);
                if (translation) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                } else {
                    console.warn(`Translation missing for key: ${key}`);
                }
            });
        } catch (error) {
            console.error('Error updating translations:', error);
        }
        document.dispatchEvent(new CustomEvent('languageChanged'));
    }

    showNotification(key, type = 'info') {
        const message = this.translate(`notifications.${key}`);
        const notification = document.createElement('div');
        notification.className = `site-notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${this.getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" title="${this.translate('buttons.close')}">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Rimuovi notifiche esistenti
        document.querySelectorAll('.site-notification').forEach(n => n.remove());

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        const timeout = setTimeout(() => this.closeNotification(notification), 5000);
        notification.querySelector('.notification-close').onclick = () => {
            clearTimeout(timeout);
            this.closeNotification(notification);
        };
    }

    closeNotification(notification) {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove());
    }

    getIconForType(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Sovrascrivi l'alert globale per usare il sistema di notifiche tradotto
window.alert = (message) => i18n.showNotification(message);

const i18n = new I18n();
