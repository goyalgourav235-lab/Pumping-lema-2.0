// ─── Uses globals from CDN: gsap ────────────────────

// ─── CURSOR ─────────────────────────────────────────
const cursor = document.getElementById('cursor');
gsap.set(cursor, { xPercent: -50, yPercent: -50 });
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'none' });
});
document.querySelectorAll('a, button, select').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

// ─── BG CANVAS ───────────────────────────────────────
const bgCanvas = document.getElementById('sim-bg-canvas');
const ctx = bgCanvas.getContext('2d');
const resize = () => {
    bgCanvas.width = bgCanvas.parentElement.clientWidth;
    bgCanvas.height = bgCanvas.parentElement.clientHeight;
};
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 60;
const pts = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.2 + 0.3,
    life: Math.random(),
}));

const animateBG = () => {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.97 ? '#c8f23a' : '#ffffff';
        ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
    });
    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 100) {
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = `rgba(200,242,58,${0.05 * (1 - d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateBG);
};
animateBG();

// ─── SIMULATION LOGIC ────────────────────────────────
const LANGUAGES = {
    balanced: {
        title: 'Antigravity Frequency Field',
        desc: 'L₁: For every Power pulse (P) there must be exactly one Drop pulse (D). String: Pⁿ Dⁿ',
        genString: p => ({ x: 'P'.repeat(Math.ceil(p/2)), y: 'P'.repeat(Math.floor(p/2)), z: 'D'.repeat(p) }),
        dCount: p => p,
        check: (totalP, totalD) => totalP === totalD,
    },
    double: {
        title: 'Double-Drop Resonance',
        desc: 'L₂: Every Power pulse (P) needs exactly TWO Drop pulses (D). String: Pⁿ D²ⁿ',
        genString: p => ({ x: 'P'.repeat(Math.ceil(p/2)), y: 'P'.repeat(Math.floor(p/2)), z: 'D'.repeat(p * 2) }),
        dCount: p => p * 2,
        check: (totalP, totalD) => totalD === totalP * 2,
    },
    triple: {
        title: 'Double-Power Surge',
        desc: 'L₃: Two Power pulses (P) for every Drop (D). String: P²ⁿ Dⁿ',
        genString: p => ({ x: 'P'.repeat(p), y: 'P'.repeat(Math.max(1, Math.floor(p/2))), z: 'D'.repeat(p) }),
        dCount: p => p,
        check: (totalP, totalD) => totalP === totalD * 2,
    },
};

let state = { lang: 'balanced', p: 4, n: 1 };

const $langSelect  = document.getElementById('lang-select');
const $rangeP      = document.getElementById('range-p');
const $valP        = document.getElementById('val-p');
const $valN        = document.getElementById('val-n');
const $nGhost      = document.getElementById('n-ghost');
const $btnUp       = document.getElementById('btn-up');
const $btnDn       = document.getElementById('btn-dn');
const $partX       = document.getElementById('part-x');
const $partY       = document.getElementById('part-y');
const $partZ       = document.getElementById('part-z');
const $wrap        = document.getElementById('string-wrap');
const $statusTitle = document.getElementById('status-title');
const $statusDtl   = document.getElementById('status-detail');
const $langTitle   = document.getElementById('lang-title');
const $langDesc    = document.getElementById('lang-desc');

function render() {
    const L = LANGUAGES[state.lang];
    const { x, y, z } = L.genString(state.p);
    const totalP = x.length + y.length * state.n;
    const totalD = L.dCount(state.p);

    $valP.textContent = state.p; $valN.textContent = state.n; $nGhost.textContent = state.n;
    $partX.textContent = x || '(empty)';
    $partY.textContent = y.repeat(state.n) + ` (×${state.n})`;
    $partZ.textContent = z;
    $langTitle.textContent = L.title; $langDesc.textContent = L.desc;

    $wrap.innerHTML = '';
    const frag = document.createDocumentFragment();

    const addTokens = (str, isY = false, pumpIdx = 0) => {
        for (let i = 0; i < str.length; i++) {
            const t = document.createElement('div');
            t.className = `token ${str[i]}` + (isY ? ' y-pump' : '');
            t.textContent = str[i];
            if (isY) t.style.animationDelay = `${(pumpIdx * y.length + i) * 0.04}s`;
            frag.appendChild(t);
        }
    };

    addTokens(x); for (let pump = 0; pump < state.n; pump++) addTokens(y, true, pump); addTokens(z);
    $wrap.appendChild(frag);

    gsap.fromTo('.token', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.02, ease: 'back.out(2)' });

    const stable = L.check(totalP, totalD);
    $statusTitle.className = `status-indicator ${stable ? 'stable' : 'unstable'}`;
    $statusTitle.textContent = stable ? 'GRAVITY FIELD: STABLE' : 'GRAVITY FIELD: UNSTABLE!';
    $statusDtl.textContent = stable
        ? `P Count (${totalP}) and D Count (${totalD}) satisfy the language rule. Accepted.`
        : `P Count (${totalP}) vs D Count (${totalD}) — rule violated. The pumped string is NOT in the language. Non-regular proven.`;

    const stage = document.querySelector('.sim-stage');
    if (!stable) {
        gsap.fromTo(stage, { outlineColor: 'rgba(255,61,61,0)' },
            { outlineColor: 'rgba(255,61,61,0.4)', outlineWidth: '2px', outlineStyle: 'solid', duration: 0.2, yoyo: true, repeat: 3 });
    } else { stage.style.outline = 'none'; }
}

$langSelect.addEventListener('change', e => { state.lang = e.target.value; state.n = 1; render(); });
$rangeP.addEventListener('input', e => { state.p = +e.target.value; state.n = 1; render(); });
$btnUp.addEventListener('click', () => { state.n++; render(); });
$btnDn.addEventListener('click', () => { if (state.n > 0) { state.n--; render(); } });

render();
