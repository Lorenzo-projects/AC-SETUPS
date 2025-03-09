class App {
    constructor() {
        this.contentDiv = document.getElementById('content');
        this.setupRouting();
        this.currentPage = 'home';
        this.loadPage('home');
        this.setupTranslationListener();
        this.templates = {
            home: `
                <div class="home-container">
                    <h1 data-i18n="home.title">Welcome to AC Setup Share</h1>
                    <p data-i18n="home.description">Free Assetto Corsa setup sharing platform</p>
                    <div class="donate-banner">
                        <h3 data-i18n="home.donateMsg">Support this project</h3>
                        <a href="https://paypal.me/LorenzoAscanio" class="donate-btn">PayPal</a>
                    </div>
                </div>`,
            search: `
                <div class="search-container">
                    <div class="search-filters">
                        <select id="car-filter">
                            <option value="">All Cars</option>
                        </select>
                        <select id="track-filter">
                            <option value="">All Tracks</option>
                        </select>
                        <input type="text" id="search-input" placeholder="Search setups...">
                    </div>
                    <div id="setups-grid" class="setups-grid"></div>
                </div>`,
            upload: `
                <div class="upload-container">
                    <form id="setup-form" class="setup-form">
                        <select id="car-select" required>
                            <option value="">Select Car</option>
                        </select>
                        <select id="track-select" required>
                            <option value="">Select Track</option>
                        </select>
                        <input type="file" id="setup-file" accept=".ini" required>
                        <textarea id="setup-description" placeholder="Setup description..."></textarea>
                        <button type="submit" data-i18n="upload.submit">Upload Setup</button>
                    </form>
                </div>`,
            profile: `
                <div class="profile-content">
                    <div class="page-header">
                        <i class="fas fa-user-circle header-icon"></i>
                        <div class="header-text">
                            <h1>Driver Profile</h1>
                            <p>Customize your racing profile</p>
                        </div>
                    </div>

                    <div class="profile-stats">
                        <div class="profile-stat">
                            <i class="fas fa-trophy"></i>
                            <div class="label">Experience</div>
                            <div class="value" id="exp-level">Beginner</div>
                        </div>
                        <div class="profile-stat">
                            <i class="fas fa-car"></i>
                            <div class="label">Real Vehicles</div>
                            <div class="value" id="vehicles-count">0</div>
                        </div>
                        <div class="profile-stat">
                            <i class="fas fa-upload"></i>
                            <div class="label">Shared Setups</div>
                            <div class="value" id="setups-count">0</div>
                        </div>
                    </div>

                    <form id="profile-form" class="profile-form">
                        <div class="form-sections">
                            <div class="form-section">
                                <div class="section-header">
                                    <i class="fas fa-id-card"></i>
                                    <h3>Personal Information</h3>
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="firstName">First Name</label>
                                        <input type="text" id="firstName" name="firstName" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="lastName">Last Name</label>
                                        <input type="text" id="lastName" name="lastName" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="text" id="username" name="username" required>
                                </div>
                                <div class="form-group">
                                    <label for="age">Age</label>
                                    <input type="number" id="age" name="age" min="13" max="100">
                                </div>
                            </div>

                            <div class="form-section">
                                <div class="section-header">
                                    <i class="fas fa-share-alt"></i>
                                    <h3>Social Media</h3>
                                </div>
                                <div class="form-group social-input">
                                    <i class="fab fa-discord"></i>
                                    <input type="text" id="discord" name="discord" placeholder="username#0000">
                                </div>
                                <div class="form-group social-input">
                                    <i class="fab fa-instagram"></i>
                                    <input type="text" id="instagram" name="instagram" placeholder="@yourusername">
                                </div>
                                <div class="form-group social-input">
                                    <i class="fab fa-steam"></i>
                                    <input type="text" id="steam-id" name="steamId" placeholder="Your Steam ID">
                                </div>
                            </div>

                            <div class="form-section">
                                <div class="section-header">
                                    <i class="fas fa-car-side"></i>
                                    <h3>Racing Experience</h3>
                                </div>
                                <div class="form-group">
                                    <label for="real-vehicles">Real Cars/Motorcycles</label>
                                    <textarea id="real-vehicles" name="realVehicles" 
                                        placeholder="List your vehicles (e.g. BMW M3 E46, Ducati Panigale V4)"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="experience-level">Racing Experience</label>
                                    <select id="experience-level" name="experienceLevel" class="styled-select">
                                        <option value="beginner">🔰 Beginner</option>
                                        <option value="intermediate">🏁 Intermediate</option>
                                        <option value="advanced">🏆 Advanced</option>
                                        <option value="professional">👑 Professional</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-section">
                                <div class="section-header">
                                    <i class="fas fa-user-edit"></i>
                                    <h3>Bio & Info</h3>
                                </div>
                                <div class="form-group">
                                    <label for="bio">Short Bio</label>
                                    <textarea id="bio" name="bio" class="bio-textarea" 
                                        placeholder="Tell the community about yourself, your racing style, and experience..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="preferred-cars">Favorite Cars</label>
                                    <input type="text" id="preferred-cars" name="preferredCars" 
                                        placeholder="Your favorite cars in AC">
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="save-profile-btn">
                                <i class="fas fa-save"></i> Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            `
        };
    }

    setupRouting() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
            });
        });
    }

    setupTranslationListener() {
        document.addEventListener('languageChanged', () => {
            if (this.currentPage) {
                this.loadPage(this.currentPage);
            }
        });
    }

    async loadPage(page) {
        try {
            // Carica il template direttamente dalla memoria invece che dal file system
            const content = this.templates[page];
            if (!content) {
                throw new Error(`Page template not found: ${page}`);
            }
            this.contentDiv.innerHTML = content;
            this.currentPage = page;
            this.initializePageFunctionality(page);
            i18n.updateContent();
        } catch (error) {
            console.error('Error loading page:', error);
            this.contentDiv.innerHTML = `<div class="error">Error loading page: ${page}</div>`;
        }
    }

    initializePageFunctionality(page) {
        switch(page) {
            case 'upload':
                this.initializeUpload();
                break;
            case 'search':
                this.initializeSearch();
                break;
            case 'profile':
                this.initializeProfile();
                break;
        }
    }

    async initializeUpload() {
        if (!authInstance.user || !authInstance.canPerformAction('upload')) {
            this.contentDiv.innerHTML = `
                <div class="upload-restricted">
                    <h2>Upload Restricted</h2>
                    <p>Only registered users can upload setups.</p>
                    <div class="login-prompt">
                        <p>Please login with a registered account to upload setups.</p>
                        <button onclick="authInstance.showLoginModal()" class="btn-primary">
                            Login / Register
                        </button>
                    </div>
                </div>`;
            return;
        }
        
        // Aspetta che il DOM sia completamente caricato
        setTimeout(() => {
            const form = document.getElementById('setup-form');
            if (!form) {
                console.error('Setup form not found');
                return;
            }

            const carSelect = form.querySelector('#car-select');
            const trackSelect = form.querySelector('#track-select');
            
            if (!carSelect || !trackSelect) {
                console.error('Car or track select not found');
                return;
            }

            // Popola i select
            this.populateFilters(carSelect, trackSelect);

            const previewDiv = document.createElement('div');
            previewDiv.className = 'setup-preview';
            form.insertBefore(previewDiv, form.querySelector('button[type="submit"]'));

            // Aggiungi listener per l'aggiornamento in tempo reale
            const updatePreview = () => {
                const car = carSelect.value;
                const track = trackSelect.value;
                if (car || track) {
                    previewDiv.innerHTML = `
                        <div class="preview-card">
                            <h4>Setup Preview</h4>
                            ${car ? `<div class="preview-item"><strong>Car:</strong> ${car}</div>` : ''}
                            ${track ? `<div class="preview-item"><strong>Track:</strong> ${track}</div>` : ''}
                            ${car && track ? `<div class="preview-image">
                                <img src="assets/cars/${car.toLowerCase().replace(/\s+/g, '-')}.jpg" 
                                     onerror="this.src='assets/placeholder.jpg'" alt="${car}">
                                <img src="assets/tracks/${track.toLowerCase().replace(/\s+/g, '-')}.jpg"
                                     onerror="this.src='assets/placeholder.jpg'" alt="${track}">
                            </div>` : ''}
                        </div>
                    `;
                } else {
                    previewDiv.innerHTML = '';
                }
            };

            carSelect.addEventListener('change', updatePreview);
            trackSelect.addEventListener('change', updatePreview);

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                await this.uploadSetup(formData);
            });
        }, 100);
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

    async uploadSetup(formData) {
        this.showLoading();
        try {
            const file = formData.get('setup-file');
            const response = await fetch('https://api.github.com/repos/' + 
                `${githubConfig.owner}/${githubConfig.repo}/contents/setups/${file.name}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Upload setup file',
                    content: await this.fileToBase64(file)
                })
            });
            
            if (response.ok) {
                await this.saveSetupMetadata(formData, file.name);
            }
            alert(i18n.translate('upload.success'));
        } catch (error) {
            console.error('Upload error:', error);
            alert(i18n.translate('upload.error'));
        } finally {
            this.hideLoading();
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    async saveSetupMetadata(formData, filename) {
        const setup = {
            id: Date.now().toString(),
            car: formData.get('car-select'),
            track: formData.get('track-select'),
            trackCondition: formData.get('track-condition'),
            trackTemp: formData.get('track-temp'),
            setupType: formData.get('setup-type'),
            setupName: formData.get('setup-name'),
            bestLaptime: formData.get('best-laptime'),
            fuelLoad: formData.get('fuel-load'),
            tyrePressures: {
                FL: formData.get('tyre-fl'),
                FR: formData.get('tyre-fr'),
                RL: formData.get('tyre-rl'),
                RR: formData.get('tyre-rr')
            },
            description: formData.get('setup-description'),
            tags: formData.get('setup-tags').split(',').map(tag => tag.trim()),
            filename: filename,
            userId: authInstance.user.uid,
            username: authInstance.user.username,
            timestamp: new Date().toISOString()
        };

        const setups = JSON.parse(localStorage.getItem('setups') || '[]');
        setups.push(setup);
        localStorage.setItem('setups', JSON.stringify(setups));
    }

    async initializeSearch() {
        const setupsGrid = document.getElementById('setups-grid');
        const carFilter = document.getElementById('car-filter');
        const trackFilter = document.getElementById('track-filter');
        const searchInput = document.getElementById('search-input');

        this.populateFilters(carFilter, trackFilter);
        
        const handleSearch = async () => {
            setupsGrid.innerHTML = '<div class="loading">Loading setups...</div>';
            try {
                // Carica i setup dal localStorage invece che da Firestore
                const setups = JSON.parse(localStorage.getItem('setups') || '[]');
                const filtered = setups.filter(setup => {
                    if (carFilter.value && setup.car !== carFilter.value) return false;
                    if (trackFilter.value && setup.track !== trackFilter.value) return false;
                    return true;
                });
                this.renderSetups({ empty: !filtered.length, docs: filtered.map(s => ({ data: () => s })) });
            } catch (error) {
                setupsGrid.innerHTML = '<div class="error">Error loading setups</div>';
            }
        };

        [carFilter, trackFilter, searchInput].forEach(el => 
            el.addEventListener('change', handleSearch));
        searchInput.addEventListener('keyup', debounce(handleSearch, 500));
        
        handleSearch();
    }

    async renderSetups(setups, container) {
        container.innerHTML = setups.empty ? 
            '<div class="no-setups">No setups found</div>' :
            setups.docs.map(doc => this.createSetupCard(doc)).join('');
    }

    createSetupCard(doc) {
        const data = doc.data();
        return `
            <div class="setup-card">
                <h3>${data.car} - ${data.track}</h3>
                <p>${data.description}</p>
                <div class="performance-stats">
                    <div class="stat">
                        <i class="fas fa-stopwatch"></i>
                        <span>${data.bestLaptime || 'No time set'}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-thermometer-half"></i>
                        <span>${data.trackTemp || 'N/A'}°C</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-gas-pump"></i>
                        <span>${data.fuelLoad || 'N/A'}L</span>
                    </div>
                </div>
                <button onclick="app.downloadSetup('${data.filename}')">
                    <i class="fas fa-download"></i> Download Setup
                </button>
            </div>
        `;
    }

    async downloadSetup(filename) {
        if (!authInstance.user) {
            alert('Please login to download setups');
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/setups/${filename}`, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`
                }
            });

            if (!response.ok) throw new Error('Setup not found');
            
            const data = await response.json();
            const content = atob(data.content);
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading setup');
        }
    }

    populateFilters(carSelect, trackSelect) {
        if (!carSelect || !trackSelect) return;

        // Svuota i select prima di ripopolarli
        carSelect.innerHTML = '<option value="">Select Car</option>';
        trackSelect.innerHTML = '<option value="">Select Track</option>';
        
        // Verifica che acData sia disponibile
        if (!window.acData) {
            console.error('acData not found');
            return;
        }

        // Popola il select delle auto
        window.acData.cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car;
            option.textContent = car;
            carSelect.appendChild(option);
        });

        // Popola il select delle piste
        window.acData.tracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track;
            option.textContent = track;
            trackSelect.appendChild(option);
        });

        // Aggiungi event listeners per debug
        carSelect.addEventListener('change', (e) => {
            console.log('Car selected:', e.target.value);
        });

        trackSelect.addEventListener('change', (e) => {
            console.log('Track selected:', e.target.value);
        });
    }

    async initializeProfile() {
        if (!authInstance.user) return;
        
        const profileContent = document.querySelector('.profile-content');
        if (!profileContent) return;

        const userData = authInstance.user.profile || {};
        
        // Popola tutti i campi del profilo
        Object.keys(userData).forEach(key => {
            const input = profileContent.querySelector(`#${key}`);
            if (input) {
                input.value = userData[key] || '';
            }
        });

        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedProfile = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                username: formData.get('username'),
                age: formData.get('age'),
                discord: formData.get('discord'),
                instagram: formData.get('instagram'),
                steamId: formData.get('steamId'),
                experienceLevel: formData.get('experienceLevel'),
                realVehicles: formData.get('realVehicles'),
                bio: formData.get('bio'),
                notifications: formData.get('notifications') === 'on'
            };
            
            this.saveProfile(updatedProfile);
        });
    }

    async saveProfile(profileData) {
        this.showLoading();
        try {
            // Salva in Firestore attraverso authInstance
            await authInstance.saveProfile(profileData);
            
            const toast = document.createElement('div');
            toast.className = 'toast-message success';
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Profile updated successfully
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (error) {
            console.error('Profile update error:', error);
            const toast = document.createElement('div');
            toast.className = 'toast-message error';
            toast.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                ${error.message || 'Error updating profile'}
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } finally {
            this.hideLoading();
        }
    }
}

const app = new App();
