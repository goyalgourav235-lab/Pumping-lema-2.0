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
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 100) {
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = `rgba(200,242,58,${0.05 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateBG);
};
animateBG();

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

// ─── SIMULATION LOGIC ────────────────────────────────
const LANGUAGES = {
    balanced: {
        title: 'Balanced Pair Language',
        desc: 'L₁ = { aⁿbⁿ | n ≥ 0 } — For every "a" there must be exactly one "b".',
        ruleDesc: 'Count(a) = Count(b)',
        genString: function(p) {
            return {
                x: 'a'.repeat(Math.ceil(p / 2)),
                y: 'a'.repeat(Math.floor(p / 2)),
                z: 'b'.repeat(p)
            };
        },
        countB: function(p) { return p; },
        check: function(totalA, totalB) { return totalA === totalB; },
    },
    double: {
        title: 'Double Ratio Language',
        desc: 'L₂ = { aⁿb²ⁿ | n ≥ 0 } — Every "a" needs exactly two "b"s.',
        ruleDesc: 'Count(b) = 2 × Count(a)',
        genString: function(p) {
            return {
                x: 'a'.repeat(Math.ceil(p / 2)),
                y: 'a'.repeat(Math.floor(p / 2)),
                z: 'b'.repeat(p * 2)
            };
        },
        countB: function(p) { return p * 2; },
        check: function(totalA, totalB) { return totalB === totalA * 2; },
    },
    triple: {
        title: 'Double Power Language',
        desc: 'L₃ = { a²ⁿbⁿ | n ≥ 0 } — Two "a"s for every "b".',
        ruleDesc: 'Count(a) = 2 × Count(b)',
        genString: function(p) {
            return {
                x: 'a'.repeat(p),
                y: 'a'.repeat(Math.max(1, Math.floor(p / 2))),
                z: 'b'.repeat(p)
            };
        },
        countB: function(p) { return p; },
        check: function(totalA, totalB) { return totalA === totalB * 2; },
    },
};

let state = { lang: 'balanced', p: 4, n: 1 };
let prevCounts = { a: 0, b: 0, len: 0 };

const $langSelect   = document.getElementById('lang-select');
const $rangeP       = document.getElementById('range-p');
const $valP         = document.getElementById('val-p');
const $valN         = document.getElementById('val-n');
const $nGhost       = document.getElementById('n-ghost');
const $btnUp        = document.getElementById('btn-up');
const $btnDn        = document.getElementById('btn-dn');
const $partX        = document.getElementById('part-x');
const $partY        = document.getElementById('part-y');
const $partZ        = document.getElementById('part-z');
const $wrap         = document.getElementById('string-wrap');
const $statusTitle  = document.getElementById('status-title');
const $statusDtl    = document.getElementById('status-detail');
const $statusFormula = document.getElementById('status-formula');
const $langTitle    = document.getElementById('lang-title');
const $langDesc     = document.getElementById('lang-desc');
const $formulaExpr  = document.getElementById('formula-expr');
const $countA       = document.getElementById('count-a');
const $countB       = document.getElementById('count-b');
const $countLen     = document.getElementById('count-len');
const $countRatio   = document.getElementById('count-ratio');
const $cellRatio    = document.getElementById('cell-ratio');
const $xyVal        = document.getElementById('xy-val');
const $xyP          = document.getElementById('xy-p');
const $yVal         = document.getElementById('y-val');
const $constraintXY = document.getElementById('constraint-xy');
const $constraintY  = document.getElementById('constraint-y');
const $insightText  = document.getElementById('insight-text');
const $insightCard  = document.getElementById('insight-card');

function render() {
    var L = LANGUAGES[state.lang];
    var parts = L.genString(state.p);
    var x = parts.x, y = parts.y, z = parts.z;
    var totalA = x.length + y.length * state.n;
    var totalB = L.countB(state.p);
    var fullLen = totalA + totalB;
    var xyLen = x.length + y.length;
    var yRepeated = y.repeat(state.n);
    var fullString = x + yRepeated + z;

    // ─── Update Controls ─────────────────────────────
    $valP.textContent = state.p;
    $valN.textContent = state.n;
    $nGhost.textContent = state.n;
    $partX.textContent = x || 'ε';
    $partY.textContent = yRepeated + ' (×' + state.n + ')';
    $partZ.textContent = z;
    $langTitle.textContent = L.title;
    $langDesc.textContent = L.desc;

    // ─── Formula Bar ─────────────────────────────────
    var displayStr = fullString.length > 35 ? fullString.slice(0, 32) + '…' : fullString;
    $formulaExpr.innerHTML =
        's = x · y<sup>' + state.n + '</sup> · z  =  ' +
        '<span class="formula-result">"' + displayStr + '"</span>' +
        '  <span class="formula-len">(length ' + fullLen + ')</span>';

    // ─── Animated Counters ───────────────────────────
    animateValue($countA, prevCounts.a, totalA);
    animateValue($countB, prevCounts.b, totalB);
    animateValue($countLen, prevCounts.len, fullLen);

    // Ratio display
    if (totalB === 0) {
        $countRatio.textContent = totalA > 0 ? '∞:0' : '0:0';
    } else {
        var ratio = totalA / totalB;
        $countRatio.textContent = ratio === Math.round(ratio) ? ratio + ':1' : ratio.toFixed(2) + ':1';
    }

    // Color code ratio cell when unstable
    var stable = L.check(totalA, totalB);
    $cellRatio.classList.toggle('analytic-alert', !stable);

    prevCounts = { a: totalA, b: totalB, len: fullLen };

    // ─── Constraint Checker ──────────────────────────
    $xyVal.textContent = xyLen;
    $xyP.textContent = state.p;
    $yVal.textContent = y.length;

    var xyOk = xyLen <= state.p;
    var yOk = y.length > 0;
    $constraintXY.querySelector('.constraint-check').textContent = xyOk ? '✓' : '✗';
    $constraintXY.className = 'constraint-item ' + (xyOk ? 'constraint-pass' : 'constraint-fail');
    $constraintY.querySelector('.constraint-check').textContent = yOk ? '✓' : '✗';
    $constraintY.className = 'constraint-item ' + (yOk ? 'constraint-pass' : 'constraint-fail');

    // ─── Build Token Visualization ───────────────────
    $wrap.innerHTML = '';
    var frag = document.createDocumentFragment();

    var addTokens = function(str, isY, pumpIdx) {
        for (var i = 0; i < str.length; i++) {
            var t = document.createElement('div');
            t.className = 'token ' + str[i] + (isY ? ' y-pump' : '');
            t.textContent = str[i];
            if (isY) t.style.animationDelay = ((pumpIdx * y.length + i) * 0.04) + 's';
            frag.appendChild(t);
        }
    };

    addTokens(x, false, 0);
    for (var pump = 0; pump < state.n; pump++) addTokens(y, true, pump);
    addTokens(z, false, 0);
    $wrap.appendChild(frag);

    gsap.fromTo('.token', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.02, ease: 'back.out(2)' });

    // ─── Status Board ────────────────────────────────
    $statusTitle.className = 'status-indicator ' + (stable ? 'stable' : 'unstable');
    $statusTitle.textContent = stable ? 'LANGUAGE TEST: ACCEPTED ✓' : 'LANGUAGE TEST: REJECTED ✗';

    var nSup = toSuperscript(state.n);
    if (stable) {
        $statusDtl.textContent = L.ruleDesc + ' — Count(a)=' + totalA + ', Count(b)=' + totalB + '. The pumped string xy' + nSup + 'z is in L.';
    } else {
        $statusDtl.textContent = L.ruleDesc + ' violated — Count(a)=' + totalA + ', Count(b)=' + totalB + '. The pumped string xy' + nSup + 'z is NOT in L.';
    }

    $statusFormula.innerHTML = stable
        ? '<span class="sf-accepted">xy<sup>' + state.n + '</sup>z ∈ L</span>'
        : '<span class="sf-rejected">xy<sup>' + state.n + '</sup>z ∉ L — <em>Contradiction! L is not regular.</em></span>';

    // ─── Insight Card ────────────────────────────────
    generateInsight(state.n, stable, totalA, totalB, L);

    // ─── Stage flash ─────────────────────────────────
    var stage = document.querySelector('.sim-stage');
    if (!stable) {
        gsap.fromTo(stage, { outlineColor: 'rgba(255,61,61,0)' },
            { outlineColor: 'rgba(255,61,61,0.4)', outlineWidth: '2px', outlineStyle: 'solid', duration: 0.2, yoyo: true, repeat: 3 });
    } else {
        stage.style.outline = 'none';
    }
}

function generateInsight(n, stable, totalA, totalB, L) {
    var text = '';
    if (n === 0) {
        text = 'With n=0, the loop segment y is deleted entirely. The string becomes xz — the loop is removed. If this violates the language rule, non-regularity is proven even by loop removal.';
    } else if (n === 1) {
        text = 'At n=1, the string is in its original unpumped form. This is the baseline — the string must be in L. Try pumping (n≥2) or deflating (n=0) to test the Pumping Lemma conditions.';
    } else if (stable) {
        text = 'After ' + n + ' pumps, the string still satisfies the rule. This doesn\'t prove regularity — the Pumping Lemma is a necessary condition, not sufficient. Try a different pump count.';
    } else {
        var diff = Math.abs(totalA - totalB);
        text = 'Pumping y ' + n + ' times created a count difference of ' + diff + '. Since ' + L.ruleDesc.toLowerCase() + ' is required but Count(a)=' + totalA + ' vs Count(b)=' + totalB + ', the string left L. Contradiction — L is proven not regular!';
    }
    $insightText.textContent = text;
    gsap.fromTo($insightCard, { borderColor: stable ? 'rgba(200,242,58,0.1)' : 'rgba(255,61,61,0.1)' },
        { borderColor: stable ? 'rgba(200,242,58,0.4)' : 'rgba(255,61,61,0.4)', duration: 0.3, yoyo: true, repeat: 1 });
}

$langSelect.addEventListener('change', function(e) { state.lang = e.target.value; state.n = 1; prevCounts = { a: 0, b: 0, len: 0 }; render(); });
$rangeP.addEventListener('input', function(e) { state.p = +e.target.value; state.n = 1; prevCounts = { a: 0, b: 0, len: 0 }; render(); });
$btnUp.addEventListener('click', function() { state.n++; render(); });
$btnDn.addEventListener('click', function() { if (state.n > 0) { state.n--; render(); } });

render();
