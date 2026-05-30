'use strict';

// Extrahiert aus: Seiten/05_visuelle_wahrnehmung.html
// Enthält nur JavaScript (Funktionen + Event-Handler). Styling kommt aus styles.css.

// Globale Funktionen für Navigation und Interaktivität
window.copyToClipboard = function (code) {
    navigator.clipboard.writeText(code).catch(() => {});
};

window.sendToChatbot = function (message) {
    const chatButton = document.getElementById('chat-icon');
    if (chatButton) chatButton.click();
    setTimeout(() => {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        if (chatInput && sendButton) {
            chatInput.value = message;
            sendButton.click();
        }
    }, 500);
};

// Akkordeon-Funktion
window.toggleAccordion = function (element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('.accordion-icon');

    if (content && icon) {
        content.classList.toggle('open');
        icon.classList.toggle('open');
    }
};

// Navigation - Zum Anfang springen
window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Navigation - Zum Ende springen
window.scrollToBottom = function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

// Navigation - Eine Seite nach oben
window.scrollPageUp = function () {
    window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
};

// Navigation - Eine Seite nach unten
window.scrollPageDown = function () {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
};

// Alle Akkordeons aufklappen (unterstützt sowohl class-basiert als auch <details>)
window.expandAllAccordions = function () {
    // Class-basierte Akkordeons
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.add('open');
    });
    document.querySelectorAll('.accordion-icon').forEach(icon => {
        icon.classList.add('open');
    });
    // <details>-basierte Akkordeons
    document.querySelectorAll('details.accordion').forEach(d => {
        d.open = true;
    });
};

// Alle Akkordeons zuklappen (unterstützt sowohl class-basiert als auch <details>)
window.collapseAllAccordions = function () {
    // Class-basierte Akkordeons
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.remove('open');
    });
    document.querySelectorAll('.accordion-icon').forEach(icon => {
        icon.classList.remove('open');
    });
    // <details>-basierte Akkordeons
    document.querySelectorAll('details.accordion').forEach(d => {
        d.open = false;
    });
};

