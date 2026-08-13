const GIRL_NAME = 'Jenny';

// Countdown overlay elements
const overlay = document.getElementById('countdown-overlay');
const daysEl = () => document.getElementById('days');
const hoursEl = () => document.getElementById('hours');
const minutesEl = () => document.getElementById('minutes');
const secondsEl = () => document.getElementById('seconds');

function updateTimerElements(d, h, m, s) {
    daysEl().textContent = String(d).padStart(2, '0');
    hoursEl().textContent = String(h).padStart(2, '0');
    minutesEl().textContent = String(m).padStart(2, '0');
    secondsEl().textContent = String(s).padStart(2, '0');
}

function startCountdown(targetDate) {
    if (overlay) overlay.classList.remove('hidden');

    const bgVideo = document.getElementById('countdown-video');
    if (bgVideo) {
        bgVideo.muted = true;
        bgVideo.currentTime = 0;
        const playPromise = bgVideo.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(() => {
                // Autoplay blocked until user interaction — try again on first tap
                const resume = () => {
                    bgVideo.play().catch(() => {});
                    document.removeEventListener('pointerdown', resume);
                };
                document.addEventListener('pointerdown', resume, { once: true });
            });
        }
    }

    // animate overlay in (letterbox bars + subtle zoom)
    const top = document.querySelector('.letterbox.top');
    const bottom = document.querySelector('.letterbox.bottom');
    const content = document.querySelector('.countdown-content');
    if (top && bottom) {
        gsap.to([top, bottom], { y: '0%', duration: 0.8, ease: 'power3.out' });
    }
    if (content) {
        gsap.fromTo(content, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 });
    }

    // Unmute button toggles background video sound
    const unmuteBtn = document.getElementById('unmute');
    if (unmuteBtn && bgVideo && !unmuteBtn.dataset.videoBound) {
        unmuteBtn.dataset.videoBound = '1';
        unmuteBtn.addEventListener('click', () => {
            bgVideo.muted = !bgVideo.muted;
            unmuteBtn.textContent = bgVideo.muted ? '🔈' : '🔊';
            if (bgVideo.paused) bgVideo.play().catch(() => {});
        });
    }

    let interval;
    function tick() {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) {
            updateTimerElements(0,0,0,0);
            celebrate();
            clearInterval(interval);
            return;
        }
        const sec = Math.floor(diff / 1000);
        const d = Math.floor(sec / (3600*24));
        const h = Math.floor((sec % (3600*24)) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        updateTimerElements(d,h,m,s);
        // subtle pulse when seconds change
        const secsEl = document.getElementById('seconds');
        if (secsEl) gsap.fromTo(secsEl, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    }
    tick();
    interval = setInterval(tick, 1000);
}

