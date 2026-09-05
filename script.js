/* ================================================================
   DELICATE UNIVERSE - JAVASCRIPT
   Premium Interactive Birthday Experience
   ================================================================ */

// ================================================================
// 1. DOM REFERENCES & CONFIGURATION
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
            { title: 'First Moment', description: 'A cherished beginning' },
            { title: 'Special Times', description: 'Unforgettable moments' },
            { title: 'Beautiful Days', description: 'Shared joy and laughter' },
            { title: 'Precious Times', description: 'Moments to treasure' },
            { title: 'Happy Memories', description: 'Worth remembering forever' },
            { title: 'Next Chapter', description: 'Bright future ahead' }
        ],
        settings: {
            music: true,
            effects: true,
            reducedMotion: false
        }
    }
};

// State management
let state = {
    currentPage: 1,
    selectedName: 'Beautiful',
    loading: true,
    musicPlaying: false,
    data: JSON.parse(JSON.stringify(CONFIG.defaultData))
};

// ================================================================
// 2. SAFE DOM QUERIES
// ================================================================

const querySelector = (selector) => {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.error('Query selector error:', selector);
        return null;
    }
};

const querySelectorAll = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (e) {
        console.error('Query selector all error:', selector);
        return [];
    }
};

// Cache commonly used elements
const elements = {
    loadingScreen: querySelector('#loadingScreen'),
    loadingProgress: querySelector('#loadingProgress'),
    musicToggle: querySelector('#musicToggle'),
    musicVolume: querySelector('#musicVolume'),
    pageProgress: querySelector('#pageProgress'),
    progressBar: querySelector('#progressBar'),
    pageCounter: querySelector('#pageCounter'),
    currentPageNumber: querySelector('#currentPageNumber'),
    experienceContainer: querySelector('.experience-container'),
    backgroundMusic: querySelector('#backgroundMusic'),
    birthdayEffects: querySelector('#birthdayEffects')
};

// ================================================================
// 3. LOCAL STORAGE HELPERS
// ================================================================

function loadData() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            state.data = { ...CONFIG.defaultData, ...parsed };
            return true;
        }
    } catch (e) {
        console.error('LocalStorage read error:', e);
    }
    state.data = JSON.parse(JSON.stringify(CONFIG.defaultData));
    return false;
}

function saveData() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.data));
        return true;
    } catch (e) {
        console.error('LocalStorage write error:', e);
        return false;
    }
}

function clearData() {
    try {
        localStorage.removeItem(CONFIG.storageKey);
        state.data = JSON.parse(JSON.stringify(CONFIG.defaultData));
        return true;
    } catch (e) {
        console.error('LocalStorage clear error:', e);
        return false;
    }
}

// ================================================================
// 4. LOADING SCREEN
// ================================================================

function initLoading() {
    if (!elements.loadingScreen) return;

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        if (elements.loadingProgress) {
            elements.loadingProgress.style.width = progress + '%';
        }
    }, 300);

    // Complete loading after delay
    setTimeout(() => {
        clearInterval(interval);
        if (elements.loadingProgress) {
            elements.loadingProgress.style.width = '100%';
        }
        
        setTimeout(() => {
            hideLoading();
            state.loading = false;
        }, 300);
    }, 1500);
}

function hideLoading() {
    if (!elements.loadingScreen) return;
    elements.loadingScreen.classList.add('hidden');
}

// ================================================================
// 5. PAGE NAVIGATION
// ================================================================

function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > CONFIG.totalPages) return;
    if (pageNumber === state.currentPage) return;

    // Hide current page
    const currentPageEl = querySelector(`[data-page="${state.currentPage}"]`);
    if (currentPageEl) {
        currentPageEl.classList.remove('active');
    }

    // Update state
    state.currentPage = pageNumber;

    // Show new page
    const newPageEl = querySelector(`[data-page="${pageNumber}"]`);
    if (newPageEl) {
        newPageEl.classList.add('active');
    }

    // Update progress
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const percentage = (state.currentPage / CONFIG.totalPages) * 100;
    
    if (elements.progressBar) {
        elements.progressBar.style.width = percentage + '%';
    }

    if (elements.pageCounter) {
        const currentSpan = elements.pageCounter.querySelector('.current');
        const totalSpan = elements.pageCounter.querySelector('.total');
        if (currentSpan) currentSpan.textContent = state.currentPage;
        if (totalSpan) totalSpan.textContent = CONFIG.totalPages;
    }

    if (elements.currentPageNumber) {
        elements.currentPageNumber.textContent = state.currentPage;
    }
}

// ================================================================
// 6. NAME SELECTION & RECIPIENT
// ================================================================

function initNameSelection() {
    const nameOptions = querySelectorAll('.name-option');
    const customNameBtn = querySelector('#useCustomNameBtn');
    const customNameInput = querySelector('#customNameInput');

    nameOptions.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                nameOptions.forEach(b => {
                    if (b) b.classList.remove('selected');
                });
                this.classList.add('selected');
                state.selectedName = this.getAttribute('data-name');
                updateNamePreview();
            });
        }
    });

    if (customNameBtn && customNameInput) {
        customNameBtn.addEventListener('click', function() {
            const name = customNameInput.value.trim();
            if (name) {
                state.selectedName = name;
                nameOptions.forEach(b => {
                    if (b) b.classList.remove('selected');
                });
                updateNamePreview();
            }
        });

        customNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customNameBtn.click();
            }
        });
    }

    updateNamePreview();
}

