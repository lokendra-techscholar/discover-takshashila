/* ========================================
   Discover Takshashila — Interactive Script
   ======================================== */

// ---- State ----
let currentPage = 0;
const totalPages = 12; // 0 (cover) through 11 (back cover)
let isAnimating = false;

// ---- Page Navigation ----

function updateControls() {
    const prevBtns = [document.getElementById('prevBtn'), document.getElementById('prevBtn2')];
    const nextBtns = [document.getElementById('nextBtn'), document.getElementById('nextBtn2')];
    const indicators = [document.getElementById('pageIndicator'), document.getElementById('pageIndicator2')];
    const thumbs = document.querySelectorAll('.thumb');

    prevBtns.forEach(btn => {
        if (btn) btn.disabled = currentPage === 0;
    });

    nextBtns.forEach(btn => {
        if (btn) btn.disabled = currentPage === totalPages - 1;
    });

    let label;
    if (currentPage === 0) label = 'Cover';
    else if (currentPage === totalPages - 1) label = 'Back Cover';
    else label = `Page ${currentPage} of ${totalPages - 2}`;

    indicators.forEach(ind => {
        if (ind) ind.textContent = label;
    });

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentPage);
    });
}

function updatePageZIndices() {
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        // Clear any inline transition so z-index changes are immediate
        if (page.classList.contains('flipped')) {
            // Flipped pages: stack in order so later-flipped pages sit on top
            page.style.zIndex = index;
        } else if (index === currentPage) {
            // Active/current page on top of unflipped stack
            page.style.zIndex = totalPages + 5;
        } else {
            // Unflipped pages stack in reverse order (lower index = higher z)
            // so the next page to flip is always on top
            page.style.zIndex = totalPages - index;
        }
    });
}

function flipToPage(targetPage) {
    if (isAnimating || targetPage === currentPage) return;
    if (targetPage < 0 || targetPage >= totalPages) return;

    isAnimating = true;
    const pages = document.querySelectorAll('.page');
    const prevPage = currentPage;

    // Update state immediately
    currentPage = targetPage;
    updateControls();

    // Reset active states
    pages.forEach(p => p.classList.remove('active'));

    // Set z-indices BEFORE animation starts to prevent bleed-through:
    // - Target page stays high so it's always visible beneath flipping pages
    // - All non-participating pages get pushed to background
    pages.forEach((page, index) => {
        if (page.classList.contains('flipped') && (targetPage > prevPage ? true : index < targetPage)) {
            page.style.zIndex = 0;
        }
    });
    if (pages[targetPage]) {
        pages[targetPage].style.zIndex = totalPages + 2;
    }

    if (targetPage > prevPage) {
        // Flip forward
        let delay = 0;
        const stepDelay = Math.min(150, 600 / (targetPage - prevPage));
        for (let i = prevPage; i < targetPage; i++) {
            const page = pages[i];
            if (page) {
                const d = delay;
                setTimeout(() => {
                    // Flipping page must be above target page
                    page.style.zIndex = totalPages + 10;
                    page.classList.add('flipping');
                    page.classList.add('flipped');
                }, d);
                // After flip completes, push behind
                setTimeout(() => {
                    page.classList.remove('flipping');
                    page.style.zIndex = i; // flipped pages stack by index
                }, d + 800);
                delay += stepDelay;
            }
        }
        setTimeout(() => {
            if (pages[targetPage]) pages[targetPage].classList.add('active');
            updatePageZIndices();
            isAnimating = false;
        }, delay + 850);
    } else {
        // Flip backward
        let delay = 0;
        const stepDelay = Math.min(150, 600 / (prevPage - targetPage));
        for (let i = prevPage - 1; i >= targetPage; i--) {
            const page = pages[i];
            if (page) {
                const d = delay;
                setTimeout(() => {
                    // Unflipping page must be on top
                    page.style.zIndex = totalPages + 10;
                    page.classList.add('flipping');
                    page.classList.remove('flipped');
                }, d);
                setTimeout(() => {
                    page.classList.remove('flipping');
                }, d + 800);
                delay += stepDelay;
            }
        }
        setTimeout(() => {
            if (pages[targetPage]) pages[targetPage].classList.add('active');
            updatePageZIndices();
            isAnimating = false;
        }, delay + 850);
    }
}

function nextPage() {
    flipToPage(currentPage + 1);
}

function prevPage() {
    flipToPage(currentPage - 1);
}

function goToPage(pageNum) {
    flipToPage(pageNum);
}

function openBook() {
    document.getElementById('flipbook-section').scrollIntoView({ behavior: 'smooth' });
    // Small delay then flip to page 1
    setTimeout(() => flipToPage(1), 800);
}

// ---- Keyboard Navigation ----
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

function toggleProgramme(card) {
    card.classList.toggle('expanded');
}

function toggleResearch(card) {
    card.classList.toggle('flipped-card');
}

// ---- Page Z-Index Management ----

function initPages() {
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        if (index === 0) {
            page.classList.add('active');
        }
    });
    updatePageZIndices();
    updateControls();
}

// ---- Touch/Swipe Support ----

function initTouchSupport() {
    const bookEl = document.getElementById('book');
    let touchStartX = 0;
    let touchStartY = 0;

    bookEl.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    bookEl.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        // Only handle horizontal swipes
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) {
                nextPage(); // Swipe left = next
            } else {
                prevPage(); // Swipe right = prev
            }
        }
    }, { passive: true });
}

// ---- Click to Flip ----

function initClickToFlip() {
    const bookEl = document.getElementById('book');
    bookEl.addEventListener('click', (e) => {
        // Don't flip if clicking on interactive elements
        if (e.target.closest('.programme-card, .research-card, .engage-card, .nav-btn, a, button')) {
            return;
        }

        const rect = bookEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (clickX > halfWidth) {
            nextPage();
        } else {
            prevPage();
        }
    });
}

// ---- Parallax on Landing ----

function initLandingParallax() {
    const landing = document.getElementById('landing');
    const content = document.querySelector('.landing-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const landingHeight = landing.offsetHeight;

        if (scrollY < landingHeight) {
            const progress = scrollY / landingHeight;
            content.style.opacity = 1 - progress * 1.5;
            content.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
    }, { passive: true });
}

// ---- Value Card Hover Effects ----

function initValueCards() {
    document.querySelectorAll('.value-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--color-accent)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--color-border)';
        });
    });
}

// ---- Initialize ----

document.addEventListener('DOMContentLoaded', () => {
    initPages();
    initTouchSupport();
    initClickToFlip();
    initLandingParallax();
    initValueCards();

    // Auto-expand first programme card
    const firstProgramme = document.querySelector('.programme-card');
    if (firstProgramme) {
        setTimeout(() => firstProgramme.classList.add('expanded'), 500);
    }
});
