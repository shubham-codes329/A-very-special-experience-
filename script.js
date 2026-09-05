/* ================================================================
   DELICATE UNIVERSE - JAVASCRIPT (FIXED)
   Premium Interactive Birthday Experience
   ================================================================ */

// ================================================================
// 1. CONFIG & STATE MANAGEMENT
// ================================================================

const CONFIG = {
    totalPages: 12,
    storageKey: 'delicateUniverseData',
    defaultData: {
        recipientName: 'Beautiful',
        birthdayMessage: 'May this new year of your life bring you countless moments worth remembering, dreams worth chasing, and a heart full of joy. You deserve all the beautiful things this world has to offer.',
        futureWish: 'May the days ahead open doors to things you have always hoped for. May your path be filled with unexpected joy and discoveries that take your breath away.',
        closingMessage: 'Thank you for being exactly who you are. The world is brighter because you are in it. Here\'s to your most beautiful year yet. Happy Birthday. 🎂✨',
        wishes: [
            { icon: '💫', title: 'Happiness', back: 'May your days be filled with genuine laughter and pure joy.' },
            { icon: '🎯', title: 'Success', back: 'May every goal you chase become a victory you celebrate.' },
            { icon: '✨', title: 'Dreams', back: 'May your wildest dreams find their way into reality.' },
            { icon: '💝', title: 'Memories', back: 'May you create beautiful memories that last a lifetime.' }
        ],
        memories: [
            { title: 'First Moment', description: 'A cherished beginning', image: '' },
            { title: 'Special Times', description: 'Unforgettable moments', image: '' },
            { title: 'Beautiful Days', description: 'Shared joy and laughter', image: '' },
            { title: 'Precious Times', description: 'Moments to treasure', image: '' },
            { title: 'Happy Memories', description: 'Worth remembering forever', image: '' },
            { title: 'Next Chapter', description: 'Bright future ahead', image: '' }
        ],
        settings: {
            music: true,
            effects: true,
            reducedMotion: false
        }
    }
};

let state = {
    currentPage: 1,
    selectedName: 'Beautiful',
    loading: true,
    musicPlaying: false,
    data: {}
};

// Initialize state with data from localStorage
function initializeState() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            state.data = JSON.parse(stored);
        } else {
            state.data = JSON.parse(JSON.stringify(CONFIG.defaultData));
        }
    } catch (e) {
        console.error('State init error:', e);
        state.data = JSON.parse(JSON.stringify(CONFIG.defaultData));
    }
    state.selectedName = state.data.recipientName;
}

// ================================================================
// 2. SAFE DOM QUERY HELPERS
// ================================================================

const qs = (sel) => {
    try {
        return document.querySelector(sel);
    } catch (e) {
        console.error('Query error:', sel, e);
        return null;
    }
};

const qsa = (sel) => {
    try {
        return document.querySelectorAll(sel);
    } catch (e) {
        console.error('Query all error:', sel, e);
        return [];
    }
};

const byId = (id) => document.getElementById(id);

// ================================================================
// 3. CACHED ELEMENTS
// ================================================================

let elements = {};

function cacheElements() {
    elements = {
        loadingScreen: qs('#loadingScreen'),
        loadingProgress: qs('#loadingProgress'),
        musicToggle: qs('#musicToggle'),
        musicVolume: qs('#musicVolume'),
        pageProgress: qs('#pageProgress'),
        progressBar: qs('#progressBar'),
        pageCounter: qs('#pageCounter'),
        experienceContainer: qs('.experience-container'),
        backgroundMusic: qs('#backgroundMusic'),
        birthdayEffects: qs('#birthdayEffects')
    };
}

// ================================================================
// 4. DATA PERSISTENCE
// ================================================================

function saveDataToStorage() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.data));
        return true;
    } catch (e) {
        console.error('Save error:', e);
        return false;
    }
}

function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            state.data = JSON.parse(stored);
            return true;
        }
    } catch (e) {
        console.error('Load error:', e);
    }
    state.data = JSON.parse(JSON.stringify(CONFIG.defaultData));
    return false;
}

// ================================================================
// 5. LOADING SCREEN
// ================================================================

function initLoading() {
    const screen = elements.loadingScreen;
    if (!screen) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        if (elements.loadingProgress) {
            elements.loadingProgress.style.width = progress + '%';
        }
    }, 300);

    setTimeout(() => {
        clearInterval(interval);
        if (elements.loadingProgress) {
            elements.loadingProgress.style.width = '100%';
        }
        
        setTimeout(() => {
            if (screen) screen.classList.add('hidden');
            state.loading = false;
        }, 300);
    }, 1500);
}

// ================================================================
// 6. PAGE NAVIGATION
// ================================================================

