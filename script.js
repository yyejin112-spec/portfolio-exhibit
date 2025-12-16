const STORAGE_KEY = "portfolio_theme";

function setTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    const pressed = theme === "light";
    const btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", String(pressed));
  } else {
    delete document.documentElement.dataset.theme;
    localStorage.removeItem(STORAGE_KEY);
  }
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }
  // Default: system
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  setTheme(prefersLight ? "light" : "dark");
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    menu.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.dataset.open === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close when clicking a link
  menu.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Ensure initial state
  closeMenu();
}

function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  // Label based on current theme
  const updateLabel = () => {
    const theme = document.documentElement.dataset.theme;
    if (theme === "light") btn.textContent = "라이트";
    else if (theme === "dark") btn.textContent = "다크";
    else btn.textContent = "테마";
  };

  updateLabel();

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    updateLabel();
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!(form instanceof HTMLFormElement)) return;

  const status = form.querySelector(".form-status");
  const setStatus = (msg) => {
    if (status) status.textContent = msg;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const text = `이름: ${name}\n이메일: ${email}\n\n메시지:\n${message}\n`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("복사 완료! 이메일/DM에 붙여넣어 보내주세요.");
    } catch {
      setStatus("복사에 실패했어요. 아래 내용을 수동으로 복사해주세요.");
      // Fallback: select textarea content
      const textarea = form.querySelector('textarea[name="message"]');
      if (textarea instanceof HTMLTextAreaElement) textarea.focus();
    }
  });

  form.addEventListener("reset", () => {
    setStatus("");
  });
}

function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initThemeToggle();
  initNav();
  initContactForm();
  initYear();
});


