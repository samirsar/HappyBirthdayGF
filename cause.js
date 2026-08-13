// Photo reel — add more files from the images folder here
const REEL_PHOTOS = [
    { src: 'images/first_photo.jpeg', caption: 'This one is first photo ,cool girl 💖' },
    { src: 'images/linkedin.jpeg', caption: 'Kuchh yaad aaya 🌸,meri ai user' },
    { src: 'images/baby_photo.jpeg', caption: 'Isliye moti karna chahta hu 😍' },
    { src: 'images/bumble.jpeg', caption: 'bumble ki photo meri bubbu ki 🥰' },
    { src: 'images/stand_up.jpeg', caption: 'Stand up comedy wo bhi free me 😂' },
    { src: 'images/kaungora.jpeg', caption: 'Kaun gora ,kaun kaal , guess place 😂' },
    { src: 'images/sundari.jpeg', caption: 'Sundari 😘' },
    { src: 'images/d1.jpg', caption: 'That smile I keep thinking about you 💖' },
    { src: 'images/d3.jpg', caption: 'My favorite person, always 🌸' },
    { src: 'images/tera_ladka.jpeg', caption: 'Jab app kush rahti hai to aap ka ladka 🌸' },
];

 // Reasons database
 const reasons = [
    { 
        text: "You’re such a kind and wonderful person, and I feel lucky to share such a good bond with you. 💖", 
        emoji: "🌟",
        gif: "gif2.gif"
    },
    { 
        text: "May your day be filled with love, laughter, and endless joy. 🌸 ", 
        emoji: "💗",
        gif: "gif2.gif"
    },
    { 
        text: "Wishing you success, happiness, and everything your heart desires. ✨ ", 
        emoji: "💕",
        gif: "gif2.gif"
    },
    { 
        text: "Stay the amazing girl you are—always spreading positivity around. Have the happiest year ahead! 🥳 ", 
        emoji: "🌟",
        gif: "gif2.gif"
    }
];

// State management
let currentReasonIndex = 0;
const reasonsContainer = document.getElementById('reasons-container');
const shuffleButton = document.querySelector('.shuffle-button');
const reasonCounter = document.querySelector('.reason-counter');
let isTransitioning = false;

// Create reason card with gif
function createReasonCard(reason) {
    const card = document.createElement('div');
    card.className = 'reason-card';
    
    const text = document.createElement('div');
    text.className = 'reason-text';
    text.innerHTML = `${reason.emoji} ${reason.text}`;
    
    const gifOverlay = document.createElement('div');
    gifOverlay.className = 'gif-overlay';
    gifOverlay.innerHTML = `<img src="${reason.gif}" alt="Friendship Memory">`;
    
    card.appendChild(text);
    card.appendChild(gifOverlay);

    // Tap to show gif on touch devices (hover doesn't work on mobile)
    card.addEventListener('click', () => {
        document.querySelectorAll('.reason-card.active').forEach((el) => {
            if (el !== card) el.classList.remove('active');
        });
        card.classList.toggle('active');
    });
    
    gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "back.out"
    });

    return card;
}

// Display new reason
function displayNewReason() {
    if (isTransitioning) return;
    isTransitioning = true;

    if (currentReasonIndex < reasons.length) {
        const card = createReasonCard(reasons[currentReasonIndex]);
        reasonsContainer.appendChild(card);
        
        // Update counter
        reasonCounter.textContent = `Reason ${currentReasonIndex + 1} of ${reasons.length}`;
        
        currentReasonIndex++;

        // Check if we should transform the button
        if (currentReasonIndex === reasons.length) {
            gsap.to(shuffleButton, {
                scale: 1.1,
                duration: 0.5,
                ease: "elastic.out",
                onComplete: () => {
                    shuffleButton.textContent = "Enter Our Storylane 💫";
                    shuffleButton.classList.add('story-mode');
                    shuffleButton.addEventListener('click', () => {
                        if (window.savePlaylistState) window.savePlaylistState();
                        gsap.to('body', {
                            opacity: 0,
                            duration: 1,
                            onComplete: () => {
                                window.location.href = 'last.html';
                            }
                        });
                    });
                }
            });
        }

        // Create floating elements
        createFloatingElement();
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    } else {
        // Handle navigation to new page or section
        window.location.href = "#storylane";
        // Or trigger your next page functionality
    }
}

// Initialize button click
shuffleButton.addEventListener('click', () => {
    gsap.to(shuffleButton, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
    displayNewReason();
});

// Floating elements function (same as before)
function createFloatingElement() {
    const elements = ['🌸', '✨', '💖', '🦋', '⭐'];
    const element = document.createElement('div');
    element.className = 'floating';
    element.textContent = elements[Math.floor(Math.random() * elements.length)];
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = Math.random() * window.innerHeight + 'px';
    element.style.fontSize = (Math.random() * 20 + 10) + 'px';
    document.body.appendChild(element);

    gsap.to(element, {
        y: -500,
        duration: Math.random() * 10 + 10,
        opacity: 0,
        onComplete: () => element.remove()
    });
}

// Custom cursor (desktop only)
const cursor = document.querySelector('.custom-cursor');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (cursor && canHover) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX - 15,
            y: e.clientY - 15,
            duration: 0.2
        });
    });
} else if (cursor) {
    cursor.style.display = 'none';
}

// Create initial floating elements
setInterval(createFloatingElement, 2000);

function initPhotoReel() {
    const track = document.getElementById('reel-track');
    const progressEl = document.getElementById('reel-progress');
    if (!track || !REEL_PHOTOS.length) return;

    track.innerHTML = '';
    if (progressEl) progressEl.innerHTML = '';

    REEL_PHOTOS.forEach((photo, i) => {
        const slide = document.createElement('article');
        slide.className = 'reel-slide';
        slide.innerHTML = `
            <img src="${photo.src}" alt="${photo.caption || 'A memory'}" class="reel-photo">
            <div class="reel-caption">
                <span class="reel-count">${i + 1} / ${REEL_PHOTOS.length}</span>
                <p>${photo.caption || ''}</p>
            </div>
        `;
        track.appendChild(slide);

        if (progressEl) {
            const bar = document.createElement('span');
            bar.className = 'reel-bar' + (i === 0 ? ' active' : '');
            progressEl.appendChild(bar);
        }
    });

    const updateActive = () => {
        const slides = track.querySelectorAll('.reel-slide');
        const bars = progressEl ? progressEl.querySelectorAll('.reel-bar') : [];
        const mid = track.getBoundingClientRect().top + track.clientHeight / 2;
        let active = 0;
        slides.forEach((slide, i) => {
            const rect = slide.getBoundingClientRect();
            if (rect.top <= mid && rect.bottom >= mid) active = i;
        });
        bars.forEach((bar, i) => bar.classList.toggle('active', i === active));
    };

    track.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
}

initPhotoReel();