(() => {
'use strict';
const $ = id => document.getElementById(id);
const C = $('game'), X = C.getContext('2d'), W = 800, H = 450, G = 400;
C.width = W; C.height = H;

/* ---------- Data tahap (DSKP 2.3.1 i, ii, iii) ---------- */
const LV = {
  1: { name: 'Mudah', tp: 'TP1–TP2', guide: true, nums: true, hide: false, glow: true, flag: 772,
       plat: [[380,330,110],[540,270,110],[680,210,110]],
       coins: [[120,360],[220,360],[320,360],[430,300],[590,240],[730,180]],
       foes: [] },
  2: { name: 'Sederhana', tp: 'TP3–TP4', guide: false, nums: true, hide: false, glow: true, flag: 775,
       plat: [[100,330,110],[260,260,110],[420,330,110],[580,260,110],[700,330,90]],
       coins: [[155,300],[315,230],[475,300],[635,230],[745,300]],
       foes: [{ x: 300, min: 230, max: 640, sp: 1.2 }] },
  3: { name: 'Mencabar', tp: 'TP5–TP6', guide: false, nums: true, hide: true, glow: false, flag: 775,
       plat: [[60,340,90],[200,280,90],[340,220,90],[480,280,90],[620,340,90],[720,260,80]],
       coins: [[105,310],[245,250],[385,190],[525,250],[665,310],[760,230]],
       foes: [{ x: 400, min: 150, max: 700, sp: 1.8 }, { x: 600, min: 300, max: 750, sp: 1.4 }] }
};
const best = { 1: 0, 2: 0, 3: 0 };

/* ---------- Keadaan ---------- */
let S = 'menu', lvl = 1, L, p, coins, foes, trail, next, score, hints, prev, parts, t = 0, last = 0, muted = false, msgT;
const keys = { left: false, right: false, jump: false };
const clouds = [{ x: 80, y: 60, z: 1, s: .15 }, { x: 400, y: 110, z: .7, s: .1 }, { x: 650, y: 50, z: 1.2, s: .2 }];

/* ---------- Bunyi ---------- */
let AC;
function beep(f, d = .12, type = 'square', v = .06, f2) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = f; if (f2) o.frequency.linearRampToValueAtTime(f2, AC.currentTime + d);
    g.gain.value = v; g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch (e) {}
}
const sfx = {
  jump: () => beep(300, .2, 'square', .05, 600), coin: () => { beep(880, .08); setTimeout(() => beep(1320, .15), 80); },
  bad: () => beep(150, .25, 'sawtooth', .06), hurt: () => beep(200, .3, 'sawtooth', .07, 80), stomp: () => beep(500, .12, 'triangle', .08, 250),
  win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .2, 'triangle', .08), i * 130))
};

