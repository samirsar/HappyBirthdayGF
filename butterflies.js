document.addEventListener('DOMContentLoaded', setupButterflies);

function setupButterflies() {
    if (window.__butterflyCursorReady) return;
    window.__butterflyCursorReady = true;

    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
        || ('ontouchstart' in window);

    let cursor = document.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }

    const BUTTERFLY_HUES = [0, 35, 75, 145, 210, 265, 310, 340];

    function butterflyFilter(hue, saturate) {
        return `hue-rotate(${hue}deg) saturate(${saturate}) drop-shadow(0 0 6px rgba(255, 120, 200, 0.45))`;
    }

    function randomHue() {
        return BUTTERFLY_HUES[Math.floor(Math.random() * BUTTERFLY_HUES.length)];
    }

    cursor.innerHTML = '';
    cursor.classList.add('cursor--butterflies');
    const orbitHues = [0, 55, 130, 205, 285, 325];
    orbitHues.forEach((hue, i) => {
        const b = document.createElement('span');
        b.className = 'cursor-butterfly' + (i === 0 ? ' cursor-butterfly--lead' : ' cursor-butterfly--orbit');
        b.textContent = '🦋';
        b.style.filter = butterflyFilter(hue, i === 0 ? 1.5 : 1.25);
        b.style.setProperty('--orbit-i', i);
        cursor.appendChild(b);
    });

    let hueTick = 0;
    const orbitButterflies = cursor.querySelectorAll('.cursor-butterfly--orbit');

    function moveCursor(x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        hueTick += 1;
        if (hueTick % 8 === 0) {
            orbitButterflies.forEach((b, i) => {
                const hue = BUTTERFLY_HUES[(Math.floor(hueTick / 8) + i) % BUTTERFLY_HUES.length];
                b.style.filter = butterflyFilter(hue, 1.25);
            });
        }
    }

    function spawnButterfly(x, y, size) {
        const b = document.createElement('div');
        b.className = 'butterfly ' + (size === 'large' ? 'large' : 'small');
        b.textContent = '🦋';
        b.style.filter = butterflyFilter(randomHue(), 1.2 + Math.random() * 0.4);
        b.style.left = x + 'px';
        b.style.top = y + 'px';
        b.style.setProperty('--dx', ((Math.random() - 0.5) * 220) + 'px');
        b.style.setProperty('--dy', (-(Math.random() * 220 + 80)) + 'px');
        b.style.setProperty('--rot', ((Math.random() - 0.5) * 720) + 'deg');
        document.body.appendChild(b);
        b.addEventListener('animationend', () => b.remove());
    }

    function burst(x, y, count) {
        for (let i = 0; i < count; i++) {
            spawnButterfly(
                x + (Math.random() * 140 - 70),
                y + (Math.random() * 140 - 70),
                Math.random() > 0.6 ? 'large' : 'small'
            );
        }
    }

    document.addEventListener('mousemove', (e) => {
        moveCursor(e.clientX, e.clientY);
        if (Math.random() < 0.18) {
            spawnButterfly(
                e.clientX + (Math.random() * 24 - 12),
                e.clientY + (Math.random() * 24 - 12)
            );
        }
    });

    document.addEventListener('click', (e) => {
        moveCursor(e.clientX, e.clientY);
        burst(e.clientX, e.clientY, isTouch ? 14 : 22);
    });

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        if (!t) return;
        moveCursor(t.clientX, t.clientY);
        burst(t.clientX, t.clientY, 10);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (!t) return;
        moveCursor(t.clientX, t.clientY);
        if (Math.random() < 0.35) {
            spawnButterfly(
                t.clientX + (Math.random() * 28 - 14),
                t.clientY + (Math.random() * 28 - 14),
                Math.random() > 0.7 ? 'large' : 'small'
            );
        }
    }, { passive: true });

    // Always-on butterflies on phones so they appear without tapping
    function ambientButterflies() {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight * (0.25 + Math.random() * 0.55);
        spawnButterfly(x, y, Math.random() > 0.5 ? 'large' : 'small');
    }

    if (isTouch) {
        for (let i = 0; i < 6; i++) {
            setTimeout(ambientButterflies, i * 180);
        }
        setInterval(ambientButterflies, 1100);
    }
}