function updateNamePreview() {
    const preview = querySelector('#selectedNamePreview');
    if (preview) {
        preview.textContent = `For ${state.selectedName} ❤️`;
    }
    setRecipientName(state.selectedName);
}

function setRecipientName(name) {
    const recipientElements = querySelectorAll('[data-recipient-name]');
    recipientElements.forEach(el => {
        if (el) el.textContent = name;
    });
}

// ================================================================
// 7. BUTTON NAVIGATION
// ================================================================

function initNavigation() {
    const navButtons = querySelectorAll('[data-next]');
    navButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const nextPage = parseInt(this.getAttribute('data-next'));
                goToPage(nextPage);
            });
        }
    });

    // Replay and back buttons
    const replayBtn = querySelector('#replayExperienceBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            resetExperience();
            goToPage(1);
        });
    }

    const backBtn = querySelector('#backToBeginningBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            resetExperience();
            goToPage(1);
        });
    }
}

function resetExperience() {
    // Reset page
    state.currentPage = 1;

    // Reset wish cards
    const wishCards = querySelectorAll('.wish-card');
    wishCards.forEach(card => {
        if (card) card.classList.remove('flipped');
    });

    // Reset cake
    const flames = querySelectorAll('.flame');
    flames.forEach(flame => {
        if (flame) flame.classList.remove('extinguished');
    });

    // Clear effects
    if (elements.birthdayEffects) {
        elements.birthdayEffects.innerHTML = '';
    }

    // Update progress
    updateProgress();
}

// ================================================================
// 8. WISH CARDS (3D FLIP)
// ================================================================

function initWishCards() {
    const wishCards = querySelectorAll('.wish-card');
    wishCards.forEach(card => {
        if (card) {
            card.addEventListener('click', function() {
                this.classList.toggle('flipped');
            });
        }
    });

    // Populate wish cards from data
    populateWishCards();
}

function populateWishCards() {
    const wishCards = querySelectorAll('.wish-card');
    state.data.wishes.forEach((wish, index) => {
        const card = wishCards[index];
        if (!card) return;

        const icon = card.querySelector('.wish-icon');
        const frontStrong = card.querySelector('.wish-card-front strong');
        const backStrong = card.querySelector('.wish-card-back strong');

        if (icon) icon.textContent = wish.icon;
        if (frontStrong) frontStrong.textContent = wish.title;
        if (backStrong) backStrong.textContent = wish.back;
    });
}

// ================================================================
// 9. GALLERY / MEMORIES
// ================================================================

function initGallery() {
    const memoryItems = querySelectorAll('.memory-item');
    memoryItems.forEach((item, index) => {
        if (item) {
            const placeholder = item.querySelector('.memory-placeholder-title');
            const desc = item.querySelector('.memory-placeholder-description');

            if (state.data.memories[index]) {
                const mem = state.data.memories[index];
                if (placeholder) placeholder.textContent = mem.title;
                if (desc) desc.textContent = mem.description;
            }
        }
    });
}

// ================================================================
// 10. BIRTHDAY CAKE & CANDLES
// ================================================================

function initCake() {
    const cake = querySelector('#birthdayCake');
    const celebrateBtn = querySelector('#cakeCelebrateBtn');

    if (cake) {
        cake.addEventListener('click', () => {
            triggerCelebration();
        });
    }

    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', () => {
            triggerCelebration();
        });
    }

    // Candle interactions
    const candles = querySelectorAll('.candle');
    candles.forEach(candle => {
        if (candle) {
            candle.addEventListener('click', (e) => {
                e.stopPropagation();
                const flame = candle.querySelector('.flame');
                if (flame) {
                    flame.classList.toggle('extinguished');
                }
            });
        }
    });
}

function triggerCelebration() {
    // Trigger confetti
    createConfetti();
    createFireworks();
    
    // Scroll or animate to reveal
    const revealBox = querySelector('#birthdayWishReveal');
    if (revealBox) {
        revealBox.style.animation = 'fadeInUp 0.8s ease forwards';
    }
}

// ================================================================
// 11. CONFETTI EFFECT
// ================================================================

function createConfetti() {
    const count = 50;
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.width = Math.random() * 8 + 4 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '200';

        document.body.appendChild(confetti);

        // Animate
        const duration = Math.random() * 3 + 2;
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 200;
        const startRotation = Math.random() * 360;
        const endRotation = startRotation + Math.random() * 720;

        let startTime = Date.now();
        function animateConfetti() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / (duration * 1000);

            if (progress >= 1) {
                confetti.remove();
                return;
            }

            const x = startX + (endX - startX) * progress;
            const y = window.innerHeight * progress;
            const rotation = startRotation + (endRotation - startRotation) * progress;

            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.opacity = 1 - progress;

            requestAnimationFrame(animateConfetti);
        }
        animateConfetti();
    }
}