/* ---------- Pembantu UI ---------- */
function toast(m, ms = 1800) {
  const e = $('msg'); e.textContent = m; e.classList.add('show');
  clearTimeout(msgT); msgT = setTimeout(() => e.classList.remove('show'), ms);
}
function modal(html, cls = '') { $('modalBox').className = 'box ' + cls; $('modalBox').innerHTML = html; $('modal').classList.add('show'); }
function closeModal() { $('modal').classList.remove('show'); }
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
function starsTxt(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
function refreshMenu() { for (let i = 1; i <= 3; i++) $('st' + i).textContent = starsTxt(best[i]); }

/* ---------- Mula / tamat ---------- */
function start(n) {
  lvl = n; L = LV[n]; closeModal(); show('play');
  p = { x: 30, y: G - 38, w: 28, h: 38, vx: 0, vy: 0, ground: true, face: 1, anim: 0, inv: 0, lives: 3, moving: false };
  coins = L.coins.map((c, i) => ({ x: c[0], y: c[1], n: i + 1, got: false }));
  foes = L.foes.map(f => ({ ...f, y: G, w: 34, h: 26, dir: 1, dead: 0 }));
  trail = []; next = 1; score = 0; hints = 0; parts = [];
  prev = L.hide ? 300 : 0;
  $('hLevel').textContent = L.name;
  $('btnHint').classList.toggle('hide', !L.hide);
  S = 'play';
  toast(L.hide ? 'Hafal corak dahulu!' : n === 1 ? 'Kutip titik 1, 2, 3 ikut garisan!' : 'Kutip titik ikut nombor!', 2400);
  last = performance.now();
}
function finish(win) {
  S = win ? 'win' : 'lose';
  if (win) {
    const st = p.lives === 3 && hints === 0 ? 3 : p.lives >= 2 ? 2 : 1;
    best[lvl] = Math.max(best[lvl], st); sfx.win(); confetti();
    modal(`<h2>🎉 Hebat sekali!</h2><div class="stars">${starsTxt(st)}</div>
      <p>Anda berjaya menyiapkan corak <b>${L.name}</b>!<br>Skor: ⭐ ${score}</p>
      <div class="row"><button class="btn" id="mRetry">🔁 Main Semula</button>
      ${lvl < 3 ? '<button class="btn go" id="mNext">➡ Tahap Seterusnya</button>' : ''}
      <button class="btn red" id="mMenu">🏠 Menu</button></div>`);
    if (lvl < 3) $('mNext').onclick = () => start(lvl + 1);
  } else {
    beep(120, .6, 'sawtooth', .08, 60);
    modal(`<h2>😢 Cuba lagi!</h2><p>Jangan risau, anda pasti boleh!<br>Lompat atas musuh atau elak mereka.</p>
      <div class="row"><button class="btn go" id="mRetry">🔁 Cuba Lagi</button><button class="btn red" id="mMenu">🏠 Menu</button></div>`);
  }
  $('mRetry').onclick = () => start(lvl);
  $('mMenu').onclick = toMenu;
}
function toMenu() { S = 'menu'; closeModal(); refreshMenu(); show('menu'); }

/* ---------- Zarah ---------- */
function burst(x, y, n = 12, cols = ['#ffd23f', '#fff', '#ff9f1c']) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, s = 1 + Math.random() * 3;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 40 + Math.random() * 20, c: cols[i % cols.length], s: 3 + Math.random() * 3 });
  }
}
function confetti() {
  for (let i = 0; i < 120; i++)
    parts.push({ x: Math.random() * W, y: -Math.random() * 200, vx: Math.random() * 2 - 1, vy: 1 + Math.random() * 3, life: 200, s: 5 + Math.random() * 5, g: 0,
      c: ['#ff5a5f', '#ffd23f', '#3ddc84', '#3a86ff', '#8338ec'][i % 5] });
}

/* ---------- Kemas kini ---------- */
function update(dt) {
  t += dt;
  if (S === 'play' && prev > 0) { prev -= dt; if (prev <= 0) toast('Sekarang kutip ikut corak tadi!'); }
  else if (S === 'play') {
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    p.vx = dir * 3.4; p.moving = dir !== 0; if (dir) p.face = dir;
    if (keys.jump && p.ground) { p.vy = -12.5; p.ground = false; sfx.jump(); }
    p.x = Math.max(0, Math.min(W - p.w, p.x + p.vx * dt));
    const pb = p.y + p.h; p.vy += .6 * dt; p.y += p.vy * dt; p.ground = false;
    const plats = [[0, G, W], ...L.plat];
    if (p.vy >= 0) for (const [px, py, pw] of plats)
      if (p.x + p.w > px && p.x < px + pw && pb <= py + 4 && p.y + p.h >= py) { p.y = py - p.h; p.vy = 0; p.ground = true; }
    if (p.moving && p.ground) p.anim += .35 * dt;
    if (p.inv > 0) p.inv -= dt;

    // musuh
    for (const f of foes) {
      if (f.dead) { f.dead -= dt; continue; }
      f.x += f.sp * f.dir * dt; if (f.x < f.min) f.dir = 1; if (f.x > f.max) f.dir = -1;
      if (p.x + p.w > f.x && p.x < f.x + f.w && p.y + p.h > f.y - f.h && p.y < f.y) {
        if (p.vy > 1 && pb <= f.y - f.h + 12) { f.dead = 30; p.vy = -9; score += 10; sfx.stomp(); burst(f.x + 17, f.y - 10, 8, ['#7bd95b', '#fff']); }
        else if (p.inv <= 0) {
          p.lives--; p.inv = 100; p.vy = -8; p.x += p.x < f.x ? -50 : 50; p.x = Math.max(0, Math.min(W - p.w, p.x)); sfx.hurt();
          if (p.lives <= 0) { finish(false); return; }
          toast('Aduh! Elak musuh hijau!');
        }
      }
    }
    // titik
    for (const c of coins) {
      if (c.got || Math.hypot(p.x + 14 - c.x, p.y + 19 - c.y) > 28) continue;
      if (c.n === next) {
        c.got = true; next++; trail.push(c); score += 20; sfx.coin(); burst(c.x, c.y);
        if (next > coins.length) toast('Corak siap! Pergi ke bendera 🚩', 2600);
      } else if (!c.warn || t - c.warn > 60) {
        c.warn = t; sfx.bad(); toast(L.hide ? 'Salah! Ingat semula corak tadi' : `Cari titik nombor ${next} dahulu!`);
      }
    }
    // bendera
    if (p.x + p.w > L.flag - 6 && p.x < L.flag + 30) {
      if (next > coins.length) { score += p.lives * 10; finish(true); }
      else if (!p.fw || t - p.fw > 90) { p.fw = t; toast('Kutip semua titik dahulu!'); }
    }
  }
  for (const q of parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g === 0 ? .03 : .12) * dt; q.life -= dt; }
  parts = parts.filter(q => q.life > 0);
  $('hLives').textContent = p ? '❤️'.repeat(Math.max(0, p.lives)) || '💔' : '';
  if (p) { $('hDots').textContent = `🔵 ${Math.min(next - 1, coins.length)}/${coins.length}`; $('hScore').textContent = '⭐ ' + score; }
}

