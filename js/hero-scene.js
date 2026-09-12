/* ============================================================================
 * hero-scene.js
 * Self-contained Three.js hero sculpture for a developer portfolio.
 *
 * Export:  async initHeroScene(canvas) -> Promise<cleanup>
 *   canvas : <canvas> element (must already be sized by CSS)
 *   cleanup: function() removing WebGL context, listeners, observers, loop
 *
 * Requires an importmap in index.html mapping "three" to:
 *   https://unpkg.com/three@0.160.0/build/three.module.js
 * No addons, no loaders, no external assets. 100% primitives + buffer points.
 * ========================================================================== */
import * as THREE from 'three';

/* ---------------- config ---------------- */
const CLOUD_COUNT = 12000;                    /* morphing particle cloud      */
const CORE_COUNT  = 600;                      /* inner energy-core particles   */
const STAR_COUNT  = 4200;                     /* background starfield          */
const PARTICLE_BUDGET = CLOUD_COUNT + CORE_COUNT + STAR_COUNT;  /* 16,800   */
const MAX_DPR     = 2;
const IDLE_SPEED  = 0.16;                     /* rad/s idle rotation           */
const MORPH_PERIOD = 9;                       /* seconds per cloud morph       */
const DRAG_GAIN   = 0.0042;                   /* pointer drag -> spin velocity  */
const DRAG_DAMP   = 2.6;                      /* spin velocity decay (1/s)      */
const EASE        = 4.0;                      /* parallax smoothing (1/s)       */

const NEON = { cyan: 0x22d3ee, magenta: 0xff3fb3, purple: 0x8b5cf6 };

/* ---------------- tiny helpers ---------------- */
function noopCleanup() {}

function randDir() {
  const theta = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const s = Math.sqrt(Math.max(0, 1 - z * z));
  return { x: Math.cos(theta) * s, y: z, z: Math.sin(theta) * s };
}

/* procedural soft dot sprite (no external image assets) */
function makeDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ---------------- cloud morph shapes ---------------- */
function fillSphereShell(arr, n, rMin, rMax) {
  for (let i = 0; i < n; i++) {
    const d = randDir();
    const r = rMin + (rMax - rMin) * Math.random();
    arr[i * 3] = d.x * r; arr[i * 3 + 1] = d.y * r; arr[i * 3 + 2] = d.z * r;
  }
}

function fillTorus(arr, n, R, tube) {
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const r = R + tube * Math.cos(v);
    arr[i * 3] = r * Math.cos(u);
    arr[i * 3 + 1] = tube * Math.sin(v);
    arr[i * 3 + 2] = r * Math.sin(u);
  }
}

function fillGalaxy(arr, n) {
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.55) * 2.5;
    const a = Math.random() * Math.PI * 2;
    const w = Math.sin(a * 2 + r * 1.4) * 0.35 * (r / 2.5);
    arr[i * 3] = Math.cos(a) * r + w;
    arr[i * 3 + 1] = (Math.random() - 0.5) * (0.5 - 0.34 * (r / 2.5));
    arr[i * 3 + 2] = Math.sin(a) * r - w;
  }
}

/* abstract particle bust: head + shoulders (the "artist" avatar) */
function fillFigure(arr, n) {
  for (let i = 0; i < n; i++) {
    const d = randDir();
    const shell = 0.72 + Math.random() * 0.28;
    let cx = 0, cy, cz = 0, rx, ry, rz;
    if (Math.random() < 0.42) {
      cy = 1.05; rx = 0.34; ry = 0.26; rz = 0.30;  /* head     */
    } else {
      cy = -0.15; rx = 0.62; ry = 0.95; rz = 0.50; /* shoulders*/
    }
    arr[i * 3] = cx + d.x * rx * shell;
    arr[i * 3 + 1] = cy + d.y * ry * shell;
    arr[i * 3 + 2] = cz + d.z * rz * shell;
  }
}

function fillShape(kind, arr) {
  if (kind === 0) fillSphereShell(arr, CLOUD_COUNT, 1.55, 2.6);
  else if (kind === 1) fillTorus(arr, CLOUD_COUNT, 2.05, 0.72);
  else if (kind === 2) fillGalaxy(arr, CLOUD_COUNT);
  else fillFigure(arr, CLOUD_COUNT);
}

/* ============================================================================
 * initHeroScene
 * ========================================================================== */
