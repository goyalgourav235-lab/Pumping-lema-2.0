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
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 100) {
                    ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `rgba(167,139,250,${0.05 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
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
        { label: 'u', x: leftX - w * 0.1, color: colors.u, from: leftX },
        { label: 'v', x: leftX + w * 0.05, color: colors.v, from: leftX },
        { label: 'x', x: cx, color: colors.x, from: cx },
        { label: 'y', x: rightX - w * 0.05, color: colors.y, from: rightX },
        { label: 'z', x: rightX + w * 0.1, color: colors.z, from: rightX },
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
        treeCtx.fillText('↻ pump', leftX + w * 0.05 - 15, botY + 24);
        treeCtx.fillText('↻ pump', rightX - w * 0.05 - 15, botY + 24);
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
    c.moveTo(x - width / 2 + r, y - height / 2);
    c.lineTo(x + width / 2 - r, y - height / 2);
    c.quadraticCurveTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + r);
    c.lineTo(x + width / 2, y + height / 2 - r);
    c.quadraticCurveTo(x + width / 2, y + height / 2, x + width / 2 - r, y + height / 2);
    c.lineTo(x - width / 2 + r, y + height / 2);
    c.quadraticCurveTo(x - width / 2, y + height / 2, x - width / 2, y + height / 2 - r);
    c.lineTo(x - width / 2, y - height / 2 + r);
    c.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + r, y - height / 2);
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

// ─── SUPERSCRIPT HELPER ──────────────────────────────
function toSuperscript(n) {
    var sup = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
    if (n < 10) return sup[n];
    return String(n).split('').map(function(d) { return sup[+d]; }).join('');
}

// ─── ANIMATED COUNTER ────────────────────────────────
function animateValue(el, from, to, duration) {
    if (!el) return;
    duration = duration || 400;
    if (from === to) { el.textContent = to; return; }
    var start = performance.now();
    var tick = function(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (to - from) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// ─── CFL SIMULATION LOGIC ────────────────────────────
const LANGUAGES = {
    anbncn: {
        title: 'Triple Balance Language',
        desc: 'L₁ = { aⁿbⁿcⁿ | n ≥ 1 } — Equal counts of a, b, and c in sequence.',
        ruleDesc: 'Count(a) = Count(b) = Count(c)',
        genString: function(p) {
            return {
                u: 'a'.repeat(p - 1),
                v: 'a',
                x: '',
                y: 'b',
                z: 'b'.repeat(p - 1) + 'c'.repeat(p)
            };
        },
        check: function(str) {
            var a = (str.match(/a/g) || []).length;
            var b = (str.match(/b/g) || []).length;
            var c = (str.match(/c/g) || []).length;
            return a === b && b === c && a > 0;
        },
        analytics: function(str) {
            return [
                { label: 'a COUNT', value: (str.match(/a/g) || []).length },
                { label: 'b COUNT', value: (str.match(/b/g) || []).length },
                { label: 'c COUNT', value: (str.match(/c/g) || []).length },
                { label: 'LENGTH', value: str.length },
            ];
        },
    },
    ww: {
        title: 'Exact Copy Language',
        desc: 'L₂ = { ww | w ∈ {a,b}* } — The string w repeated exactly.',
        ruleDesc: 'First half = Second half',
        genString: function(p) {
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
        analytics: function(str) {
            var mid = Math.floor(str.length / 2);
            return [
                { label: '1ST HALF LEN', value: mid },
                { label: '2ND HALF LEN', value: str.length - mid },
                { label: 'HALVES MATCH', value: str.slice(0, mid) === str.slice(mid) ? '✓' : '✗', isText: true },
                { label: 'TOTAL LENGTH', value: str.length },
            ];
        },
    },
    anbncndn: {
        title: 'Quad Balance Language',
        desc: 'L₃ = { aⁿbⁿcⁿdⁿ | n ≥ 1 } — Four-way balance.',
        ruleDesc: 'Count(a) = Count(b) = Count(c) = Count(d)',
        genString: function(p) {
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
        analytics: function(str) {
            return [
                { label: 'a COUNT', value: (str.match(/a/g) || []).length },
                { label: 'b COUNT', value: (str.match(/b/g) || []).length },
                { label: 'c COUNT', value: (str.match(/c/g) || []).length },
                { label: 'd COUNT', value: (str.match(/d/g) || []).length },
            ];
        },
    },
    a2n: {
        title: 'Perfect Square Language',
        desc: "L₄ = { a^(n²) | n ≥ 1 } — String of a's with perfect square length.",
        ruleDesc: 'Length is a perfect square',
        genString: function(p) {
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
        analytics: function(str) {
            var len = str.length;
            var sq = Math.sqrt(len);
            var nearestSq = Math.round(sq);
            return [
                { label: 'LENGTH', value: len },
                { label: '√LENGTH', value: sq.toFixed(2), isText: true },
                { label: 'PERFECT □?', value: sq === Math.floor(sq) ? '✓ YES' : '✗ NO', isText: true },
                { label: 'NEAREST □', value: nearestSq * nearestSq },
            ];
        },
    },
};

var state = { lang: 'anbncn', p: 3, n: 1 };
var prevStats = [0, 0, 0, 0];

var $langSelect    = document.getElementById('cfl-lang-select');
var $rangeP        = document.getElementById('cfl-range-p');
var $valP          = document.getElementById('cfl-val-p');
var $valN          = document.getElementById('cfl-val-n');
var $nGhost        = document.getElementById('cfl-n-ghost');
var $btnUp         = document.getElementById('cfl-btn-up');
var $btnDn         = document.getElementById('cfl-btn-dn');
var $partU         = document.getElementById('cfl-part-u');
var $partV         = document.getElementById('cfl-part-v');
var $partX         = document.getElementById('cfl-part-x');
var $partY         = document.getElementById('cfl-part-y');
var $partZ         = document.getElementById('cfl-part-z');
var $wrap          = document.getElementById('cfl-string-wrap');
var $statusTitle   = document.getElementById('cfl-status-title');
var $statusDtl     = document.getElementById('cfl-status-detail');
var $statusFormula = document.getElementById('cfl-status-formula');
var $langTitle     = document.getElementById('cfl-lang-title');
var $langDesc      = document.getElementById('cfl-lang-desc');
var $formulaExpr   = document.getElementById('cfl-formula-expr');
var $insightText   = document.getElementById('cfl-insight-text');
var $insightCard   = document.getElementById('cfl-insight-card');
var $vxyVal        = document.getElementById('cfl-vxy-val');
var $vxyP          = document.getElementById('cfl-vxy-p');
var $vyVal         = document.getElementById('cfl-vy-val');
var $constraintVXY = document.getElementById('cfl-constraint-vxy');
var $constraintVY  = document.getElementById('cfl-constraint-vy');

// Analytics cells
var $statLabels = [
    document.getElementById('cfl-stat-1-label'),
    document.getElementById('cfl-stat-2-label'),
    document.getElementById('cfl-stat-3-label'),
    document.getElementById('cfl-stat-4-label'),
];
var $statValues = [
    document.getElementById('cfl-stat-1-value'),
    document.getElementById('cfl-stat-2-value'),
    document.getElementById('cfl-stat-3-value'),
    document.getElementById('cfl-stat-4-value'),
];

function render() {
    var L = LANGUAGES[state.lang];
    var parts = L.genString(state.p);
    var u = parts.u, v = parts.v, x = parts.x, y = parts.y, z = parts.z;

    // Build pumped string: u + v^n + x + y^n + z
    var pumpedV = '', pumpedY = '';
    for (var i = 0; i < state.n; i++) { pumpedV += v; pumpedY += y; }
    var fullString = u + pumpedV + x + pumpedY + z;

    // ─── Update Controls ─────────────────────────────
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

    // ─── Formula Bar ─────────────────────────────────
    var displayStr = fullString.length > 30 ? fullString.slice(0, 27) + '…' : fullString;
    $formulaExpr.innerHTML =
        's = u · v<sup>' + state.n + '</sup> · x · y<sup>' + state.n + '</sup> · z  =  ' +
        '<span class="formula-result">"' + displayStr + '"</span>' +
        '  <span class="formula-len">(length ' + fullString.length + ')</span>';

    // ─── Analytics Strip ─────────────────────────────
    var stats = L.analytics(fullString);
    for (var j = 0; j < 4; j++) {
        $statLabels[j].textContent = stats[j].label;
        var newVal = stats[j].value;
        var isNum = typeof newVal === 'number' && Number.isInteger(newVal) && !stats[j].isText;
        if (isNum) {
            animateValue($statValues[j], prevStats[j] || 0, newVal);
        } else {
            $statValues[j].textContent = newVal;
        }
        prevStats[j] = isNum ? newVal : 0;
    }

    // ─── Constraint Checker ──────────────────────────
    var vxyLen = v.length + x.length + y.length;
    var vyLen = v.length + y.length;
    $vxyVal.textContent = vxyLen;
    $vxyP.textContent = state.p;
    $vyVal.textContent = vyLen;

    var vxyOk = vxyLen <= state.p;
    var vyOk = vyLen > 0;
    $constraintVXY.querySelector('.constraint-check').textContent = vxyOk ? '✓' : '✗';
    $constraintVXY.className = 'constraint-item ' + (vxyOk ? 'constraint-pass' : 'constraint-fail');
    $constraintVY.querySelector('.constraint-check').textContent = vyOk ? '✓' : '✗';
    $constraintVY.className = 'constraint-item ' + (vyOk ? 'constraint-pass' : 'constraint-fail');

    // ─── Build Token Visualization ───────────────────
    $wrap.innerHTML = '';
    var frag = document.createDocumentFragment();

    function addTokens(str, pumpClass) {
        for (var k = 0; k < str.length; k++) {
            var t = document.createElement('div');
            t.className = 'token ' + str[k] + (pumpClass ? ' ' + pumpClass : '');
            t.textContent = str[k];
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

    // ─── Check Language Membership ───────────────────
    var stable = L.check(fullString);

    $statusTitle.className = 'status-indicator ' + (stable ? 'stable' : 'unstable');
    $statusTitle.textContent = stable ? 'LANGUAGE TEST: ACCEPTED ✓' : 'LANGUAGE TEST: REJECTED ✗';

    var nSup = toSuperscript(state.n);
    if (stable) {
        $statusDtl.textContent = L.ruleDesc + ' satisfied. String "' + displayStr + '" (length ' + fullString.length + ') is in L.';
    } else {
        $statusDtl.textContent = L.ruleDesc + ' violated. Pumped string "' + displayStr + '" (length ' + fullString.length + ') is NOT in L.';
    }

    $statusFormula.innerHTML = stable
        ? '<span class="sf-accepted">uv<sup>' + state.n + '</sup>xy<sup>' + state.n + '</sup>z ∈ L</span>'
        : '<span class="sf-rejected">uv<sup>' + state.n + '</sup>xy<sup>' + state.n + '</sup>z ∉ L — <em>Contradiction! L is not context-free.</em></span>';

    // ─── Parse Tree ──────────────────────────────────
    drawTree({ u: u, v: pumpedV, x: x, y: pumpedY, z: z }, stable);

    // ─── Insight Card ────────────────────────────────
    generateCFLInsight(state.n, stable, fullString, L);

    // ─── Stage flash ─────────────────────────────────
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

function generateCFLInsight(n, stable, fullString, L) {
    var text = '';
    if (n === 0) {
        text = 'With n=0, both v and y are deleted. The string becomes uxz — both pumpable segments are removed. If this violates the language rule, even deflation breaks L.';
    } else if (n === 1) {
        text = 'At n=1, the string is in its original form — both v and y appear once. This is the baseline. Pump (n≥2) or deflate (n=0) to test the CFL Pumping Lemma.';
    } else if (stable) {
        text = 'After ' + n + ' pumps, the string still satisfies the rule. The CFL Pumping Lemma requires ALL pump counts to work — keep testing different values of n.';
    } else {
        text = 'Pumping v and y ' + n + ' times broke the language rule (' + L.ruleDesc + '). Since |vxy| ≤ p, the pumps can only affect a limited region — creating an imbalance that proves L is not context-free.';
    }
    $insightText.textContent = text;
    if (typeof gsap !== 'undefined') {
        gsap.fromTo($insightCard, { borderColor: stable ? 'rgba(167,139,250,0.1)' : 'rgba(244,114,182,0.1)' },
            { borderColor: stable ? 'rgba(167,139,250,0.4)' : 'rgba(244,114,182,0.4)', duration: 0.3, yoyo: true, repeat: 1 });
    }
}

$langSelect.addEventListener('change', function(e) { state.lang = e.target.value; state.n = 1; prevStats = [0, 0, 0, 0]; render(); });
$rangeP.addEventListener('input', function(e) { state.p = +e.target.value; state.n = 1; prevStats = [0, 0, 0, 0]; render(); });
$btnUp.addEventListener('click', function() { state.n++; render(); });
$btnDn.addEventListener('click', function() { if (state.n > 0) { state.n--; render(); } });

render();