/* ---------- Lukisan ---------- */
function cloud(x, y, z) {
  X.fillStyle = 'rgba(255,255,255,.9)'; X.beginPath();
  X.arc(x, y, 22 * z, 0, 7); X.arc(x + 26 * z, y - 10 * z, 28 * z, 0, 7); X.arc(x + 56 * z, y, 22 * z, 0, 7); X.fill();
}
function drawBG() {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#6ec6ff'); g.addColorStop(1, '#d8f3ff');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.fillStyle = '#ffe066'; X.beginPath(); X.arc(700, 70, 38 + Math.sin(t / 20) * 2, 0, 7); X.fill();
  for (const c of clouds) { c.x += c.s; if (c.x > W + 80) c.x = -90; cloud(c.x, c.y, c.z); }
  X.fillStyle = '#a8e88b';
  for (const [x, r] of [[120, 110], [430, 160], [730, 120]]) { X.beginPath(); X.arc(x, G + 20, r, Math.PI, 0); X.fill(); }
  X.fillStyle = '#8d5a2b'; X.fillRect(0, G, W, H - G);
  X.fillStyle = '#4cc94c'; X.fillRect(0, G, W, 12);
  X.fillStyle = '#6f4720'; for (let i = 0; i < W; i += 40) X.fillRect(i + 10, G + 24, 14, 8);
  for (const [x, y, w] of L.plat) {
    X.fillStyle = '#b5702f'; rr(x, y, w, 16, 6); X.fillStyle = '#4cc94c'; rr(x - 2, y - 3, w + 4, 9, 5);
  }
}
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect ? X.roundRect(x, y, w, h, r) : X.rect(x, y, w, h); X.fill(); }
function drawFlag() {
  const x = L.flag; X.fillStyle = '#fff'; X.fillRect(x, G - 90, 5, 90);
  X.fillStyle = next > coins.length ? '#3ddc84' : '#ff5a5f';
  const w = Math.sin(t / 6) * 5; X.beginPath(); X.moveTo(x + 5, G - 90); X.lineTo(x + 45, G - 76 + w); X.lineTo(x + 5, G - 62); X.fill();
  X.fillStyle = '#ffd23f'; X.beginPath(); X.arc(x + 2, G - 92, 6, 0, 7); X.fill();
}
function drawLines() {
  const pv = prev > 0;
  if (L.guide || pv) {
    X.save(); X.lineWidth = 5; X.lineCap = 'round'; X.strokeStyle = pv ? '#ff5a5f' : 'rgba(131,56,236,.55)';
    if (!pv) X.setLineDash([4, 12]);
    X.beginPath(); coins.forEach((c, i) => i ? X.lineTo(c.x, c.y) : X.moveTo(c.x, c.y)); X.stroke(); X.restore();
  }
  if (trail.length) {
    X.save(); X.lineWidth = 7; X.lineCap = X.lineJoin = 'round'; X.strokeStyle = '#3a86ff'; X.shadowColor = '#3a86ff'; X.shadowBlur = 10;
    X.beginPath(); trail.forEach((c, i) => i ? X.lineTo(c.x, c.y) : X.moveTo(c.x, c.y)); X.stroke(); X.restore();
    for (const c of trail) { X.fillStyle = '#fff'; X.beginPath(); X.arc(c.x, c.y, 7, 0, 7); X.fill(); X.fillStyle = '#3a86ff'; X.beginPath(); X.arc(c.x, c.y, 4, 0, 7); X.fill(); }
  }
}
function drawCoins() {
  const pv = prev > 0;
  for (const c of coins) {
    if (c.got) continue;
    const y = c.y + Math.sin(t / 12 + c.n) * 4, isNext = c.n === next;
    if (isNext && L.glow && !pv) { X.fillStyle = `rgba(255,210,63,${.3 + .2 * Math.sin(t / 8)})`; X.beginPath(); X.arc(c.x, y, 26 + Math.sin(t / 8) * 4, 0, 7); X.fill(); }
    X.fillStyle = '#ff9f1c'; X.beginPath(); X.arc(c.x, y, 17, 0, 7); X.fill();
    X.fillStyle = '#ffd23f'; X.beginPath(); X.arc(c.x, y, 13, 0, 7); X.fill();
    if (L.nums && (!L.hide || pv)) {
      X.fillStyle = '#2b2d42'; X.font = '800 18px "Baloo 2",sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(c.n, c.x, y + 1);
    } else { X.fillStyle = 'rgba(255,255,255,.7)'; X.beginPath(); X.arc(c.x - 4, y - 4, 4, 0, 7); X.fill(); }
  }
}
function drawFoes() {
  for (const f of foes) {
    const sq = f.dead > 0; if (sq && f.dead < 6) continue;
    X.save(); X.translate(f.x + 17, f.y);
    const k = Math.sin(t / 5 + f.x) * .06; X.scale(1 + k, sq ? .3 : 1 - k);
    X.fillStyle = '#4fc83d'; X.beginPath(); X.ellipse(0, -13, 17, 13, 0, Math.PI, 0); X.rect(-17, -13, 34, 13); X.fill();
    if (!sq) {
      X.fillStyle = '#fff'; X.beginPath(); X.arc(-6, -15, 5, 0, 7); X.arc(6, -15, 5, 0, 7); X.fill();
      X.fillStyle = '#222'; X.beginPath(); X.arc(-5 + f.dir * 2, -15, 2.4, 0, 7); X.arc(7 + f.dir * 2, -15, 2.4, 0, 7); X.fill();
    }
    X.restore();
  }
}
function drawPlayer() {
  if (p.inv > 0 && Math.floor(p.inv / 5) % 2) return;
  X.save(); X.translate(p.x + 14, p.y); X.scale(p.face, 1);
  const l = p.moving && p.ground ? Math.sin(p.anim) * 6 : 0, j = p.ground ? 0 : -3;
  X.fillStyle = '#2b59c3'; X.fillRect(-10 + l, 28, 9, 10); X.fillRect(1 - l, 28, 9, 10);
  X.fillStyle = '#e63946'; rr(-12, 15 + j, 24, 16, 5);
  X.fillStyle = '#2b59c3'; rr(-12, 23 + j, 24, 8, 4);
  X.fillStyle = '#ffd23f'; X.beginPath(); X.arc(-5, 25 + j, 2, 0, 7); X.arc(5, 25 + j, 2, 0, 7); X.fill();
  X.fillStyle = '#ffcf9f'; X.beginPath(); X.arc(0, 9 + j, 11, 0, 7); X.fill();
  X.fillStyle = '#e63946'; X.beginPath(); X.arc(0, 6 + j, 11, Math.PI, 0); X.fill(); X.fillRect(0, 4 + j, 15, 4);
  X.fillStyle = '#222'; X.beginPath(); X.arc(4, 9 + j, 2.2, 0, 7); X.fill();
  X.strokeStyle = '#c0392b'; X.lineWidth = 2; X.beginPath(); X.arc(3, 13 + j, 4, .2, 2.9); X.stroke();
  X.restore();
}
function drawParts() { for (const q of parts) { X.globalAlpha = Math.min(1, q.life / 20); X.fillStyle = q.c; X.fillRect(q.x, q.y, q.s, q.s); } X.globalAlpha = 1; }
function draw() {
  drawBG(); drawFlag(); drawLines(); drawCoins(); drawFoes(); drawPlayer(); drawParts();
  if (S === 'play' && prev > 0) {
    X.fillStyle = 'rgba(43,45,66,.75)'; rr(W / 2 - 190, 14, 380, 50, 25);
    X.fillStyle = '#fff'; X.font = '800 26px "Baloo 2",sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillText(`👀 Hafal corak ini! ${Math.ceil(prev / 60)}`, W / 2, 40);
  }
}

