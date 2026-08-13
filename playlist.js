// Shared playlist for every page — state continues via localStorage
const PLAYLIST = [
    { title: 'Main Tera Ho Gaya', src: 'music/main-tera-ho-gaya.mp3' },
    { title: 'Jaane Tu', src: 'music/jaane-tu.mp3' },
    { title: 'Mera Pehla Pehla Pyaar', src: 'music/mera-pehla-pehla-pyaar.mp3' },
];

const PLAYLIST_STORAGE_KEY = 'hb_playlist_state';

let playlistIndex = 0;
const audio = new Audio();
audio.preload = 'auto';
audio.loop = false;

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function savePlaylistState() {
    try {
        localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify({
            index: playlistIndex,
            time: audio.currentTime || 0,
            playing: !audio.paused && !!audio.getAttribute('src'),
        }));
    } catch (e) { /* ignore */ }
}

function loadPlaylistState() {
    try {
        const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

window.savePlaylistState = savePlaylistState;

function initPlaylist() {
    const listEl = document.getElementById('track-list');
    const playBtn = document.getElementById('toggle-play');
    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    const unmuteBtn = document.getElementById('unmute');
    const playlistEl = document.getElementById('playlist');
    const playlistToggle = document.getElementById('playlist-toggle');

    if (!listEl) return;

    if (playlistToggle && playlistEl) {
        playlistToggle.addEventListener('click', () => {
            const open = playlistEl.classList.toggle('expanded');
            playlistToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            playlistToggle.textContent = open ? '▼' : '▲';
        });
    }

    listEl.innerHTML = '';
    if (!PLAYLIST.length) {
        listEl.innerHTML = '<div class="empty">No tracks yet</div>';
    } else {
        PLAYLIST.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = 'track';
            item.dataset.index = i;
            item.innerHTML = `<div class="title">${t.title}</div><div class="duration">--:--</div>`;
            item.addEventListener('click', () => { playIndex(i); });
            listEl.appendChild(item);
        });
    }

    function updateUI() {
        document.querySelectorAll('.track').forEach((el) => el.classList.remove('playing'));
        const cur = document.querySelector(`.track[data-index='${playlistIndex}']`);
        if (cur) cur.classList.add('playing');
        if (playBtn) playBtn.textContent = audio.paused ? 'Play' : 'Pause';
    }

    function playIndex(i, startAt = 0) {
        if (!PLAYLIST[i]) return;
        playlistIndex = i;
        audio.src = PLAYLIST[i].src;
        const seek = () => {
            if (startAt > 0 && Number.isFinite(audio.duration)) {
                audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 0.5));
            }
        };
        if (startAt > 0) {
            audio.addEventListener('loadedmetadata', seek, { once: true });
        }
        const playPromise = audio.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch((err) => {
                console.warn('Audio play prevented:', err);
                updateUI();
            });
        }
        savePlaylistState();
        updateUI();
    }

    function nextTrack() {
        if (!PLAYLIST.length) return;
        playlistIndex = (playlistIndex + 1) % PLAYLIST.length;
        playIndex(playlistIndex);
    }

    function prevTrack() {
        if (!PLAYLIST.length) return;
        playlistIndex = (playlistIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
        playIndex(playlistIndex);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!PLAYLIST.length) return;
            if (!audio.getAttribute('src')) {
                playIndex(playlistIndex || 0);
                return;
            }
            if (audio.paused) {
                audio.play().catch((err) => console.warn('Audio play prevented:', err));
            } else {
                audio.pause();
            }
            savePlaylistState();
            updateUI();
        });
    }

    audio.addEventListener('ended', () => { nextTrack(); });
    audio.addEventListener('play', () => { updateUI(); savePlaylistState(); });
    audio.addEventListener('pause', () => { updateUI(); savePlaylistState(); });
    audio.addEventListener('timeupdate', () => {
        // throttle saves a bit via attribute check
        if (!audio._lastSave || Date.now() - audio._lastSave > 2000) {
            audio._lastSave = Date.now();
            savePlaylistState();
        }
    });
    audio.addEventListener('error', () => {
        console.error('Failed to load:', PLAYLIST[playlistIndex] && PLAYLIST[playlistIndex].src);
        const dur = document.querySelector(`.track[data-index='${playlistIndex}'] .duration`);
        if (dur) dur.textContent = 'ERR';
    });

    PLAYLIST.forEach((t, i) => {
        if (!t.src) return;
        const a = document.createElement('audio');
        a.src = t.src;
        a.preload = 'metadata';
        a.addEventListener('loadedmetadata', () => {
            const dur = document.querySelector(`.track[data-index='${i}'] .duration`);
            if (dur) dur.textContent = formatTime(Math.floor(a.duration));
        });
        a.addEventListener('error', () => {
            const dur = document.querySelector(`.track[data-index='${i}'] .duration`);
            if (dur) dur.textContent = 'ERR';
        });
    });

    if (unmuteBtn) {
        unmuteBtn.addEventListener('click', () => {
            if (!PLAYLIST.length) return;
            if (!audio.getAttribute('src')) {
                playIndex(0);
            } else if (audio.paused) {
                audio.play().catch(() => {});
            }
        });
    }

    // Restore across pages
    const saved = loadPlaylistState();
    if (saved && PLAYLIST[saved.index]) {
        playlistIndex = saved.index;
        audio.src = PLAYLIST[playlistIndex].src;
        const resumeAt = saved.time || 0;
        const tryResume = () => {
            if (resumeAt > 0 && Number.isFinite(audio.duration)) {
                audio.currentTime = Math.min(resumeAt, Math.max(0, audio.duration - 0.5));
            }
            if (saved.playing) {
                audio.play().catch(() => {
                    // Browser blocked autoplay — user can press Play
                    updateUI();
                });
            }
            updateUI();
        };
        if (audio.readyState >= 1) {
            tryResume();
        } else {
            audio.addEventListener('loadedmetadata', tryResume, { once: true });
            audio.load();
        }
    }

    window.addEventListener('pagehide', savePlaylistState);
    window.addEventListener('beforeunload', savePlaylistState);

    updateUI();
}

document.addEventListener('DOMContentLoaded', initPlaylist);