function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > CONFIG.totalPages) return;
    if (pageNum === state.currentPage) return;

    // Hide current
    const current = qs(`[data-page="${state.currentPage}"]`);
    if (current) current.classList.remove('active');

    // Update state
    state.currentPage = pageNum;

    // Show new
    const next = qs(`[data-page="${pageNum}"]`);
    if (next) next.classList.add('active');

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const percent = (state.currentPage / CONFIG.totalPages) * 100;
    
    if (elements.progressBar) {
        elements.progressBar.style.width = percent + '%';
    }

    if (elements.pageCounter) {
        const curr = elements.pageCounter.querySelector('.current');
        const total = elements.pageCounter.querySelector('.total');
        if (curr) curr.textContent = state.currentPage;
        if (total) total.textContent = CONFIG.totalPages;
    }
}

// ================================================================
// 7. NAME SELECTION
// ================================================================

function initNameSelection() {
    const options = qsa('.name-option');
    const customBtn = byId('useCustomNameBtn');
    const customInput = byId('customNameInput');

    options.forEach(btn => {
        btn.addEventListener('click', function() {
            options.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedName = this.getAttribute('data-name');
            state.data.recipientName = state.selectedName;
            updateNameDisplay();
        });
    });

    if (customBtn && customInput) {
        customBtn.addEventListener('click', () => {
            const name = customInput.value.trim();
            if (name) {
                state.selectedName = name;
                state.data.recipientName = name;
                options.forEach(b => b.classList.remove('selected'));
                updateNameDisplay();
            }
        });

        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') customBtn.click();
        });
    }

    updateNameDisplay();
}

function updateNameDisplay() {
    const preview = qs('#selectedNamePreview');
    if (preview) {
        preview.textContent = `For ${state.selectedName} ❤️`;
    }
    updateRecipientNameEverywhere(state.selectedName);
}

function updateRecipientNameEverywhere(name) {
    qsa('[data-recipient-name]').forEach(el => {
        el.textContent = name;
    });
}

// ================================================================
// 8. NAVIGATION BUTTONS
// ================================================================

function initNavigation() {
    qsa('[data-next]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const nextPage = parseInt(btn.getAttribute('data-next'));
            goToPage(nextPage);
        });
    });

    const replayBtn = byId('replayExperienceBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            resetExperience();
        });
    }

    const backBtn = byId('backToBeginningBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            resetExperience();
        });
    }
}

function resetExperience() {
    state.currentPage = 0;

    qsa('.wish-card').forEach(card => {
        card.classList.remove('flipped');
    });

    qsa('.flame').forEach(flame => {
        flame.classList.remove('extinguished');
    });

    if (elements.birthdayEffects) {
        elements.birthdayEffects.innerHTML = '';
    }

    goToPage(1);
    updateProgress();
}

// ================================================================
// 9. WISH CARDS (3D FLIP)
// ================================================================

function initWishCards() {
    qsa('.wish-card').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });

    populateWishCards();
}

function populateWishCards() {
    const cards = qsa('.wish-card');
    
    state.data.wishes.forEach((wish, idx) => {
        if (!cards[idx]) return;

        const card = cards[idx];
        const icon = card.querySelector('.wish-icon');
        const frontTitle = card.querySelector('.wish-card-front strong');
        const backText = card.querySelector('.wish-card-back strong');

        if (icon) icon.textContent = wish.icon;
        if (frontTitle) frontTitle.textContent = wish.title;
        if (backText) backText.textContent = wish.back;
    });
}

// ================================================================
// 10. GALLERY / MEMORIES
// ================================================================

function initGallery() {
    const items = qsa('.memory-item');
    
    items.forEach((item, idx) => {
        if (!state.data.memories[idx]) return;

        const mem = state.data.memories[idx];
        const placeholder = item.querySelector('.memory-placeholder');
        const title = item.querySelector('.memory-placeholder-title');
        const desc = item.querySelector('.memory-placeholder-description');

        if (title) title.textContent = mem.title;
        if (desc) desc.textContent = mem.description;

        // If image exists, use it as background
        if (mem.image && mem.image.trim()) {
            if (placeholder) {
                placeholder.style.backgroundImage = `url('${mem.image}')`;
                placeholder.style.backgroundSize = 'cover';
                placeholder.style.backgroundPosition = 'center';
            }
        }
    });
}

// ================================================================
// 11. CAKE & CANDLES
// ================================================================

function initCake() {
    const cake = byId('birthdayCake');
    const celebrateBtn = byId('cakeCelebrateBtn');

    if (cake) {
        cake.addEventListener('click', triggerCelebration);
    }

    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', triggerCelebration);
    }

    qsa('.candle').forEach(candle => {
        candle.addEventListener('click', (e) => {
            e.stopPropagation();
            const flame = candle.querySelector('.flame');
            if (flame) {
                flame.classList.toggle('extinguished');
            }
        });
    });
}