/* ---------- Gelung utama ---------- */
function loop(now) {
  const dt = Math.min(2, (now - last) / 16.67 || 1); last = now;
  if (L && p && (S === 'play' || S === 'win' || S === 'lose')) { update(dt); draw(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Input ---------- */
const kmap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump' };
addEventListener('keydown', e => { const k = kmap[e.key]; if (k && S === 'play') { keys[k] = true; e.preventDefault(); } });
addEventListener('keyup', e => { const k = kmap[e.key]; if (k) keys[k] = false; });
document.querySelectorAll('.pb').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); keys[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (x) {} };
  const off = () => { keys[k] = false; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
});
addEventListener('blur', () => { keys.left = keys.right = keys.jump = false; });

/* ---------- Butang ---------- */
document.querySelectorAll('.card').forEach(c => c.onclick = () => { beep(660, .1); start(+c.dataset.level); });
$('btnMenu').onclick = toMenu;
$('btnSound').onclick = e => { muted = !muted; e.currentTarget.textContent = muted ? '🔇' : '🔊'; };
$('btnHint').onclick = () => { if (S === 'play' && prev <= 0) { prev = 180; hints++; score = Math.max(0, score - 10); toast('Petunjuk digunakan (-10)'); } };
$('btnInfo').onclick = () => {
  modal(`<h2>📘 Maklumat DSKP</h2>
  <h3>Maklumat umum hasil pembelajaran</h3>
  <ul><li>Kurikulum: KSSRPK Kurikulum Semakan (Pendidikan Khas – Masalah Pembelajaran)</li>
  <li>Mata pelajaran: Pengurusan Kehidupan, Komponen Kemahiran Manipulatif, Tahun 2</li>
  <li>Minggu 31–35 (RPT)</li>
  <li>Hasil pembelajaran: murid dapat melakukan dan menunjukkan pergerakan koordinasi mata-tangan dengan betul, selamat dan boleh dicontohi.</li></ul>
  <h3>Tajuk</h3><p>2.0 Motor Halus<br>2.3 Koordinasi mata – tangan</p>
  <h3>Standard kandungan 2.3.1</h3>
  <ul><li>(i) Meniru pelbagai corak garisan</li><li>(ii) Menyambung titik-titik pelbagai corak garisan</li><li>(iii) Menulis semula pelbagai corak garisan</li></ul>
  <h3>Pemetaan tahap permainan</h3>
  <table><tr><th>Tahap</th><th>Fokus</th><th>TP</th></tr>
  <tr><td>Mudah</td><td>(i) Meniru garisan panduan bertitik</td><td>1–2</td></tr>
  <tr><td>Sederhana</td><td>(ii) Menyambung titik bernombor</td><td>3–4</td></tr>
  <tr><td>Mencabar</td><td>(iii) Menulis semula corak dari ingatan</td><td>5–6</td></tr></table>
  <div class="row"><button class="btn go" id="mClose">Tutup</button></div>`, 'info');
  $('mClose').onclick = closeModal;
};
refreshMenu();
})();
