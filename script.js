/* ══════════════════════════════════════════
   Akmal Zaidan — Portfolio
   script.js
   ══════════════════════════════════════════ */

/* ── Reveal on scroll ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(el => {
    if (el.isIntersecting) el.target.classList.add('show');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ══════════════════════════════════════════
   Music Player — Real Audio
   ══════════════════════════════════════════ */

const audioEl   = document.getElementById('audioPlayer');
const rows      = [...document.querySelectorAll('.artist-row')];

let currentIdx  = 0;
let isPlaying   = false;
let hasSelected = false;

/* ── Format detik → m:ss ── */
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

/* ── Update semua elemen UI ── */
function updateUI() {
  const row     = rows[currentIdx];
  const poster  = document.getElementById('playerPoster');
  const ph      = document.getElementById('playerPlaceholder');
  const label   = document.getElementById('playerArtLabel');

  /* Poster */
  if (hasSelected) {
    poster.src           = row.dataset.poster || '';
    poster.style.display = 'block';
    ph.style.display     = 'none';
    label.textContent    = isPlaying ? 'Now Playing' : 'Paused';
  } else {
    poster.style.display = 'none';
    ph.style.display     = 'flex';
    label.textContent    = 'Pilih lagu untuk mulai';
  }

  /* Track info */
  document.getElementById('playerTrack').textContent  = hasSelected ? (row.dataset.track  || '—') : '—';
  document.getElementById('playerArtist').textContent = hasSelected ? (row.dataset.artist || '—') : 'Klik nama artis di kiri';

  /* Tombol play */
  document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';

  /* Highlight row aktif */
  rows.forEach((r, i) => r.classList.toggle('active', hasSelected && i === currentIdx));
}

/* ── Sinkron progress bar dari audio element ── */
audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  document.getElementById('playerFill').style.width    = pct + '%';
  document.getElementById('playerCurrent').textContent = fmt(audioEl.currentTime);
  document.getElementById('playerDuration').textContent= fmt(audioEl.duration);
});

/* Saat audio selesai — stop, jangan auto next */
audioEl.addEventListener('ended', () => {
  isPlaying = false;
  audioEl.currentTime = 0;
  updateUI();
});

/* ── Klik artist row → load lagu, TIDAK otomatis play ── */
function selectArtist(row) {
  const idx = rows.indexOf(row);
  currentIdx  = idx;
  isPlaying   = false;
  hasSelected = true;

  const src = row.dataset.audio || '';
  audioEl.pause();
  audioEl.src         = src;
  audioEl.currentTime = 0;
  audioEl.load();

  /* Reset progress bar */
  document.getElementById('playerFill').style.width     = '0%';
  document.getElementById('playerCurrent').textContent  = '0:00';
  document.getElementById('playerDuration').textContent = fmt(parseInt(row.dataset.duration) || 0);

  updateUI();
}

/* ── Toggle play / pause ── */
function togglePlay() {
  if (!hasSelected) return;

  if (isPlaying) {
    audioEl.pause();
    isPlaying = false;
  } else {
    audioEl.play().catch(() => {
      /* File audio belum ada — tetap tampilkan state play */
    });
    isPlaying = true;
  }
  updateUI();
}

/* ── Next ── */
function nextTrack() {
  if (!hasSelected) return;
  currentIdx = (currentIdx + 1) % rows.length;
  selectArtist(rows[currentIdx]);
}

/* ── Prev ── */
function prevTrack() {
  if (!hasSelected) return;
  currentIdx = (currentIdx - 1 + rows.length) % rows.length;
  selectArtist(rows[currentIdx]);
}

/* ── Seek ── */
function seekPlayer(e) {
  if (!hasSelected) return;
  const bar  = document.getElementById('playerBar');
  const rect = bar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audioEl.duration) {
    audioEl.currentTime = pct * audioEl.duration;
  } else {
    /* fallback jika file belum ada */
    const dur = parseInt(rows[currentIdx].dataset.duration) || 0;
    document.getElementById('playerFill').style.width    = (pct * 100) + '%';
    document.getElementById('playerCurrent').textContent = fmt(pct * dur);
  }
}

/* ── Init ── */
updateUI();