function triggerCelebration() {
    createConfetti();
    createFireworks();
}

// ================================================================
// 12. CONFETTI
// ================================================================

function createConfetti() {
    const count = 50;
    for (let i = 0; i < count; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + '%';
        conf.style.top = '-10px';
        conf.style.backgroundColor = getRandomColor();
        conf.style.width = (Math.random() * 8 + 4) + 'px';
        conf.style.height = conf.style.width;
        conf.style.position = 'fixed';
        conf.style.pointerEvents = 'none';
        conf.style.zIndex = '200';
        conf.style.borderRadius = '50%';

        document.body.appendChild(conf);

        const duration = Math.random() * 3 + 2;
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 200;
        const startRot = Math.random() * 360;
        const endRot = startRot + Math.random() * 720;

        let startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / (duration * 1000);

            if (progress >= 1) {
                conf.remove();
                return;
            }

            const x = startX + (endX - startX) * progress;
            const y = window.innerHeight * progress;
            const rot = startRot + (endRot - startRot) * progress;

            conf.style.left = x + 'px';
            conf.style.top = y + 'px';
            conf.style.transform = `rotate(${rot}deg)`;
            conf.style.opacity = 1 - progress;

            requestAnimationFrame(animate);
        }
        animate();
    }
}

function getRandomColor() {
    const colors = ['#ff6b9d', '#ffb3d9', '#8b5cf6', '#a855f7', '#06b6d4', '#fbbf24'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ================================================================
// 13. FIREWORKS
// ================================================================

function createFireworks() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5 + 100;
            explodeFirework(x, y);
        }, i * 200);
    }
}

function explodeFirework(x, y) {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const part = document.createElement('div');
        part.className = 'firework';
        part.style.left = x + 'px';
        part.style.top = y + 'px';
        part.style.width = '4px';
        part.style.height = '4px';
        part.style.backgroundColor = getRandomColor();
        part.style.borderRadius = '50%';
        part.style.position = 'fixed';
        part.style.pointerEvents = 'none';
        part.style.zIndex = '200';
        document.body.appendChild(part);

        const angle = (i / count) * Math.PI * 2;
        const velocity = 5 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 1500;

            if (progress >= 1) {
                part.remove();
                return;
            }

            const newX = x + vx * elapsed / 16;
            const newY = y + vy * elapsed / 16 + (elapsed / 16) * 0.1;

            part.style.left = newX + 'px';
            part.style.top = newY + 'px';
            part.style.opacity = 1 - progress;

            requestAnimationFrame(animate);
        }
        animate();
    }
}

// ================================================================
// 14. STARS
// ================================================================

function initStars() {
    const container = qs('.stars-container');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

// ================================================================
// 15. MUSIC
// ================================================================

function initMusic() {
    const toggle = elements.musicToggle;
    const volume = elements.musicVolume;
    const audio = elements.backgroundMusic;

    if (toggle) {
        toggle.addEventListener('click', toggleMusic);
    }

    if (volume && audio) {
        volume.addEventListener('change', (e) => {
            audio.volume = e.target.value / 100;
        });
        audio.volume = (volume.value || 50) / 100;
    }
}

function toggleMusic() {
    const audio = elements.backgroundMusic;
    if (!audio) return;

    try {
        if (state.musicPlaying) {
            audio.pause();
            state.musicPlaying = false;
        } else {
            audio.play().catch(() => {
                console.warn('Autoplay blocked');
            });
            state.musicPlaying = true;
        }
    } catch (e) {
        console.error('Music error:', e);
    }
}

// ================================================================
// 16. CONTENT SYNC
// ================================================================

function syncAllContent() {
    // Birthday message
    qsa('[data-birthday-message]').forEach(el => {
        el.textContent = state.data.birthdayMessage;
    });

    // Future wish
    qsa('[data-future-wish]').forEach(el => {
        el.textContent = state.data.futureWish;
    });

    // Closing message
    qsa('[data-closing-message]').forEach(el => {
        el.textContent = state.data.closingMessage;
    });

    // Recipient name
    updateRecipientNameEverywhere(state.data.recipientName);

    // Wishes
    populateWishCards();

    // Gallery
    initGallery();
}

// ================================================================
// 17. INITIALIZATION
// ================================================================

function init() {
    // Initialize state first
    initializeState();
    loadDataFromStorage();

    // Cache elements
    cacheElements();

    // Start loading
    initLoading();

    // Init all features
    initNameSelection();
    initNavigation();
    initWishCards();
    initGallery();
    initCake();
    initMusic();
    initStars();

    // Go to first page
    goToPage(1);
    updateProgress();

    // Sync all content
    syncAllContent();
}

// ================================================================
// 18. DOM READY
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ================================================================
// 19. ERROR HANDLING
// ================================================================

window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejection:', e.reason);
});
