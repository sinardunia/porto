const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFullSrc(img: HTMLImageElement): string {
  if (img.currentSrc) return img.currentSrc;
  const srcset = img.getAttribute("srcset");
  if (srcset) {
    const candidates = srcset
      .split(",")
      .map((part) => {
        const bits = part.trim().split(/\s+/);
        const url = bits[0];
        const w = bits[1]?.endsWith("w") ? parseInt(bits[1], 10) : 0;
        return { url, w };
      })
      .filter((c) => c.url);
    if (candidates.length) {
      candidates.sort((a, b) => b.w - a.w);
      return candidates[0].url;
    }
  }
  return img.src;
}

function initPostLightbox() {
  const root = document.getElementById("post-lightbox");
  if (!root) return;

  const overlay = root.querySelector<HTMLElement>("[data-lightbox-overlay]");
  const panel = root.querySelector<HTMLElement>("[data-lightbox-panel]");
  const imageEl = root.querySelector<HTMLImageElement>("[data-lightbox-image]");
  const captionEl = root.querySelector<HTMLElement>("[data-lightbox-caption]");
  const counterEl = root.querySelector<HTMLElement>("[data-lightbox-counter]");
  const closeBtn = root.querySelector<HTMLButtonElement>("[data-lightbox-close]");
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-lightbox-prev]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-lightbox-next]");

  if (!overlay || !panel || !imageEl || !closeBtn || !prevBtn || !nextBtn) return;

  const scope = document.querySelector<HTMLElement>("[data-lightbox-scope]");
  if (!scope) return;

  const triggers = Array.from(scope.querySelectorAll<HTMLImageElement>("img")).filter(
    (img) => !img.closest("a") && !img.hasAttribute("data-lightbox-ignore")
  );

  if (!triggers.length) return;

  const sources = triggers.map((img) => ({
    src: img.dataset.lightboxSrc || getFullSrc(img),
    alt: img.alt || "",
    caption: img.dataset.lightboxCaption || img.alt || "",
  }));

  let index = 0;
  let zoom = 1;
  let lastFocus: HTMLElement | null = null;

  const applyZoom = () => {
    imageEl.style.transform = zoom === 1 ? "" : `scale(${zoom})`;
    imageEl.style.cursor = zoom > 1 ? "zoom-out" : "zoom-in";
  };

  function setNavState() {
    const single = sources.length <= 1;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    if (counterEl) {
      counterEl.hidden = single;
      counterEl.textContent = `${index + 1} / ${sources.length}`;
    }
  }

  function render() {
    const item = sources[index];
    zoom = 1;
    applyZoom();
    imageEl.src = item.src;
    imageEl.alt = item.alt;
    if (captionEl) {
      if (item.caption) {
        captionEl.textContent = item.caption;
        captionEl.hidden = false;
      } else {
        captionEl.textContent = "";
        captionEl.hidden = true;
      }
    }
    setNavState();
  }

  function openAt(i: number) {
    index = (i + sources.length) % sources.length;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("lightbox-open");
    render();
    closeBtn.focus();
  }

  function close() {
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("lightbox-open");
    imageEl.removeAttribute("src");
    zoom = 1;
    applyZoom();
    lastFocus?.focus();
  }

  function toggleZoom() {
    zoom = zoom === 1 ? 2 : 1;
    applyZoom();
  }

  function step(delta: number) {
    index = (index + delta + sources.length) % sources.length;
    render();
  }

  triggers.forEach((img, i) => {
    const src = img.dataset.lightboxSrc || getFullSrc(img);
    img.dataset.lightboxSrc = src;

    const open = () => openAt(i);
    img.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    if (!img.hasAttribute("tabindex")) img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", img.alt ? `View image: ${img.alt}` : "View image");
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  panel.addEventListener("click", (e) => e.stopPropagation());
  imageEl.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleZoom();
  });
  imageEl.addEventListener("wheel", (e) => {
    if (root.hidden || !e.ctrlKey) return;
    e.preventDefault();
    zoom = Math.min(3, Math.max(1, zoom + (e.deltaY < 0 ? 0.25 : -0.25)));
    applyZoom();
  }, { passive: false });

  document.addEventListener("keydown", (e) => {
    if (root.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoom = Math.min(3, zoom + 0.5);
      applyZoom();
    } else if (e.key === "-") {
      e.preventDefault();
      zoom = Math.max(1, zoom - 0.5);
      applyZoom();
    } else if (e.key === "Tab") {
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hidden && el.offsetParent !== null
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  let touchStartX = 0;
  root.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0]?.clientX ?? 0;
    },
    { passive: true }
  );
  root.addEventListener(
    "touchend",
    (e) => {
      if (root.hidden || sources.length <= 1) return;
      const touchEndX = e.changedTouches[0]?.clientX ?? 0;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < 48) return;
      step(delta > 0 ? -1 : 1);
    },
    { passive: true }
  );
}

initPostLightbox();
document.addEventListener("astro:page-load", initPostLightbox);
