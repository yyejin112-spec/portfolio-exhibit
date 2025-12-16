// 세로(주차) × 가로(주차 내 페이지) 스크롤 그리드 전시
// - 세로 스크롤: 1주차 → 2주차 → …
// - 가로 스크롤: 해당 주차의 여러 장(2~3장 등)
// - 3D 느낌: 가로 스크롤 위치에 따라 카드가 rotateY/translateZ로 입체감
// - 탭/클릭: 라이트박스(확대 보기)

// 주차(시간) → 주차 안의 여러 화면(이미지) 구조
// 원하는 만큼 items를 늘리면 그리드가 자동으로 맞춰집니다.
const GROUPS = [
  {
    timestamp: "1주차",
    title: "1주차",
    items: [
      {
        title: "Page 1",
        caption: "짧은 설명(선택). 예: 아이디어 스케치와 구성 탐색.",
        src: "./assets/pages/page-01.svg",
      },
      {
        title: "Page 2",
        caption: "예: 레이아웃 실험과 동선 설계.",
        src: "./assets/pages/page-02.svg",
      },
      {
        title: "Page 3",
        caption: "예: 재료/표현 방식 비교.",
        src: "./assets/pages/page-03.svg",
      },
    ],
  },
  {
    timestamp: "2주차",
    title: "2주차",
    items: [
      {
        title: "Page 4",
        caption: "예: 최종 컨셉 확정 전 단계.",
        src: "./assets/pages/page-04.svg",
      },
    ],
  },
  {
    timestamp: "3주차",
    title: "3주차",
    items: [
      {
        title: "Page 5",
        caption: "예: 디테일 보강, 문장/표기 정리.",
        src: "./assets/pages/page-05.svg",
      },
    ],
  },
  {
    timestamp: "4주차",
    title: "4주차",
    items: [
      {
        title: "Page 6",
        caption: "예: 수정본/피드백 반영.",
        src: "./assets/pages/page-06.svg",
      },
    ],
  },
  {
    timestamp: "5주차",
    title: "5주차",
    items: [
      {
        title: "Page 7",
        caption: "예: 최종본 직전 검수.",
        src: "./assets/pages/page-07.svg",
      },
    ],
  },
  {
    timestamp: "최종",
    title: "최종",
    items: [
      {
        title: "Page 8",
        caption: "예: 최종 결과 및 회고.",
        src: "./assets/pages/page-08.svg",
      },
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
  const weeksRoot = document.getElementById("weeks");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbTs = document.getElementById("lb-ts");
  const lbTitle = document.getElementById("lb-title");
  const lbCap = document.getElementById("lb-cap");

  if (!(weeksRoot instanceof HTMLElement)) return;

  const groups = GROUPS.filter((g) => Array.isArray(g.items) && g.items.length > 0);
  if (groups.length === 0) return;

  // Render weeks (vertical) and items (horizontal)
  weeksRoot.innerHTML = groups
    .map((g, gi) => {
      const items = g.items
        .map((it, ii) => {
          const aria = `${g.timestamp} ${ii + 1}/${g.items.length} · ${it.title}`;
          return `
            <button class="cell" type="button" data-week="${gi}" data-item="${ii}" aria-label="${escHtml(
              aria,
            )}">
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
        .join("");

      return `
        <section class="week" id="week-${gi}" data-week="${gi}" aria-label="${escHtml(
        g.title,
      )}">
          <header class="week-head">
            <div class="week-title">
              <span class="stamp">${escHtml(g.timestamp)}</span>
              <strong>${escHtml(g.title)}</strong>
            </div>
            <div class="week-meta">${g.items.length}장</div>
          </header>
          <div class="row" data-week="${gi}" tabindex="0" role="group" aria-label="${escHtml(
        `${g.timestamp} 페이지 목록(가로 스크롤)`,
      )}">
            ${items}
          </div>
        </section>
      `;
    })
    .join("");

  // 3D effect for each horizontal row
  const rows = Array.from(weeksRoot.querySelectorAll(".row"));
  const rafMap = new WeakMap();

  const updateRow3D = (row) => {
    const rect = row.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const maxTilt = 36;
    const maxZ = 120;
    const minScale = 0.82;

    const cells = Array.from(row.querySelectorAll(".cell"));
    for (const cell of cells) {
      const r = cell.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const dx = (c - center) / rect.width; // approx -0.5..0.5
      const d = clamp(dx * 2.2, -1, 1); // -1..1
      const abs = Math.abs(d);

      const ry = clamp(-d * maxTilt, -55, 55);
      const z = (1 - abs) * maxZ;
      const sc = clamp(minScale + (1 - abs) * (1 - minScale), minScale, 1);
      const op = clamp(0.25 + (1 - abs) * 0.75, 0.18, 1);
      const blur = clamp(abs * 1.6, 0, 2.2);

      cell.style.setProperty("--ry", `${ry}deg`);
      cell.style.setProperty("--z", `${z}px`);
      cell.style.setProperty("--sc", String(sc));
      cell.style.setProperty("--op", String(op));
      cell.style.setProperty("--blur", `${blur}px`);
    }
  };

  const scheduleUpdate = (row) => {
    if (rafMap.get(row)) return;
    const id = requestAnimationFrame(() => {
      rafMap.delete(row);
      updateRow3D(row);
    });
    rafMap.set(row, id);
  };

  for (const row of rows) {
    // initial
    updateRow3D(row);
    row.addEventListener("scroll", () => scheduleUpdate(row), { passive: true });
  }
  window.addEventListener("resize", () => rows.forEach(updateRow3D));

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

  weeksRoot.addEventListener("click", (e) => {
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

  // Optional: arrow keys for rows (small UX boost)
  weeksRoot.addEventListener("keydown", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const row = target.closest(".row");
    if (!(row instanceof HTMLElement)) return;

    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const step = clamp(row.getBoundingClientRect().width * 0.8, 280, 520);
    row.scrollBy({ left: dir * step, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", init);


