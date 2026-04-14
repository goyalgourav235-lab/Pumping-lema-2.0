// ─── Uses globals from CDN: THREE, gsap, ScrollTrigger, Lenis ───────────────

gsap.registerPlugin(ScrollTrigger);

// ─── LENIS SMOOTH SCROLL ────────────────────────────
const lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// ─── CUSTOM CURSOR ──────────────────────────────────
const cursor = document.getElementById('cursor');
gsap.set(cursor, { xPercent: -50, yPercent: -50 });
const moveCursor = e => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'none' });
document.addEventListener('mousemove', moveCursor);
document.querySelectorAll('a, button, .fx-card, .eg-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

// ─── NAVBAR SCROLL ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
});

// ─── THREE.JS HERO SCENE ────────────────────────────
const heroCanvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(heroCanvas.parentElement.clientWidth, heroCanvas.parentElement.clientHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, heroCanvas.parentElement.clientWidth / heroCanvas.parentElement.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5.5);

const geom = new THREE.TorusKnotGeometry(1.4, 0.38, 160, 24, 2, 3);
const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.95, roughness: 0.1 });
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({ color: 0xc8f23a, wireframe: true, transparent: true, opacity: 0.07 });
const wireMesh = new THREE.Mesh(geom, wireMat);
scene.add(wireMesh);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dirLight1 = new THREE.DirectionalLight(0xc8f23a, 3.5);
dirLight1.position.set(3, 3, 3); scene.add(dirLight1);
const dirLight2 = new THREE.DirectionalLight(0x4040ff, 2.0);
dirLight2.position.set(-4, -2, 2); scene.add(dirLight2);
const pointLight = new THREE.PointLight(0xff3d3d, 3.0, 15);
pointLight.position.set(-2, 2, 3); scene.add(pointLight);

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const animateHero = () => {
    requestAnimationFrame(animateHero);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.006;
    wireMesh.rotation.x = mesh.rotation.x;
    wireMesh.rotation.y = mesh.rotation.y;
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
};
animateHero();

// ─── BACKGROUND PARTICLE CANVAS ─────────────────────
const bgCanvas = document.getElementById('bg-canvas');
const ctx = bgCanvas.getContext('2d');
bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

const PARTICLE_COUNT = 100;
const particles = [];

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.85 ? '#c8f23a' : '#ffffff';
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) this.reset();
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color; ctx.globalAlpha = this.opacity; ctx.fill(); ctx.globalAlpha = 1;
    }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

const drawConnections = () => {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120) {
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(200,242,58,${0.04 * (1 - dist/120)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
};

const animateBG = () => {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateBG);
};
animateBG();

// ─── RESIZE HANDLER ─────────────────────────────────
window.addEventListener('resize', () => {
    bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight;
    renderer.setSize(heroCanvas.parentElement.clientWidth, heroCanvas.parentElement.clientHeight);
    camera.aspect = heroCanvas.parentElement.clientWidth / heroCanvas.parentElement.clientHeight;
    camera.updateProjectionMatrix();
});

// ─── GSAP SCROLL ANIMATIONS ─────────────────────────
gsap.set('.hero-heading', { opacity: 0, y: 60 });
gsap.set('.hero-bottom',  { opacity: 0, y: 30 });
gsap.set('.step',         { opacity: 0, x: 40 });
gsap.set('.eg-row',       { opacity: 0, y: 20 });
gsap.set('.fx-card',      { opacity: 0, y: 50 });
gsap.set('.display-h2',   { opacity: 0, y: 40 });
gsap.set('.pill-tag',     { opacity: 0, y: 20 });

gsap.to('.hero-heading', { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out', delay: 0.2 });
gsap.to('.hero-bottom',  { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.7 });

gsap.utils.toArray('.display-h2').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.pill-tag').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
});
gsap.utils.toArray('.fx-card').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.12, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.step').forEach((el, i) => {
    gsap.to(el, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.eg-row').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.07, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
});

// ─── CFL SECTION ANIMATIONS ────────────────────────
gsap.set('.cfl-pill-tag',      { opacity: 0, y: 20 });
gsap.set('.cfl-display-h2',    { opacity: 0, y: 40 });
gsap.set('.cfl-compare-card',  { opacity: 0, y: 50 });
gsap.set('.cfl-decomp-card',   { opacity: 0, y: 50 });
gsap.set('.cfl-condition-row', { opacity: 0, x: 40 });
gsap.set('.cfl-step',          { opacity: 0, x: 40 });

gsap.utils.toArray('.cfl-pill-tag').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
});
gsap.utils.toArray('.cfl-display-h2').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.cfl-compare-card').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.15, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.cfl-decomp-card').forEach((el, i) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.cfl-condition-row').forEach((el, i) => {
    gsap.to(el, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});
gsap.utils.toArray('.cfl-step').forEach((el, i) => {
    gsap.to(el, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
});

window.addEventListener('load', () => { ScrollTrigger.refresh(); });