// Celebration: fireworks canvas + short melody + reveal main page
function celebrate() {
    const canvas = document.getElementById('celebration-canvas');
    if (canvas) { canvas.style.display = 'block'; }
    // simple WebAudio melody (short, in-browser)
    let audioAllowed = false;
    const unmuteBtn = document.getElementById('unmute');
    if (unmuteBtn) {
        unmuteBtn.addEventListener('click', () => {
            audioAllowed = !audioAllowed;
            unmuteBtn.textContent = audioAllowed ? '🔊' : '🔈';
        });
    }

    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        function playMelody() {
            const now = ctx.currentTime;
            const notes = [0, 2, 4, 7, 12];
            notes.forEach((n, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 220 * Math.pow(2, n/12);
                g.gain.value = 0.0015;
                o.connect(g); g.connect(ctx.destination);
                o.start(now + i * 0.16);
                g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.35);
                o.stop(now + i * 0.16 + 0.36);
            });
        }
        if (audioAllowed) playMelody();
        // allow a small user gesture to enable sound if they toggle before
        if (unmuteBtn) unmuteBtn.addEventListener('click', () => { if (audioAllowed) playMelody(); });
    } catch (e) { /* audio not available */ }

    // simple fireworks particle system
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    let W = window.innerWidth, H = window.innerHeight;
    if (canvas) { canvas.width = W; canvas.height = H; }
    const particles = [];

    function spawnBurst(x, y, hue) {
        const count = 80;
        for (let i=0;i<count;i++) {
            particles.push({
                x, y,
                vx: (Math.random()-0.5) * (Math.random()*8+2),
                vy: (Math.random()-0.7) * (Math.random()*8+2),
                life: Math.random()*60+40,
                hue: hue + (Math.random()*40-20),
            });
        }
    }

    let frames = 0;
    function draw() {
        frames++;
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0,0,W,H);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = particles.length-1; i>=0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
            ctx.beginPath();
            ctx.fillStyle = `hsla(${p.hue},100%,60%,${Math.max(p.life/80,0)})`;
            ctx.arc(p.x, p.y, Math.max(p.life/24,1.2), 0, Math.PI*2);
            ctx.fill();
            if (p.life <= 0) particles.splice(i,1);
        }
        if (frames % 30 === 0) spawnBurst(Math.random()*W, Math.random()*H*0.6, Math.random()*360);
        if (particles.length > 0) requestAnimationFrame(draw);
    }
    spawnBurst(W*0.5, H*0.45, 320);
    spawnBurst(W*0.3, H*0.4, 200);
    spawnBurst(W*0.7, H*0.35, 40);
    requestAnimationFrame(draw);

    // show a big message then reveal main after a moment
    const celebrateMsg = document.createElement('div');
    celebrateMsg.className = 'celebrate-msg';
    celebrateMsg.textContent = `Happy Birthday ${GIRL_NAME}!`;
    document.body.appendChild(celebrateMsg);
    gsap.to(celebrateMsg, { opacity: 1, duration: 1.2, scale: 1, ease: 'elastic.out(1,0.6)' });

    setTimeout(() => {
        gsap.to(celebrateMsg, { opacity: 0, duration: 0.9 });
        if (canvas) canvas.style.display = 'none';
        const top = document.querySelector('.letterbox.top');
        const bottom = document.querySelector('.letterbox.bottom');
        if (top && bottom) {
            gsap.to([top, bottom], { y: '-20vh', duration: 0.9, ease: 'power3.in' });
        }
        // hide overlay after celebration
        const overlayEl = document.getElementById('countdown-overlay');
        if (overlayEl) overlayEl.classList.add('hidden');
        const bgVideo = document.getElementById('countdown-video');
        if (bgVideo) {
            bgVideo.pause();
            bgVideo.currentTime = 0;
        }
        // init main page
        initMain();
    }, 4500);
}
// Main page initialization (animations, typing, floating elements)
function initMain() {
    // Typing effect for greeting
    const greetingText = "Hey You Know What! You make my days better just by being you! 💖 Happy Birthday, baby! 🎂😘";
    const greetingElement = document.querySelector('.greeting');
    let charIndex = 0;
    function typeGreeting() {
        if (!greetingElement) return;
        if (charIndex < greetingText.length) {
            greetingElement.textContent += greetingText.charAt(charIndex);
            charIndex++;
            setTimeout(typeGreeting, 60);
        }
    }

    // Create floating elements
    const floatingElements = ['💖', '✨', '🌸', '💫', '💕'];
    function createFloating() {
        const element = document.createElement('div');
        element.className = 'floating';
        element.textContent = floatingElements[Math.floor(Math.random() * floatingElements.length)];
        element.style.left = Math.random() * 100 + 'vw';
        element.style.top = Math.random() * 100 + 'vh';
        element.style.fontSize = (Math.random() * 20 + 20) + 'px';
        document.body.appendChild(element);

        gsap.to(element, {
            y: -500,
            x: Math.random() * 100 - 50,
            rotation: Math.random() * 360,
            duration: Math.random() * 5 + 5,
            opacity: 1,
            ease: "none",
            onComplete: () => element.remove()
        });
    }

    // Title and button animations (run immediately)
    gsap.to('h1', {
        opacity: 1,
        duration: 1,
        y: 20,
        ease: "bounce.out"
    });
    gsap.to('.cta-button', {
        opacity: 1,
        duration: 1,
        y: -20,
        ease: "back.out"
    });

    // Start typing effect and floating elements
    typeGreeting();
    setInterval(createFloating, 1000);

    // Hover and click effects for CTA
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, { scale: 1.1, duration: 0.3 });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(button, { scale: 1, duration: 0.3 });
        });
        button.addEventListener('click', () => {
            if (window.savePlaylistState) window.savePlaylistState();
            gsap.to('body', {
                opacity: 0,
                duration: 1,
                onComplete: () => { window.location.href = 'cause.html'; }
            });
        });
    });
}

// On DOM ready, decide whether to show countdown or main
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const year = now.getFullYear();
    const birthdayThisYear = new Date(year, 7, 14, 0, 0, 0); // August is month 7
    // const birthdayThisYear = new Date(Date.now() + 60 * 100);
    if (now < birthdayThisYear) {
        startCountdown(birthdayThisYear);
    } else {
        // If birthday has passed this year, just initialize main
        initMain();
    }
});