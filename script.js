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

// Celebration: firecracker video + Diwali crackers audio (at least 30s)
const CELEBRATION_MS = 30000;
const crackersAudio = new Audio('music/diwali_crackers.mp3');
crackersAudio.loop = true;
crackersAudio.preload = 'auto';
let crackersUnlocked = false;

function unlockCrackersAudio() {
    const p = crackersAudio.play();
    if (p && p.then) {
        p.then(() => {
            crackersAudio.pause();
            crackersAudio.currentTime = 0;
            crackersUnlocked = true;
        }).catch(() => {});
    }
}

window.unlockCrackersAudio = unlockCrackersAudio;

function playCrackersNow() {
    crackersAudio.muted = false;
    crackersAudio.volume = 1;
    crackersAudio.currentTime = 0;
    return crackersAudio.play();
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

    document.addEventListener('pointerdown', unlockCrackersAudio, { once: true });
    document.addEventListener('click', unlockCrackersAudio, { once: true });

    // Unmute button unlocks crackers audio (countdown video stays muted)
    const unmuteBtn = document.getElementById('unmute');
    if (unmuteBtn && !unmuteBtn.dataset.videoBound) {
        unmuteBtn.dataset.videoBound = '1';
        unmuteBtn.addEventListener('click', () => {
            if (window.__celebrating) {
                playCrackersNow().catch(() => {});
                return;
            }
            unlockCrackersAudio();
            unmuteBtn.textContent = '🔊';
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

function celebrate() {
    window.__celebrating = true;

    const overlayEl = document.getElementById('countdown-overlay');
    const countdownVideo = document.getElementById('countdown-video');
    const crackerVideo = document.getElementById('firecracker-video');
    const content = document.querySelector('.countdown-content');

    if (overlayEl) overlayEl.classList.add('celebrating');
    if (content) {
        gsap.killTweensOf(content);
        content.style.display = 'none';
        content.style.opacity = '0';
        content.style.visibility = 'hidden';
    }
    if (countdownVideo) {
        countdownVideo.pause();
        countdownVideo.muted = true;
    }

    if (window.pausePlaylist) window.pausePlaylist();

    if (crackerVideo) {
        crackerVideo.currentTime = 0;
        crackerVideo.muted = true;
        crackerVideo.loop = true;
        crackerVideo.play().catch(() => {
            document.addEventListener('pointerdown', () => {
                crackerVideo.play().catch(() => {});
                playCrackersNow().catch(() => {});
            }, { once: true });
        });
    }

    const startSound = () => {
        playCrackersNow().catch(() => {
            document.addEventListener('pointerdown', () => {
                playCrackersNow().catch(() => {});
            }, { once: true });
        });
    };
    startSound();
    setTimeout(startSound, 250);
    setTimeout(startSound, 800);

    const celebrateMsg = document.createElement('div');
    celebrateMsg.className = 'celebrate-msg';
    celebrateMsg.textContent = `Happy Birthday ${GIRL_NAME}!`;
    document.body.appendChild(celebrateMsg);
    gsap.to(celebrateMsg, { opacity: 1, duration: 1.2, scale: 1, ease: 'elastic.out(1,0.6)' });

    setTimeout(() => {
        window.__celebrating = false;
        gsap.to(celebrateMsg, { opacity: 0, duration: 0.9 });
        crackersAudio.pause();
        crackersAudio.currentTime = 0;
        if (crackerVideo) {
            crackerVideo.pause();
            crackerVideo.currentTime = 0;
        }
        const top = document.querySelector('.letterbox.top');
        const bottom = document.querySelector('.letterbox.bottom');
        if (top && bottom) {
            gsap.to([top, bottom], { y: '-20vh', duration: 0.9, ease: 'power3.in' });
        }
        if (overlayEl) overlayEl.classList.add('hidden');
        if (countdownVideo) {
            countdownVideo.pause();
            countdownVideo.currentTime = 0;
        }
        celebrateMsg.remove();
        if (window.resumePlaylist) window.resumePlaylist();
        initMain();
    }, CELEBRATION_MS);
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