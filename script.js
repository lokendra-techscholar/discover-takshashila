/* ========================================
   Discover Takshashila — Interactive Script
   ======================================== */

// ---- State ----
let currentSpread = 0;
const totalLeaves = 6;
const totalSpreads = totalLeaves + 1; // 0=cover, 1-5=spreads, 6=back cover
let isAnimating = false;

// ---- Navigation ----

function updateControls() {
    const prevBtns = [document.getElementById('prevBtn'), document.getElementById('prevBtn2')];
    const nextBtns = [document.getElementById('nextBtn'), document.getElementById('nextBtn2')];
    const indicators = [document.getElementById('pageIndicator'), document.getElementById('pageIndicator2')];
    const thumbs = document.querySelectorAll('.thumb');

    prevBtns.forEach(btn => {
        if (btn) btn.disabled = currentSpread === 0;
    });
    nextBtns.forEach(btn => {
        if (btn) btn.disabled = currentSpread === totalSpreads - 1;
    });

    let label;
    if (currentSpread === 0) label = 'Cover';
    else if (currentSpread === totalSpreads - 1) label = 'Back Cover';
    else label = `Pages ${currentSpread * 2 - 1}–${currentSpread * 2}`;

    indicators.forEach(ind => {
        if (ind) ind.textContent = label;
    });

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentSpread);
    });
}

function updateLeafZIndices() {
    const leaves = document.querySelectorAll('.leaf');
    leaves.forEach((leaf, index) => {
        if (leaf.classList.contains('flipped')) {
            leaf.style.zIndex = index;
        } else {
            leaf.style.zIndex = totalLeaves - index;
        }
    });
}

function flipToSpread(target) {
    if (isAnimating || target === currentSpread) return;
    if (target < 0 || target >= totalSpreads) return;

    isAnimating = true;
    const leaves = document.querySelectorAll('.leaf');
    const prev = currentSpread;
    currentSpread = target;
    updateControls();

    if (target > prev) {
        let delay = 0;
        const step = Math.min(150, 600 / (target - prev));
        for (let i = prev; i < target; i++) {
            const leaf = leaves[i];
            if (leaf) {
                const d = delay;
                setTimeout(() => {
                    leaf.style.zIndex = totalLeaves + 10;
                    leaf.classList.add('flipped');
                }, d);
                setTimeout(() => {
                    leaf.style.zIndex = i;
                }, d + 800);
                delay += step;
            }
        }
        setTimeout(() => {
            updateLeafZIndices();
            isAnimating = false;
        }, delay + 850);
    } else {
        let delay = 0;
        const step = Math.min(150, 600 / (prev - target));
        for (let i = prev - 1; i >= target; i--) {
            const leaf = leaves[i];
            if (leaf) {
                const d = delay;
                setTimeout(() => {
                    leaf.style.zIndex = totalLeaves + 10;
                    leaf.classList.remove('flipped');
                }, d);
                delay += step;
            }
        }
        setTimeout(() => {
            updateLeafZIndices();
            isAnimating = false;
        }, delay + 850);
    }
}

function nextPage() { flipToSpread(currentSpread + 1); }
function prevPage() { flipToSpread(currentSpread - 1); }
function goToPage(n) { flipToSpread(n); }

function openBook() {
    document.getElementById('flipbook-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => flipToSpread(1), 800);
}

// ---- Keyboard ----
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevPage();
    }
});

// ---- Interactive Elements ----
function toggleProgramme(card) { card.classList.toggle('expanded'); }
function toggleResearch(card) { card.classList.toggle('flipped-card'); }

// ---- Init ----
function initLeaves() {
    const leaves = document.querySelectorAll('.leaf');
    updateLeafZIndices();
    updateControls();
}

function initTouchSupport() {
    const bookEl = document.getElementById('book');
    let touchStartX = 0;
    let touchStartY = 0;
    bookEl.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    bookEl.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) nextPage();
            else prevPage();
        }
    }, { passive: true });
}

function initClickToFlip() {
    const bookEl = document.getElementById('book');
    bookEl.addEventListener('click', (e) => {
        if (e.target.closest('.programme-card, .engage-card, .nav-btn, a, button')) return;
        const rect = bookEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width / 2) nextPage();
        else prevPage();
    });
}

function initLandingParallax() {
    const landing = document.getElementById('landing');
    const content = document.querySelector('.landing-content');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const h = landing.offsetHeight;
        if (scrollY < h) {
            const p = scrollY / h;
            content.style.opacity = 1 - p * 1.5;
            content.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
    }, { passive: true });
}

function initValueCards() {
    document.querySelectorAll('.value-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.borderColor = 'var(--color-accent)');
        card.addEventListener('mouseleave', () => card.style.borderColor = 'var(--color-border)');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLeaves();
    initTouchSupport();
    initClickToFlip();
    initLandingParallax();
    initValueCards();
});
