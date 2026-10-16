/* DSKP 2.2.3 – Menconteng (pensel, pensel warna, pen marker) dan mengecat (berus pelbagai saiz)
   5 aktiviti × 2 level */
'use strict';

const W = 800, H = 500;

const COLORS = {
  merah:  '#E53935', oren: '#FB8C00', kuning: '#FDD835', hijau: '#43A047',
  biru:   '#1E88E5', ungu: '#8E24AA', coklat: '#6D4C41', hitam: '#212121'
};
const SIZES = {
  halus:     { n: 'Halus',     w: 6 },
  pensel:    { n: 'Pensel',    w: 18 },
  marker:    { n: 'Marker',    w: 22 },
  kecil:     { n: 'Kecil',     w: 8 },
  sederhana: { n: 'Sederhana', w: 22 },
  besar:     { n: 'Besar',     w: 46 }
};

/* ---------- Bentuk & garisan ---------- */
const line = (...p) => p;
const wave = () => Array.from({ length: 61 }, (_, i) => [100 + i * 10, 240 + Math.sin(i / 60 * Math.PI * 4) * 40]);
const zig  = () => Array.from({ length: 9 }, (_, i) => [100 + i * 75, i % 2 ? 110 : 40]);
const arch = () => Array.from({ length: 61 }, (_, i) => {
  const a = Math.PI + i / 60 * Math.PI; return [400 + Math.cos(a) * 260, 470 + Math.sin(a) * 90];
});

const ALL = ['merah', 'oren', 'kuning', 'hijau', 'biru', 'ungu'];
const MAIN = ['merah', 'oren', 'kuning', 'hijau', 'biru', 'ungu', 'coklat', 'hitam'];

const house = (req) => [
  { label: 'Rumput',    s: ['r', 0, 400, 800, 100],            color: req && 'hijau' },
  { label: 'Dinding',   s: ['r', 250, 230, 300, 170],          color: req && 'kuning' },
  { label: 'Bumbung',   s: ['t', 220, 230, 400, 110, 580, 230], color: req && 'merah' },
  { label: 'Pintu',     s: ['r', 375, 310, 50, 90],            color: req && 'coklat' },
  { label: 'Matahari',  s: ['c', 680, 90, 50],                 color: req && 'oren' }
].map(o => ({ type: 'fill', ...o }));