function getRandomColor() {
    const colors = ['#ff6b9d', '#ffb3d9', '#8b5cf6', '#a855f7', '#06b6d4', '#fbbf24'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ================================================================
// 12. FIREWORKS
// ================================================================

function createFireworks() {
    const fireworkCount = 3;
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5 + 100;
            
            explodeFirework(x, y);
        }, i * 200);
    }
}

function explodeFirework(x, y) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = getRandomColor();
        particle.style.borderRadius = '50%';
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '200';
        document.body.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 5 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let startTime = Date.now();
        function animateFirework() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 1500;

            if (progress >= 1) {
                particle.remove();
                return;
            }

            const newX = x + vx * elapsed / 16;
            const newY = y + vy * elapsed / 16 + (elapsed / 16) * 0.1;

            particle.style.left = newX + 'px';
            particle.style.top = newY + 'px';
            particle.style.opacity = 1 - progress;

            requestAnimationFrame(animateFirework);
        }
        animateFirework();
    }
}

// ================================================================
// 13. PARTICLES (BACKGROUND)
// ================================================================

function initBackgroundParticles() {
    const container = querySelector('.particles-container');
    if (!container) return;

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        createBackgroundParticle(container);
    }
}

function createBackgroundParticle(container) {
    if (!container) return;

    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.backgroundColor = 'rgba(255, 255, 255, ' + (Math.random() * 0.5 + 0.2) + ')';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.3)';

    container.appendChild(particle);

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let vx = (Math.random() - 0.5) * 0.5;
    let vy = (Math.random() - 0.5) * 0.5 - 0.3;

    function animate() {
        x += vx;
        y += vy;

        if (x < 0 || x > window.innerWidth) vx *= -1;
        if (y < 0 || y > window.innerHeight) vy *= -1;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        requestAnimationFrame(animate);
    }
    animate();
}

// ================================================================
// 14. STARS BACKGROUND
// ================================================================

function initStars() {
    const starsContainer = querySelector('.stars-container');
    if (!starsContainer) return;

    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// ================================================================
// 15. MUSIC CONTROLS
// ================================================================

function initMusic() {
    const toggleBtn = querySelector('#musicToggle');
    const volumeSlider = querySelector('#musicVolume');
    const audio = querySelector('#backgroundMusic');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleMusic);
    }

    if (volumeSlider && audio) {
        volumeSlider.addEventListener('change', (e) => {
            audio.volume = e.target.value / 100;
        });
        audio.volume = volumeSlider.value / 100;
    }
}

function toggleMusic() {
    const audio = querySelector('#backgroundMusic');
    if (!audio) return;

    try {
        if (state.musicPlaying) {
            audio.pause();
            state.musicPlaying = false;
        } else {
            audio.play().catch(err => {
                console.warn('Autoplay blocked:', err);
            });
            state.musicPlaying = true;
        }
    } catch (e) {
        console.error('Music control error:', e);
    }
}

// ================================================================
// 16. CONTENT SYNCHRONIZATION
// ================================================================

function syncContent() {
    // Birthday message
    const birthdayMsgEl = querySelector('[data-birthday-message]');
    if (birthdayMsgEl) {
        birthdayMsgEl.textContent = state.data.birthdayMessage;
    }

    // Future wish
    const futureWishEl = querySelector('[data-future-wish]');
    if (futureWishEl) {
        futureWishEl.textContent = state.data.futureWish;
    }

    // Closing message
    const closingMsgEl = querySelector('[data-closing-message]');
    if (closingMsgEl) {
        closingMsgEl.textContent = state.data.closingMessage;
    }

    // Recipient name
    setRecipientName(state.selectedName);
}

// ================================================================
// 17. CONTENT EDITORS (STUDIO)
// ================================================================

function updateContentFromStudio() {
    const birthdayInput = querySelector('.studio-birthday-message');
    if (birthdayInput && birthdayInput.value) {
        state.data.birthdayMessage = birthdayInput.value;
    }

    const futureInput = querySelector('.studio-future-wish');
    if (futureInput && futureInput.value) {
        state.data.futureWish = futureInput.value;
    }

    const closingInput = querySelector('.studio-closing-message');
    if (closingInput && closingInput.value) {
        state.data.closingMessage = closingInput.value;
    }

    syncContent();
}

// ================================================================
// 18. INITIALIZATION
// ================================================================

function init() {
    // Load data from storage
    loadData();

    // Initialize page
    goToPage(1);
    updateProgress();

    // Init features
    initLoading();
    initNameSelection();
    initNavigation();
    initWishCards();
    initGallery();
    initCake();
    initMusic();
    initStars();
    initBackgroundParticles();

    // Sync content
    syncContent();

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && elements.backgroundMusic) {
            // Resume if needed
        }
    });
}

// ================================================================
// 19. DOM READY
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ================================================================
// 20. ERROR HANDLING
// ================================================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