export async function initHeroScene(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return noopCleanup;

  /* ---- renderer (guarded against WebGL failure) ---- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (_) {
    return noopCleanup;
  }
  if (!renderer.getContext()) { renderer.dispose(); return noopCleanup; }

  const reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070113, 0.02);

  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  cam.position.set(0, 0.55, 5.4);

  /* ---- neon lighting ---- */
  const cyanLight    = new THREE.PointLight(NEON.cyan,    30, 30, 2);
  cyanLight.position.set(4, 3, 4);
  const magentaLight = new THREE.PointLight(NEON.magenta, 24, 30, 2);
  magentaLight.position.set(-4, -1, 3);
  const purpleLight  = new THREE.PointLight(NEON.purple,  18, 30, 2);
  purpleLight.position.set(0, 4, -3);
  scene.add(cyanLight, magentaLight, purpleLight);

  /* ---- sculpture group (the trio) ---- */
  const sculpture = new THREE.Group();
  scene.add(sculpture);

  /* core: wireframe icosahedron, emissive purple */
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 1),
    new THREE.MeshStandardMaterial({
      color: 0x0b1026, emissive: NEON.purple, emissiveIntensity: 1.4,
      wireframe: true, transparent: true, opacity: 0.85,
      metalness: 0.3, roughness: 0.4,
    })
  );
  sculpture.add(core);

  /* ring: wireframe torus knot, emissive magenta */
  const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.7, 0.32, 110, 14, 2, 3),
    new THREE.MeshStandardMaterial({
      color: 0x12061f, emissive: 0xff2fa0, emissiveIntensity: 1.1,
      wireframe: true, transparent: true, opacity: 0.7,
      metalness: 0.25, roughness: 0.5,
    })
  );
  ring.rotation.set(1.5, 0, 0.55);
  sculpture.add(ring);

  /* inner energy core: glowing cyan particle ball */
  const coreGlowPos = new Float32Array(CORE_COUNT * 3);
  for (let i = 0; i < CORE_COUNT; i++) {
    const d = randDir();
    const r = 0.52 + Math.random() * 0.18;
    coreGlowPos[i * 3] = d.x * r;
    coreGlowPos[i * 3 + 1] = d.y * r;
    coreGlowPos[i * 3 + 2] = d.z * r;
  }
  const coreGeo = new THREE.BufferGeometry();
  coreGeo.setAttribute('position', new THREE.BufferAttribute(coreGlowPos, 3));
  const coreGlow = new THREE.Points(coreGeo, new THREE.PointsMaterial({
    color: 0x7ef2ff, size: 0.075, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sculpture.add(coreGlow);

  /* ---- morphing particle cloud ---- */
  const dotTex = makeDotTexture();

  const cloudGeo = new THREE.BufferGeometry();
  const cloudPos = new Float32Array(CLOUD_COUNT * 3);
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));

  const shapeA = new Float32Array(CLOUD_COUNT * 3);
  const shapeB = new Float32Array(CLOUD_COUNT * 3);
  const drift  = new Float32Array(CLOUD_COUNT * 3);
  const phase  = new Float32Array(CLOUD_COUNT);
  let morphT = 0;
  let kindA = 3, kindB = 0;   /* start posed as the particle bust -> sphere */

  fillShape(kindA, shapeA);
  fillShape(kindB, shapeB);
  cloudPos.set(shapeA);

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const d = randDir();
    drift[i * 3] = d.x * (0.4 + Math.random() * 0.6);
    drift[i * 3 + 1] = d.y * (0.4 + Math.random() * 0.6);
    drift[i * 3 + 2] = d.z * (0.4 + Math.random() * 0.6);
    phase[i] = Math.random() * Math.PI * 2;
  }

  /* per-particle gradient: cyan -> magenta -> purple */
  const colorArr = new Float32Array(CLOUD_COUNT * 3);
  const cCyan = new THREE.Color(NEON.cyan);
  const cMag  = new THREE.Color(NEON.magenta);
  const cPur  = new THREE.Color(NEON.purple);
  const col   = new THREE.Color();
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const t = Math.random();
    if (t < 0.5) col.copy(cCyan).lerp(cMag, t * 2);
    else col.copy(cMag).lerp(cPur, (t - 0.5) * 2);
    colorArr[i * 3] = col.r;
    colorArr[i * 3 + 1] = col.g;
    colorArr[i * 3 + 2] = col.b;
  }
  cloudGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

  const cloud = new THREE.Points(cloudGeo, new THREE.PointsMaterial({
    size: 0.055, map: dotTex, vertexColors: true,
    transparent: true, opacity: 0.92,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sculpture.add(cloud);

  /* ---- reflective-looking grid floor ---- */
  const grid = new THREE.GridHelper(14, 28, NEON.cyan, 0x7c3aed);
  grid.position.y = -2.5;
  const gm = grid.material;
  if (Array.isArray(gm)) {
    gm.forEach((m) => { m.transparent = true; m.opacity = 0.22; m.depthWrite = false; });
  } else {
    gm.transparent = true; gm.opacity = 0.22; gm.depthWrite = false;
  }
  scene.add(grid);

  /* ---- starfield ---- */
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const d = randDir();
    const r = 26 + Math.random() * 26;
    starPos[i * 3] = d.x * r;
    starPos[i * 3 + 1] = d.y * r * 0.6;
    starPos[i * 3 + 2] = d.z * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xb9d6ff, size: 0.16, map: dotTex,
    transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(stars);

  /* ---- soft vignette (fullscreen shader quad, child of camera) ---- */
  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 1.72;
          float a = smoothstep(0.35, 1.0, d) * 0.6;
          gl_FragColor = vec4(0.01, 0.0, 0.07, a);
        }`,
    })
  );
  vignette.renderOrder = 999;
  cam.add(vignette);
  scene.add(cam);

  /* ---- sizing ---- */
  const size = { w: 1, h: 1 };
  function measure() {
    size.w = Math.max(1, canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth || 1);
    size.h = Math.max(1, canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight || 1);
  }
  function resize() {
    measure();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(size.w, size.h, false);
    cam.aspect = size.w / size.h;
    cam.updateProjectionMatrix();
    const halfH = Math.tan((cam.fov * Math.PI) / 360); /* frustum half-height at z = -1 */
    vignette.scale.set(halfH * cam.aspect, halfH, 1);
    if (reduced) renderer.render(scene, cam);
  }
  resize();

  /* ---- interactivity (skipped when reduced motion) ---- */
  const pointer = { x: 0, y: 0 };
  let smoothX = 0, smoothY = 0;
  let spinVel = 0, lastX = 0, dragging = false;
  let idleAng = 0.8;

  const onPointerMove = (e) => {
    pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    pointer.y = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      spinVel = Math.max(-0.7, Math.min(0.7, spinVel + dx * DRAG_GAIN));
    }
  };
  const onPointerDown = (e) => { dragging = true; lastX = e.clientX; };
  const onPointerUp = () => { dragging = false; };
  const onBlur = () => { pointer.x = 0; pointer.y = 0; dragging = false; };

  if (!reduced) {
    canvas.style.touchAction = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', onBlur);
    document.documentElement.addEventListener('mouseleave', onBlur);
  }

  /* ---- observers ---- */
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  let visible = true;
  let io = null;
  if (!reduced && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(canvas);
  }

  /* ---- render loop ---- */
  const clock = new THREE.Clock();
  let rafId = null;

  function update() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    /* morph cloud toward next shape */
    morphT += dt / MORPH_PERIOD;
    if (morphT >= 1) {
      kindA = kindB;
      shapeA.set(shapeB);
      let k;
      do { k = (Math.random() * 4) | 0; } while (k === kindB);
      kindB = k;
      fillShape(kindB, shapeB);
      morphT = 0;
    }
    const s = morphT * morphT * (3 - 2 * morphT); /* smoothstep */
    const tt = t * 0.85;
    for (let i = 0, j = 0; i < CLOUD_COUNT; i++, j += 3) {
      const amp = Math.sin(tt + phase[i]) * 0.035;
      cloudPos[j]     = shapeA[j]     + (shapeB[j]     - shapeA[j])     * s + drift[j]     * amp;
      cloudPos[j + 1] = shapeA[j + 1] + (shapeB[j + 1] - shapeA[j + 1]) * s + drift[j + 1] * amp;
      cloudPos[j + 2] = shapeA[j + 2] + (shapeB[j + 2] - shapeA[j + 2]) * s + drift[j + 2] * amp;
    }
    cloudGeo.attributes.position.needsUpdate = true;

    /* idle + drag spin + parallax */
    idleAng += (IDLE_SPEED + spinVel) * dt;
    spinVel *= Math.exp(-DRAG_DAMP * dt);
    if (Math.abs(spinVel) < 0.0005) spinVel = 0;
    const f = 1 - Math.exp(-EASE * dt);
    smoothX += (pointer.x - smoothX) * f;
    smoothY += (pointer.y - smoothY) * f;
    sculpture.rotation.y = idleAng + smoothX * 0.22;
    sculpture.rotation.x = 0.06 + smoothY * 0.16;

    /* inner motion */
    core.rotation.y += 0.09 * dt;
    core.rotation.x += 0.04 * dt;
    ring.rotation.y += 0.26 * dt;
    coreGlow.rotation.y += 0.16 * dt;
    cloud.rotation.y = t * 0.03;
    stars.rotation.y = t * 0.004;

    /* gentle camera float */
    cam.position.y = 0.55 + Math.sin(t * 0.4) * 0.07;
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    update();
    renderer.render(scene, cam);
  }
  function start() {
    if (rafId === null) {
      clock.getDelta(); /* reset delta so first dt is small */
      rafId = requestAnimationFrame(tick);
    }
  }
  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ---- initial pose / static frame ---- */
  if (reduced) {
    sculpture.rotation.y = 0.7;
    sculpture.rotation.x = 0.12;
    core.rotation.y = 0.3;
    ring.rotation.y = 0.6;
  }
  renderer.render(scene, cam);
  if (!reduced) start();

  /* ---- cleanup ---- */
  return function cleanup() {
    stop();
    if (io) io.disconnect();
    if (ro) ro.disconnect();
    else window.removeEventListener('resize', resize);
    if (!reduced) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', onBlur);
      document.documentElement.removeEventListener('mouseleave', onBlur);
    }
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const m = o.material;
      if (!m) return;
      const mats = Array.isArray(m) ? m : [m];
      mats.forEach((mm) => {
        if (mm.map) mm.map.dispose();
        mm.dispose();
      });
    });
    dotTex.dispose();
    renderer.dispose();
    const gl = renderer.getContext();
    if (gl && gl.getExtension) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  };
}