/* ---------- Data aktiviti ---------- */
const ACTIVITIES = [
  {
    id: 'pensel', icon: '✏️', title: 'Conteng dengan Pensel',
    desc: 'Menconteng menggunakan pensel.',
    levels: [
      { text: 'Conteng bebas di atas kertas. Gerakkan pensel ke mana-mana!',
        ink: '#444', sizes: ['halus'],
        tasks: [{ type: 'free', label: 'Conteng bebas', goal: 2500 }] },
      { text: 'Conteng di dalam bulatan sehingga penuh. Pensel tidak akan keluar garisan.',
        ink: '#444', sizes: ['pensel'],
        tasks: [
          { type: 'fill', label: 'Bulatan besar', s: ['c', 230, 250, 150] },
          { type: 'fill', label: 'Bulatan kecil', s: ['c', 600, 250, 90] }
        ] }
    ]
  },
  {
    id: 'warna', icon: '🖍️', title: 'Conteng dengan Pensel Warna',
    desc: 'Menconteng menggunakan pensel warna.',
    levels: [
      { text: 'Warnakan epal dan daun dengan warna yang kamu suka.',
        palette: ALL, sizes: ['pensel'],
        tasks: [
          { type: 'fill', label: 'Epal', s: ['c', 400, 300, 170] },
          { type: 'fill', label: 'Daun', s: ['e', 480, 100, 75, 28] }
        ] },
      { text: 'Warnakan belon mengikut warna yang ditunjukkan.',
        palette: ALL, sizes: ['pensel'],
        tasks: [
          { type: 'fill', label: 'Belon merah',  s: ['c', 160, 250, 95], color: 'merah' },
          { type: 'fill', label: 'Belon biru',   s: ['c', 400, 250, 95], color: 'biru' },
          { type: 'fill', label: 'Belon kuning', s: ['c', 640, 250, 95], color: 'kuning' }
        ] }
    ]
  },
  {
    id: 'marker', icon: '🖊️', title: 'Ikut Garisan dengan Pen Marker',
    desc: 'Menconteng menggunakan pen marker mengikut garisan.',
    levels: [
      { text: 'Ikut garisan titik-titik dari bulatan hijau ke bintang.',
        palette: ['biru', 'merah', 'hijau', 'hitam'], sizes: ['marker'],
        tasks: [
          { type: 'trace', label: 'Garis mendatar', pts: line([100, 100], [700, 100]) },
          { type: 'trace', label: 'Garis menegak',  pts: line([150, 190], [150, 450]) },
          { type: 'trace', label: 'Garis condong',  pts: line([300, 200], [700, 450]) }
        ] },
      { text: 'Ikut garisan yang bengkok-bengkok. Pergerakan perlahan dan teliti.',
        palette: ['biru', 'merah', 'hijau', 'hitam'], sizes: ['marker'], width: 18,
        tasks: [
          { type: 'trace', label: 'Garis zigzag',    pts: zig() },
          { type: 'trace', label: 'Garis bergelombang', pts: wave() },
          { type: 'trace', label: 'Garis melengkung', pts: arch() }
        ] }
    ]
  },
  {
    id: 'berus', icon: '🖌️', title: 'Mengecat dengan Berus',
    desc: 'Mengecat menggunakan berus pelbagai saiz.',
    levels: [
      { text: 'Cat dinding yang besar. Berus besar membuat kerja lebih cepat!',
        palette: MAIN, sizes: ['kecil', 'sederhana', 'besar'], start: 'besar',
        tasks: [{ type: 'fill', label: 'Dinding', s: ['r', 80, 100, 640, 300] }] },
      { text: 'Pilih berus yang sesuai: berus besar untuk kawasan besar, berus kecil untuk kawasan kecil.',
        palette: MAIN, sizes: ['kecil', 'sederhana', 'besar'],
        tasks: [
          { type: 'fill', label: 'Papan besar (berus besar)', s: ['r', 60, 50, 680, 200], brush: 'besar' },
          { type: 'fill', label: 'Bulatan 1 (berus kecil)', s: ['c', 200, 385, 40], brush: 'kecil' },
          { type: 'fill', label: 'Bulatan 2 (berus kecil)', s: ['c', 400, 385, 40], brush: 'kecil' },
          { type: 'fill', label: 'Bulatan 3 (berus kecil)', s: ['c', 600, 385, 40], brush: 'kecil' }
        ] }
    ]
  },
  {
    id: 'cat', icon: '🏠', title: 'Cat Gambar Rumah',
    desc: 'Mengecat gambar dengan berus pelbagai saiz.',
    levels: [
      { text: 'Cat rumah dengan warna yang kamu suka.',
        palette: MAIN, sizes: ['kecil', 'sederhana', 'besar'], start: 'sederhana',
        tasks: house(false) },
      { text: 'Cat rumah mengikut warna yang ditunjukkan.',
        palette: MAIN, sizes: ['kecil', 'sederhana', 'besar'], start: 'sederhana',
        tasks: house(true) }
    ]
  }
];

/* ---------- Keadaan ---------- */
const $ = (id) => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d', { willReadFrequently: true });
const paint = document.createElement('canvas'); paint.width = W; paint.height = H;
const pctx = paint.getContext('2d', { willReadFrequently: true });

let cur = null;          // { a, l }
let tasks = [];          // tugasan aktif
let clipPath = null;     // kawasan boleh dicat
let color = COLORS.biru, sizeKey = 'pensel';
let drawing = false, last = null, strokeLen = 0, lastEval = 0, finished = false;

const store = {
  get() { try { return JSON.parse(localStorage.getItem('km2-223') || '{}'); } catch { return {}; } },
  set(v) { try { localStorage.setItem('km2-223', JSON.stringify(v)); } catch { /* abaikan */ } }
};

/* ---------- Menu ---------- */
function buildMenu() {
  const done = store.get();
  const box = $('cards'); box.innerHTML = '';
  ACTIVITIES.forEach((a, ai) => {
    const el = document.createElement('article'); el.className = 'card';
    el.innerHTML = `<div class="ico" aria-hidden="true">${a.icon}</div>
      <h3>Aktiviti ${ai + 1}: ${a.title}</h3><p>${a.desc}</p><div class="lvls"></div>`;
    a.levels.forEach((_, li) => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'btn' + (done[`${a.id}-${li}`] ? ' done' : '');
      b.textContent = `Level ${li + 1}`;
      b.addEventListener('click', () => start(ai, li));
      el.querySelector('.lvls').appendChild(b);
    });
    box.appendChild(el);
  });
}

/* ---------- Mula aktiviti ---------- */
function mkPath(s) {
  const p = new Path2D(), [t, ...a] = s;
  if (t === 'c') p.arc(a[0], a[1], a[2], 0, 7);
  if (t === 'r') p.rect(a[0], a[1], a[2], a[3]);
  if (t === 'e') p.ellipse(a[0], a[1], a[2], a[3], 0, 0, 7);
  if (t === 't') { p.moveTo(a[0], a[1]); p.lineTo(a[2], a[3]); p.lineTo(a[4], a[5]); p.closePath(); }
  return p;
}
function hexRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }

function start(ai, li) {
  const a = ACTIVITIES[ai], l = a.levels[li];
  cur = { a, l, ai, li }; finished = false; strokeLen = 0;
  pctx.clearRect(0, 0, W, H);

  // sediakan tugasan
  tasks = l.tasks.map(t => ({ ...t, pct: 0, any: 0, ok: false }));
  clipPath = null;
  const fills = tasks.filter(t => t.type === 'fill');
  fills.forEach((t, i) => {
    t.path = mkPath(t.s);
    t.rgb = t.color ? hexRgb(COLORS[t.color]) : null;
    t.samples = [];
    const later = fills.slice(i + 1).map(x => mkPath(x.s));
    for (let y = 4; y < H; y += 8) for (let x = 4; x < W; x += 8) {
      if (ctx.isPointInPath(t.path, x, y) && !later.some(p => ctx.isPointInPath(p, x, y))) t.samples.push([x, y]);
    }
  });
  if (fills.length) { clipPath = new Path2D(); fills.forEach(t => clipPath.addPath(t.path)); }
  tasks.filter(t => t.type === 'trace').forEach(t => {
    t.samples = [];
    for (let i = 0; i < t.pts.length - 1; i++) {
      const [x1, y1] = t.pts[i], [x2, y2] = t.pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 10));
      for (let k = 0; k <= n; k++) t.samples.push([x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
    }
  });

  // alat
  sizeKey = l.start || l.sizes[0];
  color = l.ink || COLORS[l.palette[0]];
  buildTools();

  $('actTitle').textContent = a.title;
  $('lvlTag').textContent = `Level ${li + 1}`;
  $('instr').textContent = l.text;
  $('hint').textContent = '';
  buildChips(); updateMeter(); render();
  $('menu').hidden = true; $('play').hidden = false;
  window.scrollTo({ top: 0 });
}

function buildTools() {
  const l = cur.l, pal = $('palette'), sz = $('sizes');
  pal.innerHTML = ''; sz.innerHTML = '';
  pal.hidden = !l.palette;
  (l.palette || []).forEach(n => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sw';
    b.setAttribute('role', 'radio'); b.setAttribute('aria-label', n);
    b.style.background = COLORS[n]; b.dataset.c = COLORS[n];
    b.setAttribute('aria-checked', COLORS[n] === color);
    b.addEventListener('click', () => { color = COLORS[n]; markSel(pal, b); });
    pal.appendChild(b);
  });
  sz.hidden = l.sizes.length < 2;
  l.sizes.forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sz';
    b.setAttribute('role', 'radio');
    b.innerHTML = `<b style="width:${Math.min(SIZES[k].w, 34) + 4}px;height:${Math.min(SIZES[k].w, 34) + 4}px"></b>${SIZES[k].n}`;
    b.setAttribute('aria-checked', k === sizeKey);
    b.addEventListener('click', () => { sizeKey = k; markSel(sz, b); });
    sz.appendChild(b);
  });
}
function markSel(group, btn) {
  group.querySelectorAll('[role=radio]').forEach(x => x.setAttribute('aria-checked', x === btn));
}

function buildChips() {
  const ul = $('chips'); ul.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li'); li.id = 'chip' + i;
    li.innerHTML = (t.color ? `<i style="background:${COLORS[t.color]}"></i>` : '') + t.label;
    ul.appendChild(li);
  });
}

/* ---------- Lukisan ---------- */
function render() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  tasks.forEach(t => { if (t.type === 'fill') { ctx.fillStyle = '#EEF1F6'; ctx.fill(t.path); } });
  ctx.drawImage(paint, 0, 0);
  ctx.lineJoin = ctx.lineCap = 'round';
  tasks.forEach(t => {
    if (t.type === 'fill') {
      ctx.setLineDash([]); ctx.lineWidth = 5; ctx.strokeStyle = '#1F2A44'; ctx.stroke(t.path);
    } else if (t.type === 'trace') {
      ctx.beginPath(); t.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.setLineDash([2, 14]); ctx.lineWidth = 6; ctx.strokeStyle = '#7B8499'; ctx.stroke(); ctx.setLineDash([]);
    }
  });
  tasks.forEach(t => {
    if (t.type !== 'trace') return;
    const s = t.pts[0], e = t.pts[t.pts.length - 1];
    ctx.beginPath(); ctx.arc(s[0], s[1], 13, 0, 7); ctx.fillStyle = '#1FA971'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#1F2A44'; ctx.stroke();
    ctx.font = '34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1F2A44'; ctx.fillText('★', e[0], e[1]);
  });
}

function pos(ev) {
  const r = canvas.getBoundingClientRect();
  return [(ev.clientX - r.left) * W / r.width, (ev.clientY - r.top) * H / r.height];
}
function stroke(a, b) {
  pctx.save();
  if (clipPath) pctx.clip(clipPath);
  pctx.lineCap = pctx.lineJoin = 'round';
  pctx.strokeStyle = color; pctx.lineWidth = cur.l.width || SIZES[sizeKey].w;
  pctx.beginPath(); pctx.moveTo(a[0], a[1]); pctx.lineTo(b[0] + 0.01, b[1]); pctx.stroke();
  pctx.restore();
}

