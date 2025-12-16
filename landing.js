const LANDING_PAGES = [
  { timestamp: "1주차", subtitle: "8장 중 1장", src: "./assets/pages/page-01.svg" },
  { timestamp: "2주차", subtitle: "8장 중 2장", src: "./assets/pages/page-02.svg" },
  { timestamp: "3주차", subtitle: "8장 중 3장", src: "./assets/pages/page-03.svg" },
  { timestamp: "4주차", subtitle: "8장 중 4장", src: "./assets/pages/page-04.svg" },
  { timestamp: "5주차", subtitle: "8장 중 5장", src: "./assets/pages/page-05.svg" },
  { timestamp: "6주차", subtitle: "8장 중 6장", src: "./assets/pages/page-06.svg" },
  { timestamp: "7주차", subtitle: "8장 중 7장", src: "./assets/pages/page-07.svg" },
  { timestamp: "최종", subtitle: "8장 중 8장", src: "./assets/pages/page-08.svg" },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;

  const resize = () => {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  return { ctx, resize };
}

function init() {
  const stage = document.getElementById("stage");
  const ts = document.getElementById("ts");
  const pg = document.getElementById("pg");
  const thumb = document.getElementById("thumb");
  const resetBtn = document.getElementById("reset");
  const spaceCanvas = document.getElementById("space");
  const trailCanvas = document.getElementById("trail");

  if (
    !(stage instanceof HTMLElement) ||
    !(ts instanceof HTMLElement) ||
    !(pg instanceof HTMLElement) ||
    !(thumb instanceof HTMLImageElement) ||
    !(resetBtn instanceof HTMLButtonElement) ||
    !(spaceCanvas instanceof HTMLCanvasElement) ||
    !(trailCanvas instanceof HTMLCanvasElement)
  ) {
    return;
  }

  // Canvas layers
  const space = setupCanvas(spaceCanvas);
  const trail = setupCanvas(trailCanvas);
  if (!space || !trail) return;

  // Starfield (very lightweight)
  const stars = [];
  const STAR_COUNT = 70;
  const spawnStars = () => {
    stars.length = 0;
    const w = spaceCanvas.getBoundingClientRect().width;
    const h = spaceCanvas.getBoundingClientRect().height;
    for (let i = 0; i < STAR_COUNT; i++) {
      const pick = Math.random();
      const color =
        pick < 0.72
          ? "rgba(255,255,255,1)"
          : pick < 0.88
            ? "rgba(198,230,255,1)"
            : "rgba(214,203,255,1)";
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.55,
        s: 0.2 + Math.random() * 0.8,
        color,
        // twinkle: each star has its own rhythm
        tw: 0.0008 + Math.random() * 0.0026, // rad/ms
        ph: Math.random() * Math.PI * 2,
        // occasional sparkle pulses
        sp: 0.0012 + Math.random() * 0.0032,
        spPh: Math.random() * Math.PI * 2,
        spAmp: 0.08 + Math.random() * 0.16,
      });
    }
  };
  spawnStars();
  window.addEventListener("resize", spawnStars);

  let idx = 0;
  let dragging = false;
  let startX = 0;
  let startIdx = 0;
  let px = 0.5;
  let py = 0.45;

  const setIndex = (next) => {
    idx = clamp(next, 0, LANDING_PAGES.length - 1);
    const p = LANDING_PAGES[idx];
    ts.textContent = p.timestamp;
    pg.textContent = p.subtitle;
    thumb.src = p.src;
    thumb.alt = `${p.timestamp} 과제 페이지 프리뷰`;
  };

  const updateParallax = (clientX, clientY) => {
    const rect = stage.getBoundingClientRect();
    px = clamp((clientX - rect.left) / rect.width, 0, 1);
    py = clamp((clientY - rect.top) / rect.height, 0, 1);
    stage.style.setProperty("--px", `${px * 100}%`);
    stage.style.setProperty("--py", `${py * 100}%`);
    stage.style.setProperty("--tpx", `${(px - 0.5) * 14}px`);
    stage.style.setProperty("--tpy", `${(py - 0.5) * 10}px`);
  };

  // Trail
  let lastTrail = null;
  const drawTrail = (x, y) => {
    const ctx = trail.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(118, 228, 247, 0.10)";
    if (idx >= 4) ctx.fillStyle = "rgba(167, 139, 250, 0.10)";

    const R = 16; // trail radius (smaller = tighter glow around finger)
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    lastTrail = { x, y, t: performance.now() };
  };

  const fadeTrail = () => {
    const ctx = trail.ctx;
    const rect = trailCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.save();
    // IMPORTANT: keep the trail canvas transparent.
    // We gradually erase previous strokes instead of painting a dark overlay.
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  };

  // Render loop
  let raf = 0;
  const render = (t) => {
    const ctx = space.ctx;
    const w = spaceCanvas.getBoundingClientRect().width;
    const h = spaceCanvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);

    // stars
    ctx.save();
    for (const st of stars) {
      const dx = (px - 0.5) * 18 * st.s;
      const dy = (py - 0.5) * 14 * st.s;
      const tw = 0.65 + 0.35 * Math.sin(t * st.tw + st.ph);
      const sparkleBase = Math.max(0, Math.sin(t * st.sp + st.spPh));
      const sparkle = Math.pow(sparkleBase, 6) * st.spAmp;
      ctx.globalAlpha = clamp(st.a * tw + sparkle, 0.04, 1);
      ctx.fillStyle = st.color;
      ctx.beginPath();
      ctx.arc(st.x + dx, st.y + dy, st.r * (0.9 + 0.25 * tw), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // time line (subtle)
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    const grad = ctx.createLinearGradient(0, h * 0.72, w, h * 0.72);
    grad.addColorStop(0, "rgba(118, 228, 247, 0.0)");
    grad.addColorStop(0.5, "rgba(118, 228, 247, 0.28)");
    grad.addColorStop(1, "rgba(167, 139, 250, 0.0)");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();
    ctx.restore();

    fadeTrail();

    raf = requestAnimationFrame(render);
  };
  // Reduced motion: render a single static frame
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (reduce?.matches) {
    render(performance.now());
  } else {
    raf = requestAnimationFrame(render);
  }

  const pointerToIndex = (clientX) => {
    const rect = stage.getBoundingClientRect();
    const t = clamp((clientX - rect.left) / rect.width, 0, 1);
    return Math.round(t * (LANDING_PAGES.length - 1));
  };

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startIdx = idx;
    stage.setPointerCapture?.(e.pointerId);
    updateParallax(e.clientX, e.clientY);
    const rect = stage.getBoundingClientRect();
    drawTrail(e.clientX - rect.left, e.clientY - rect.top);
  });

  stage.addEventListener("pointermove", (e) => {
    updateParallax(e.clientX, e.clientY);
    const rect = stage.getBoundingClientRect();
    if (dragging) {
      // Horizontal drag -> time scrub
      const dx = e.clientX - startX;
      const step = rect.width / (LANDING_PAGES.length - 1);
      const moved = Math.round(dx / step);
      setIndex(startIdx + moved);
    } else {
      setIndex(pointerToIndex(e.clientX));
    }
    drawTrail(e.clientX - rect.left, e.clientY - rect.top);
  });

  const end = () => {
    dragging = false;
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("pointerleave", end);

  resetBtn.addEventListener("click", () => {
    setIndex(0);
    trail.ctx.clearRect(
      0,
      0,
      trailCanvas.getBoundingClientRect().width,
      trailCanvas.getBoundingClientRect().height,
    );
  });

  setIndex(0);
}

document.addEventListener("DOMContentLoaded", init);


