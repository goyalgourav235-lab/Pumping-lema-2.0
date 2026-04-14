// ─── Uses globals from CDN: gsap ────────────────────

// ─── CURSOR ─────────────────────────────────────────
const cursor = document.getElementById('cursor');
if (cursor && typeof gsap !== 'undefined') {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    document.addEventListener('mousemove', e => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'none' });
    });
    document.querySelectorAll('a, button, select').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
}

// ─── BG CANVAS ───────────────────────────────────────
const bgCanvas = document.getElementById('cfl-bg-canvas');
if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    const resize = () => {
        bgCanvas.width = bgCanvas.parentElement.clientWidth;
        bgCanvas.height = bgCanvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 70;
    const pts = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.3,
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
            const rnd = Math.random();
            ctx.fillStyle = rnd > 0.97 ? '#a78bfa' : rnd > 0.94 ? '#22d3ee' : '#ffffff';
            ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
        });
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < 100) {
                    ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `rgba(167,139,250,${0.05 * (1 - d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateBG);
    };
    animateBG();
}

// ─── PARSE TREE CANVAS ──────────────────────────────
const treeCanvas = document.getElementById('cfl-tree-canvas');
let treeCtx = null;
if (treeCanvas) {
    treeCtx = treeCanvas.getContext('2d');
    const resizeTree = () => {
        const wrap = document.getElementById('cfl-tree-wrap');
        if (!wrap) return;
        treeCanvas.width = wrap.clientWidth * window.devicePixelRatio;
        treeCanvas.height = wrap.clientHeight * window.devicePixelRatio;
        treeCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resizeTree();
    window.addEventListener('resize', resizeTree);
}

function drawTree(parts, isStable) {
    if (!treeCtx) return;
    const w = treeCanvas.width / window.devicePixelRatio;
    const h = treeCanvas.height / window.devicePixelRatio;
    treeCtx.clearRect(0, 0, w, h);
    const cx = w / 2, topY = 20, midY = 70, botY = 140;
    const colors = { u: '#64b5f6', v: '#a78bfa', x: '#22d3ee', y: '#f472b6', z: '#ff7043' };

    drawNode(treeCtx, cx, topY, 'S', isStable ? '#a78bfa' : '#f472b6');
    const leftX = cx - w * 0.28, rightX = cx + w * 0.28;

    drawEdge(treeCtx, cx, topY + 10, leftX, midY - 10, 'rgba(167,139,250,0.4)');
    drawEdge(treeCtx, cx, topY + 10, cx, midY - 10, 'rgba(34,211,238,0.3)');
    drawEdge(treeCtx, cx, topY + 10, rightX, midY - 10, 'rgba(244,114,182,0.4)');

    drawNode(treeCtx, leftX, midY, 'A', 'rgba(167,139,250,0.6)');
    drawNode(treeCtx, cx, midY, 'A', 'rgba(34,211,238,0.6)');
    drawNode(treeCtx, rightX, midY, 'A', 'rgba(244,114,182,0.6)');

    const segments = [
        { label: 'u', x: leftX - w*0.1, color: colors.u, from: leftX },
        { label: 'v', x: leftX + w*0.05, color: colors.v, from: leftX },
        { label: 'x', x: cx, color: colors.x, from: cx },
        { label: 'y', x: rightX - w*0.05, color: colors.y, from: rightX },
        { label: 'z', x: rightX + w*0.1, color: colors.z, from: rightX },
    ];

    segments.forEach(seg => {
        drawEdge(treeCtx, seg.from, midY + 10, seg.x, botY - 10, seg.color + '60');
        const val = parts[seg.label] || '';
        drawNode(treeCtx, seg.x, botY, val || 'ε', seg.color, (seg.label === 'v' || seg.label === 'y') && val.length > 0);
    });

    if (!isStable) {
        treeCtx.save();
        treeCtx.font = '10px "Space Mono", monospace';
        treeCtx.fillStyle = '#f472b6'; treeCtx.globalAlpha = 0.7;
        treeCtx.fillText('↻ pump', leftX + w*0.05 - 15, botY + 24);
        treeCtx.fillText('↻ pump', rightX - w*0.05 - 15, botY + 24);
        treeCtx.restore();
    }
}

function drawNode(c, x, y, text, color, glow) {
    c.save();
    if (glow) { c.shadowColor = color; c.shadowBlur = 12; }
    
    c.font = '11px "Space Mono", monospace'; 
    c.textAlign = 'center'; 
    c.textBaseline = 'middle';
    
    const display = text.length > 6 ? text.slice(0, 5) + '…' : text;
    const padding = 12;
    const textWidth = c.measureText(display).width;
    const width = Math.max(28, textWidth + padding);
    const height = 28;
    const r = 14;

    c.beginPath();
    c.moveTo(x - width/2 + r, y - height/2);
    c.lineTo(x + width/2 - r, y - height/2);
    c.quadraticCurveTo(x + width/2, y - height/2, x + width/2, y - height/2 + r);
    c.lineTo(x + width/2, y + height/2 - r);
    c.quadraticCurveTo(x + width/2, y + height/2, x + width/2 - r, y + height/2);
    c.lineTo(x - width/2 + r, y + height/2);
    c.quadraticCurveTo(x - width/2, y + height/2, x - width/2, y + height/2 - r);
    c.lineTo(x - width/2, y - height/2 + r);
    c.quadraticCurveTo(x - width/2, y - height/2, x - width/2 + r, y - height/2);
    c.closePath();

    c.fillStyle = 'rgba(17,17,17,0.9)'; c.fill();
    c.strokeStyle = color; c.lineWidth = 1.5; c.stroke();
    
    c.fillStyle = color;
    c.fillText(display, x, y); 
    c.restore();
}

function drawEdge(c, x1, y1, x2, y2, color) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = color; c.lineWidth = 1; c.stroke();
}

// ─── CFL SIMULATION LOGIC ────────────────────────────
// FIXED decompositions: at n=1, each produces a valid string in the language.
// Pumping (n≠1) then breaks the balance, proving non-context-free.
const LANGUAGES = {
    anbncn: {
        title: 'Parse Tree Resonance Field',
        desc: 'L₁: Equal counts of a, b, and c in sequence. String: aⁿbⁿcⁿ',
        genString: function(p) {
            // s = a^p b^p c^p. Decompose so vxy is within a's and b's boundary.
            // u = a^(p-1), v = a, x = (empty), y = b, z = b^(p-1) c^p
            // At n=1: a^(p-1) + a + '' + b + b^(p-1) c^p = a^p b^p c^p ✓
            // At n=2: a^(p-1) + aa + '' + bb + b^(p-1) c^p = a^(p+1) b^(p+1) c^p ✗
            return {
                u: 'a'.repeat(p - 1),
                v: 'a',
                x: '',
                y: 'b',
                z: 'b'.repeat(p - 1) + 'c'.repeat(p)
            };
        },
        check: function(str) {
            const a = (str.match(/a/g) || []).length;
            const b = (str.match(/b/g) || []).length;
            const c = (str.match(/c/g) || []).length;
            return a === b && b === c && a > 0;
        },
    },
    ww: {
        title: 'Mirror Symmetry Breach',
        desc: 'L₂: The string w repeated exactly. String: ww where w ∈ {a,b}*',
        genString: function(p) {
            // s = a^p b a^p b. Let w = a^p b, so s = ww.
            // u = a^(p-1), v = a, x = b, y = a, z = a^(p-2) b  (note: adjusted for p≥2)
            // At n=1: a^(p-1) + a + b + a + a^(p-2) b = a^p b a^(p-1) b... 
            // Actually simpler: s = a^p a^p = a^(2p)
            // u = a^(p-1), v = a, x = '', y = a, z = a^(2p-p-1) = a^(p-1)
            // At n=1: a^(p-1) + a + '' + a + a^(p-1) = a^(2p) ✓ (w=a^p, ww=a^(2p))
            // At n=2: a^(p-1) + aa + '' + aa + a^(p-1) = a^(2p+2) ✗ (length is 2p+2, odd half = p+1 ≠ original w)
            var total = 2 * p;
            return {
                u: 'a'.repeat(p - 1),
                v: 'a',
                x: '',
                y: 'a',
                z: 'a'.repeat(p - 1)
            };
        },
        check: function(str) {
            if (str.length === 0 || str.length % 2 !== 0) return false;
            var mid = str.length / 2;
            return str.slice(0, mid) === str.slice(mid);
        },
    },
    anbncndn: {
        title: 'Quad Frequency Lock',
        desc: 'L₃: Four-way balance — equal a, b, c, d. String: aⁿbⁿcⁿdⁿ',
        genString: function(p) {
            // s = a^p b^p c^p d^p
            // u = a^(p-1), v = a, x = '', y = b, z = b^(p-1) c^p d^p
            return {
                u: 'a'.repeat(p - 1),
                v: 'a',
                x: '',
                y: 'b',
                z: 'b'.repeat(p - 1) + 'c'.repeat(p) + 'd'.repeat(p)
            };
        },
        check: function(str) {
            var a = (str.match(/a/g) || []).length;
            var b = (str.match(/b/g) || []).length;
            var c = (str.match(/c/g) || []).length;
            var d = (str.match(/d/g) || []).length;
            return a === b && b === c && c === d && a > 0;
        },
    },
    a2n: {
        title: 'Perfect Square Disruption',
        desc: "L₄: String of a's with perfect square length. String: a^(n²)",
        genString: function(p) {
            // s = a^(p²). Choose v=a, y=a within the first p characters.
            // u = a^(p-2), v = a, x = '', y = a, z = a^(p²-p)
            var totalLen = p * p;
            return {
                u: 'a'.repeat(Math.max(0, p - 2)),
                v: 'a',
                x: '',
                y: 'a',
                z: 'a'.repeat(totalLen - p)
            };
        },
        check: function(str) {
            var len = str.length;
            if (len === 0) return false;
            var s = Math.sqrt(len);
            return s === Math.floor(s);
        },
    },
};

var state = { lang: 'anbncn', p: 3, n: 1 };

var $langSelect  = document.getElementById('cfl-lang-select');
var $rangeP      = document.getElementById('cfl-range-p');
var $valP        = document.getElementById('cfl-val-p');
var $valN        = document.getElementById('cfl-val-n');
var $nGhost      = document.getElementById('cfl-n-ghost');
var $btnUp       = document.getElementById('cfl-btn-up');
var $btnDn       = document.getElementById('cfl-btn-dn');
var $partU       = document.getElementById('cfl-part-u');
var $partV       = document.getElementById('cfl-part-v');
var $partX       = document.getElementById('cfl-part-x');
var $partY       = document.getElementById('cfl-part-y');
var $partZ       = document.getElementById('cfl-part-z');
var $wrap        = document.getElementById('cfl-string-wrap');
var $statusTitle = document.getElementById('cfl-status-title');
var $statusDtl   = document.getElementById('cfl-status-detail');
var $langTitle   = document.getElementById('cfl-lang-title');
var $langDesc    = document.getElementById('cfl-lang-desc');

function render() {
    var L = LANGUAGES[state.lang];
    var parts = L.genString(state.p);
    var u = parts.u, v = parts.v, x = parts.x, y = parts.y, z = parts.z;

    // Build pumped string: u + v^n + x + y^n + z
    var pumpedV = '', pumpedY = '';
    for (var i = 0; i < state.n; i++) { pumpedV += v; pumpedY += y; }
    var fullString = u + pumpedV + x + pumpedY + z;

    // Update UI text
    $valP.textContent = state.p;
    $valN.textContent = state.n;
    $nGhost.textContent = state.n;
    $partU.textContent = u || 'ε';
    $partV.textContent = (pumpedV || 'ε') + ' (×' + state.n + ')';
    $partX.textContent = x || 'ε';
    $partY.textContent = (pumpedY || 'ε') + ' (×' + state.n + ')';
    $partZ.textContent = z || 'ε';
    $langTitle.textContent = L.title;
    $langDesc.textContent = L.desc;

    // Build token elements
    $wrap.innerHTML = '';
    var frag = document.createDocumentFragment();

    function addTokens(str, pumpClass) {
        for (var i = 0; i < str.length; i++) {
            var t = document.createElement('div');
            t.className = 'token ' + str[i] + (pumpClass ? ' ' + pumpClass : '');
            t.textContent = str[i];
            frag.appendChild(t);
        }
    }

    addTokens(u, '');
    addTokens(pumpedV, state.n !== 1 ? 'v-pump' : '');
    addTokens(x, '');
    addTokens(pumpedY, state.n !== 1 ? 'y-pump' : '');
    addTokens(z, '');
    $wrap.appendChild(frag);

    // Animate tokens
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.cfl-string-wrap .token', { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, stagger: 0.015, ease: 'back.out(2)' });
    }

    // Check if string is in the language
    var stable = L.check(fullString);

    $statusTitle.className = 'status-indicator ' + (stable ? 'stable' : 'unstable');
    $statusTitle.textContent = stable ? 'PARSE TREE: STABLE' : 'PARSE TREE: COLLAPSED!';

    var displayStr = fullString.length > 30 ? fullString.slice(0, 30) + '…' : fullString;
    $statusDtl.textContent = stable
        ? 'String "' + displayStr + '" (length ' + fullString.length + ') satisfies the language rule. Accepted.'
        : 'Pumped string "' + displayStr + '" (length ' + fullString.length + ') violates the language rule. NOT context-free.';

    // Draw parse tree
    drawTree({ u: u, v: pumpedV, x: x, y: pumpedY, z: z }, stable);

    // Stage glow on unstable
    if (typeof gsap !== 'undefined') {
        var stage = document.querySelector('.cfl-stage');
        if (!stable) {
            gsap.fromTo(stage, { outlineColor: 'rgba(244,114,182,0)' },
                { outlineColor: 'rgba(244,114,182,0.4)', outlineWidth: '2px', outlineStyle: 'solid',
                  duration: 0.2, yoyo: true, repeat: 3 });
        } else {
            stage.style.outline = 'none';
        }
    }
}

$langSelect.addEventListener('change', function(e) { state.lang = e.target.value; state.n = 1; render(); });
$rangeP.addEventListener('input', function(e) { state.p = +e.target.value; state.n = 1; render(); });
$btnUp.addEventListener('click', function() { state.n++; render(); });
$btnDn.addEventListener('click', function() { if (state.n > 0) { state.n--; render(); } });

render();