canvas.addEventListener('pointerdown', ev => {
  if (!cur || finished) return;
  const p = pos(ev);
  // semak berus yang sesuai
  const need = tasks.find(t => t.brush && ctx.isPointInPath(t.path, p[0], p[1]));
  if (need && need.brush !== sizeKey) {
    say(`Guna berus ${SIZES[need.brush].n.toLowerCase()} untuk "${need.label.split(' (')[0]}".`);
    return;
  }
  canvas.setPointerCapture(ev.pointerId);
  drawing = true; last = p; say('');
  stroke(p, p); render();
});
canvas.addEventListener('pointermove', ev => {
  if (!drawing) return;
  const evs = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev];
  (evs.length ? evs : [ev]).forEach(e => {
    const p = pos(e); strokeLen += Math.hypot(p[0] - last[0], p[1] - last[1]);
    stroke(last, p); last = p;
  });
  render();
  if (performance.now() - lastEval > 400) evaluate();
});
['pointerup', 'pointercancel'].forEach(t => canvas.addEventListener(t, () => {
  if (!drawing) return; drawing = false; evaluate(true);
}));

/* ---------- Penilaian ---------- */
function evaluate(end) {
  lastEval = performance.now();
  const d = pctx.getImageData(0, 0, W, H).data;
  tasks.forEach(t => {
    if (t.type === 'free') { t.pct = Math.min(1, strokeLen / t.goal); t.ok = t.pct >= 1; return; }
    let hit = 0, any = 0;
    for (const [x, y] of t.samples) {
      const i = ((Math.round(y) * W) + Math.round(x)) * 4;
      if (d[i + 3] > 128) {
        any++;
        if (!t.rgb || Math.hypot(d[i] - t.rgb[0], d[i + 1] - t.rgb[1], d[i + 2] - t.rgb[2]) < 40) hit++;
      }
    }
    const n = t.samples.length || 1;
    t.pct = hit / n; t.any = any / n;
    t.ok = t.pct >= (t.type === 'trace' ? 0.85 : 0.75);
  });
  tasks.forEach((t, i) => $('chip' + i).classList.toggle('ok', t.ok));
  updateMeter();

  if (end) {
    const wrong = tasks.find(t => t.color && !t.ok && t.any > 0.5 && t.pct < 0.4);
    if (wrong) say(`Warna itu bukan untuk "${wrong.label}". Cari warna ${wrong.color}.`);
  }
  if (tasks.every(t => t.ok) && !finished) win();
}

function updateMeter() {
  const v = tasks.length ? tasks.reduce((s, t) => s + Math.min(1, t.pct / (t.type === 'trace' ? .85 : t.type === 'free' ? 1 : .75)), 0) / tasks.length : 0;
  const pc = Math.round(Math.min(1, v) * 100);
  $('meterFill').style.width = pc + '%'; $('meterTxt').textContent = pc + '%';
}

function say(m) { $('hint').textContent = m; }

function win() {
  finished = true;
  const s = store.get(); s[`${cur.a.id}-${cur.li}`] = 1; store.set(s);
  const lastLevel = cur.li === cur.a.levels.length - 1;
  $('winTxt').textContent = lastLevel ? 'Kamu telah siap semua level aktiviti ini. Syabas!' : 'Kamu berjaya. Mari cuba level seterusnya!';
  $('winNext').textContent = lastLevel ? 'Kembali ke menu' : 'Level 2';
  speak('Hebat! Kamu berjaya!');
  setTimeout(() => $('win').showModal(), 450);
}

/* ---------- Suara ---------- */
function speak(txt) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt); u.lang = 'ms-MY'; u.rate = 0.85;
  speechSynthesis.speak(u);
}

/* ---------- Butang ---------- */
$('btnBack').addEventListener('click', () => { $('play').hidden = true; $('menu').hidden = false; buildMenu(); });
$('btnSpeak').addEventListener('click', () => speak(cur.l.text));
$('btnClear').addEventListener('click', () => {
  pctx.clearRect(0, 0, W, H); strokeLen = 0; finished = false; say(''); evaluate(); render();
});
$('btnInfo').addEventListener('click', () => $('info').showModal());
$('infoClose').addEventListener('click', () => $('info').close());
$('winAgain').addEventListener('click', () => { $('win').close(); start(cur.ai, cur.li); });
$('winNext').addEventListener('click', () => {
  $('win').close();
  if (cur.li < cur.a.levels.length - 1) start(cur.ai, cur.li + 1); else $('btnBack').click();
});

buildMenu();
