// 세로(주차) × 가로(주차 내 페이지) 스크롤 그리드 전시
// - 세로 스크롤: 1주차 → 8주차
// - 7주차만 2장 가로 배치
// - 클릭: 라이트박스(확대/축소/드래그)

// 주차(시간) → 주차 안의 여러 화면(이미지) 구조
// 원하는 만큼 items를 늘리면 그리드가 자동으로 맞춰집니다.
const GROUPS = [
  // 1~6주차: 각 1장 (Frame 1~6)
  {
    timestamp: "1주차",
    title: "1주차",
    items: [
      { title: "Page 1", caption: "1주차 이미지", src: "./assets/pages/Frame%201.png" },
    ],
  },
  {
    timestamp: "2주차",
    title: "2주차",
    items: [
      { title: "Page 2", caption: "2주차 이미지", src: "./assets/pages/Frame%202.png" },
    ],
  },
  {
    timestamp: "3주차",
    title: "3주차",
    items: [
      { title: "Page 3", caption: "3주차 이미지", src: "./assets/pages/Frame%203.png" },
    ],
  },
  {
    timestamp: "4주차",
    title: "4주차",
    items: [
      { title: "Page 4", caption: "4주차 이미지", src: "./assets/pages/Frame%204.png" },
    ],
  },
  {
    timestamp: "5주차",
    title: "5주차",
    items: [
      { title: "Page 5", caption: "5주차 이미지", src: "./assets/pages/Frame%205.png" },
    ],
  },
  {
    timestamp: "6주차",
    title: "6주차",
    items: [
      { title: "Page 6", caption: "6주차 이미지", src: "./assets/pages/Frame%206.png" },
    ],
  },
  // 7주차: 2장 (한글 파일명)
  {
    timestamp: "7주차",
    title: "7주차",
    items: [
      {
        title: "Page 7-1",
        caption: "7주차 첫 번째 이미지",
        src: "./assets/pages/%EC%8B%9C%EA%B0%84%EA%B3%BC%20%EA%B3%B5%EA%B0%84,%20%EA%B3%B5%EA%B0%84%EA%B3%BC%20%EC%8B%9C%EA%B0%84%20%EC%82%AC%EC%9D%B4%EC%9D%98%20%EC%96%B4%EB%96%A4%20%EA%B3%B5%ED%86%B5%EC%A0%90%EC%9D%B4%20%EC%9E%88%EC%9D%84%EA%B9%8C%201.png",
      },
      {
        title: "Page 7-2",
        caption: "7주차 두 번째 이미지",
        src: "./assets/pages/%EC%8B%9C%EA%B0%84%EA%B3%BC%20%EA%B3%B5%EA%B0%84,%20%EA%B3%B5%EA%B0%84%EA%B3%BC%20%EC%8B%9C%EA%B0%84%20%EC%82%AC%EC%9D%B4%EC%9D%98%20%EC%96%B4%EB%96%A4%20%EA%B3%B5%ED%86%B5%EC%A0%90%EC%9D%B4%20%EC%9E%88%EC%9D%84%EA%B9%8C%202.png",
      },
    ],
  },
  // 8주차: Frame 7
  {
    timestamp: "8주차",
    title: "8주차",
    items: [
      { title: "Page 8", caption: "8주차 이미지", src: "./assets/pages/Frame%207.png" },
    ],
  },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function escHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function init() {
  const board = document.getElementById("board");
  const grid = document.getElementById("board-grid");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbTs = document.getElementById("lb-ts");
  const lbTitle = document.getElementById("lb-title");
  const lbCap = document.getElementById("lb-cap");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  const zoomResetBtn = document.getElementById("zoom-reset");

  if (!(board instanceof HTMLElement) || !(grid instanceof HTMLElement)) return;

  const groups = GROUPS.filter((g) => Array.isArray(g.items) && g.items.length > 0);
  if (groups.length === 0) return;

  const cols = Math.max(...groups.map((g) => g.items.length));
  const rows = groups.length;
  grid.style.setProperty("--cols", String(cols));
  grid.style.setProperty("--rows", String(rows));

  const cellsHtml = groups
    .map((g, gi) =>
      g.items
        .map((it, ii) => {
          const aria = `${g.timestamp} ${ii + 1}/${g.items.length} · ${it.title}`;
          return `
            <button
              class="cell"
              type="button"
              data-week="${gi}"
              data-item="${ii}"
              aria-label="${escHtml(aria)}"
              style="grid-row:${gi + 1}; grid-column:${ii + 1};"
            >
              <img src="${escHtml(it.src)}" alt="${escHtml(aria)}" loading="${
            gi === 0 && ii === 0 ? "eager" : "lazy"
          }" />
              <div class="cell-cap" aria-hidden="true">
                <strong>${escHtml(it.title)}</strong>
                <p>${escHtml(it.caption || "")}</p>
              </div>
            </button>
          `;
        })
        .join(""),
    )
    .join("");

  grid.innerHTML = cellsHtml;

  // 3D effect based on board center
  const rafState3D = { id: 0 };
  const update3D = () => {
    const rect = board.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxTiltX = 18;
    const maxTiltY = 30;
    const maxZ = 140;
    const minScale = 0.82;

    const cells = Array.from(grid.querySelectorAll(".cell"));
    for (const cell of cells) {
      const r = cell.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const nx = clamp((x - cx) / rect.width, -0.8, 0.8);
      const ny = clamp((y - cy) / rect.height, -0.8, 0.8);
      const dist = clamp(Math.sqrt(nx * nx + ny * ny) * 1.25, 0, 1);

      const ry = clamp(-nx * maxTiltY, -55, 55);
      const rx = clamp(ny * maxTiltX, -35, 35);
      const z = (1 - dist) * maxZ;
      const sc = clamp(minScale + (1 - dist) * (1 - minScale), minScale, 1);
      const op = clamp(0.22 + (1 - dist) * 0.78, 0.18, 1);
      const blur = clamp(dist * 1.9, 0, 2.4);

      cell.style.setProperty("--ry", `${ry}deg`);
      cell.style.setProperty("--rx", `${rx}deg`);
      cell.style.setProperty("--z", `${z}px`);
      cell.style.setProperty("--sc", String(sc));
      cell.style.setProperty("--op", String(op));
      cell.style.setProperty("--blur", `${blur}px`);
    }
  };

  const schedule3D = () => {
    if (rafState3D.id) return;
    rafState3D.id = requestAnimationFrame(() => {
      rafState3D.id = 0;
      update3D();
    });
  };

  update3D();
  board.addEventListener("scroll", schedule3D, { passive: true });
  window.addEventListener("resize", update3D);

  // Lightbox
  let lastFocus = null;
  const openLightbox = (gi, ii) => {
    if (
      !(lightbox instanceof HTMLElement) ||
      !(lbImg instanceof HTMLImageElement) ||
      !(lbTs instanceof HTMLElement) ||
      !(lbTitle instanceof HTMLElement) ||
      !(lbCap instanceof HTMLElement)
    ) {
      return;
    }
    const g = groups[gi];
    if (!g) return;
    const it = g.items[ii];
    if (!it) return;

    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lbImg.src = it.src;
    lbImg.alt = `${g.timestamp} ${it.title} 확대 이미지`;
    lbTs.textContent = g.timestamp;
    lbTitle.textContent = it.title;
    lbCap.textContent = it.caption || "";
    resetZoom();

    lightbox.hidden = false;
    document.documentElement.style.overflow = "hidden";

    const closeBtn = lightbox.querySelector('[data-close="true"]');
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  };

  const closeLightbox = () => {
    if (!(lightbox instanceof HTMLElement)) return;
    lightbox.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus();
    lastFocus = null;
  };

  grid.addEventListener("click", (e) => {
    const target = e.target;
    const cell = target instanceof HTMLElement ? target.closest(".cell") : null;
    if (!(cell instanceof HTMLElement)) return;
    const gi = Number(cell.getAttribute("data-week"));
    const ii = Number(cell.getAttribute("data-item"));
    if (!Number.isFinite(gi) || !Number.isFinite(ii)) return;
    openLightbox(gi, ii);
  });

  if (lightbox instanceof HTMLElement) {
    lightbox.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.getAttribute("data-close") === "true") closeLightbox();
      if (t.closest('[data-close="true"]')) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lightbox instanceof HTMLElement && !lightbox.hidden) closeLightbox();
  });

  // Arrow keys to move around the board
  board.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const sample = grid.querySelector(".cell");
    if (!(sample instanceof HTMLElement)) return;
    const rect = sample.getBoundingClientRect();
    const stepX = rect.width + 14;
    const stepY = rect.height + 14;
    const dx = e.key === "ArrowLeft" ? -stepX : e.key === "ArrowRight" ? stepX : 0;
    const dy = e.key === "ArrowUp" ? -stepY : e.key === "ArrowDown" ? stepY : 0;
    board.scrollBy({ left: dx, top: dy, behavior: "smooth" });
  });

  // Zoom & pan
  let scale = 1;
  let tx = 0;
  let ty = 0;
  const minScale = 1;
  const maxScale = 4;
  const pointers = new Map();
  let pinchStartScale = 1;
  let pinchStartDist = 0;
  let pinchMid = { x: 0, y: 0 };

  const applyZoom = () => {
    if (!(lbImg instanceof HTMLImageElement)) return;
    lbImg.style.setProperty("--scale", String(scale));
    lbImg.style.setProperty("--tx", `${tx}px`);
    lbImg.style.setProperty("--ty", `${ty}px`);
  };

  const resetZoom = () => {
    scale = 1;
    tx = 0;
    ty = 0;
    applyZoom();
  };

  const clampPan = () => {
    if (!(lbImg instanceof HTMLImageElement)) return;
    const rect = lbImg.getBoundingClientRect();
    const container = lbImg.parentElement?.getBoundingClientRect();
    if (!container) return;
    const maxTx = Math.max(0, (rect.width * scale - container.width) / 2);
    const maxTy = Math.max(0, (rect.height * scale - container.height) / 2);
    tx = Math.min(maxTx, Math.max(-maxTx, tx));
    ty = Math.min(maxTy, Math.max(-maxTy, ty));
  };

  const doZoom = (delta, cx, cy) => {
    const prev = scale;
    scale = clamp(scale * delta, minScale, maxScale);
    if (!(lbImg instanceof HTMLImageElement)) return;
    const rect = lbImg.getBoundingClientRect();
    const midX = cx ?? rect.left + rect.width / 2;
    const midY = cy ?? rect.top + rect.height / 2;
    const dx = midX - (rect.left + rect.width / 2);
    const dy = midY - (rect.top + rect.height / 2);
    if (scale !== prev) {
      tx -= (dx / prev) * (scale - prev);
      ty -= (dy / prev) * (scale - prev);
      clampPan();
      applyZoom();
    }
  };

  if (lbImg instanceof HTMLImageElement) {
    let dragging = false;
    let startX = 0;
    let startY = 0;

    lbImg.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        doZoom(delta, e.clientX, e.clientY);
      },
      { passive: false },
    );

    lbImg.addEventListener("pointerdown", (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1 && scale > 1) {
        dragging = true;
        startX = e.clientX - tx;
        startY = e.clientY - ty;
        lbImg.setPointerCapture?.(e.pointerId);
        lbImg.style.transition = "none";
      }
      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        pinchStartDist = Math.hypot(dx, dy);
        pinchStartScale = scale;
        pinchMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        dragging = false;
        lbImg.style.transition = "none";
      }
    });

    const endDrag = () => {
      dragging = false;
      pointers.clear();
      lbImg.style.transition = "";
    };

    lbImg.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const dist = Math.hypot(dx, dy);
        if (pinchStartDist > 0) {
          const target = clamp(pinchStartScale * (dist / pinchStartDist), minScale, maxScale);
          const factor = target / scale;
          doZoom(factor, pinchMid.x, pinchMid.y);
        }
      } else if (dragging) {
        tx = e.clientX - startX;
        ty = e.clientY - startY;
        clampPan();
        applyZoom();
      }
    });

    lbImg.addEventListener("pointerup", endDrag);
    lbImg.addEventListener("pointercancel", endDrag);
    lbImg.addEventListener("pointerleave", endDrag);
  }

  if (zoomInBtn instanceof HTMLButtonElement) {
    zoomInBtn.addEventListener("click", () => doZoom(1.15));
  }
  if (zoomOutBtn instanceof HTMLButtonElement) {
    zoomOutBtn.addEventListener("click", () => doZoom(0.85));
  }
  if (zoomResetBtn instanceof HTMLButtonElement) {
    zoomResetBtn.addEventListener("click", resetZoom);
  }
}

document.addEventListener("DOMContentLoaded", init);