// Drag & Drop für Navigationsmenü (nur am Icon, verbessert)
window.makeDraggable = function (element) {
    if (!element) return;
    
    let startX = 0,
        startY = 0,
        originLeft = 0,
        originTop = 0,
        dragging = false;

    const dragHandle = element.querySelector('.nav-menu-title');
    if (!dragHandle) return;

    function onDown(e) {
        dragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        const rect = element.getBoundingClientRect();
        originLeft = rect.left;
        originTop = rect.top;
        element.style.left = originLeft + 'px';
        element.style.top = originTop + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        e.preventDefault();
        e.stopPropagation();
    }

    function onMove(e) {
        if (!dragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const newLeft = Math.max(0, Math.min(originLeft + dx, window.innerWidth - element.offsetWidth));
        const newTop = Math.max(0, Math.min(originTop + dy, window.innerHeight - element.offsetHeight));
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
    }

    function onUp() {
        dragging = false;
    }

    dragHandle.addEventListener('mousedown', onDown);
    dragHandle.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
};

// Event Listener für alle Buttons registrieren
document.addEventListener('DOMContentLoaded', function () {
    // Section-basierte Navigation via data-action Attribute
    function scrollToId(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getSections() {
        // Suche nach Sections mit IDs (falls vorhanden)
        const sections = Array.from(document.querySelectorAll('.section[id], section[id]'))
            .map(el => ({ id: el.id, el }))
            .filter(s => s.id);
        return sections;
    }

    function currentSectionIndex() {
        const sections = getSections();
        if (!sections.length) return 0;
        const y = window.scrollY + 120;
        let idx = 0;
        for (let i = 0; i < sections.length; i++) {
            const top = sections[i].el.getBoundingClientRect().top + window.scrollY;
            if (top <= y) idx = i;
        }
        return idx;
    }

    // Data-action basierte Buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const sections = getSections();
            
            if (action === 'begin' || action === 'home') return scrollToId('top');
            if (action === 'end') return scrollToId('bottom');
            if (action === 'openAll') return window.expandAllAccordions();
            if (action === 'closeAll') return window.collapseAllAccordions();
            
            if (action === 'last') {
                const last = sections[sections.length - 1];
                if (last) return scrollToId(last.id);
                return;
            }
            if (action === 'prev') {
                const idx = currentSectionIndex();
                const prev = sections[Math.max(0, idx - 1)];
                if (prev) scrollToId(prev.id);
                return;
            }
            if (action === 'next') {
                const idx = currentSectionIndex();
                const next = sections[Math.min(sections.length - 1, idx + 1)];
                if (next) scrollToId(next.id);
                return;
            }
        });
    });

    // Fallback: Legacy Button-Index basierte Navigation (für Abwärtskompatibilität)
    const allButtons = document.querySelectorAll('.nav-btn:not([data-action])');
    if (allButtons[0]) allButtons[0].addEventListener('click', () => window.scrollToTop());
    if (allButtons[1]) allButtons[1].addEventListener('click', () => window.scrollPageUp());
    if (allButtons[2]) allButtons[2].addEventListener('click', () => window.scrollPageDown());
    if (allButtons[3]) allButtons[3].addEventListener('click', () => window.scrollToBottom());
    if (allButtons[4]) allButtons[4].addEventListener('click', () => window.expandAllAccordions());
    if (allButtons[5]) allButtons[5].addEventListener('click', () => window.collapseAllAccordions());

    // Legacy Akkordeon-Header (class-basiert)
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => window.toggleAccordion(header));
    });

    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const launcher = document.querySelector('.nav-menu-launcher');
        const hideBtn = document.querySelector('.nav-menu-hide');

        const HIDDEN_KEY = 'vt_ds05_nav_menu_hidden';

        function setHidden(hidden) {
            if (hidden) {
                navMenu.classList.add('is-hidden');
                if (launcher) launcher.classList.add('is-visible');
            } else {
                navMenu.classList.remove('is-hidden');
                if (launcher) launcher.classList.remove('is-visible');
            }
            try {
                localStorage.setItem(HIDDEN_KEY, hidden ? '1' : '0');
            } catch (_) {
                // ignore
            }
        }

        // Default position oben rechts (wenn kein CSS-Wert gesetzt)
        if (!navMenu.style.top && !navMenu.style.right && !navMenu.style.left) {
            navMenu.style.right = '1.5rem';
            navMenu.style.top = '1.5rem';
        }

        // Restore hidden state
        try {
            const hidden = localStorage.getItem(HIDDEN_KEY) === '1';
            setHidden(hidden);
        } catch (_) {
            // ignore
        }

        if (hideBtn) {
            hideBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                setHidden(true);
            });
        }

        if (launcher) {
            launcher.addEventListener('click', e => {
                e.preventDefault();
                setHidden(false);
            });
        }

        window.makeDraggable(navMenu);
    }

    // Bildanalyse-Demos
    window.showCompositionExample = function (type) {
        const examples = {
            drittel: 'Drittel-Regel: Motiv auf Schnittpunkten platzieren → Dynamik & Balance',
            linien: 'Linienführung: Natürliche Linien leiten den Blick zum Hauptmotiv',
            tiefe: 'Tiefe: Vorder-, Mittel- & Hintergrund schaffen räumliche Wirkung',
            kontrast: 'Kontrast: Hell/Dunkel oder Farbkontraste lenken Aufmerksamkeit',
        };
        alert('📸 ' + examples[type]);
    };
});

// MMBBSBOT Integration
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const { MMBBSBOT } = await import('https://dev.mm-bbs.de:8085/mmbbs-bot.js');
        const element = document.querySelector('.content');
        const htmlContent = element ? element.innerHTML : '';
        const settings = {
            host: 'dev.mm-bbs.de',
            protocol: 'https',
            port: 8085,
            opener: 'Hallo! Ich helfe dir bei Fragen zur visuellen Wahrnehmung und Bildgestaltung.',
            chat_icon: '',
            chat_icon_style: 'border-radius: 50%; width: 40px; height: 40px;',
            title: 'VT GPT',
            task: htmlContent,
            hints:
                'Sie sind Experte für Veranstaltungstechnik mit Schwerpunkt visuelle Wahrnehmung und Bildgestaltung. Erklären Sie Konzepte verständlich und praxisnah.',
        };
        new MMBBSBOT(settings);
    } catch (error) {
        console.error('MMBBSBOT konnte nicht geladen werden:', error);
    }
});
