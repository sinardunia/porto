const normalize = (value: string) => value.trim().toLowerCase();

const getParams = () => new URLSearchParams(window.location.search);

const buildUrl = (q: string, tag: string) => {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/?${query}` : "/";
};

const matchesItem = (item: HTMLElement, q: string, tag: string) => {
  if (tag) {
    const tags = (item.dataset.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!tags.includes(tag)) return false;
  }

  if (!q) return true;

  const haystack = [item.dataset.title, item.dataset.excerpt, item.dataset.slug, item.dataset.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
};

const updateClearButton = (form: HTMLFormElement, input: HTMLInputElement) => {
  const clearBtn = form.querySelector<HTMLButtonElement>("[data-search-clear]");
  if (!clearBtn) return;
  const hasQuery = input.value.trim().length > 0;
  clearBtn.hidden = !hasQuery;
  clearBtn.tabIndex = hasQuery ? 0 : -1;
};

const applyFilters = (list: HTMLElement) => {
  const params = getParams();
  const q = normalize(params.get("q") || "");
  const tag = normalize(params.get("tag") || "");

  const items = list.querySelectorAll<HTMLElement>("[data-blog-item]");
  let visible = 0;

  items.forEach((item) => {
    const show = matchesItem(item, q, tag);
    item.hidden = !show;
    if (show) visible += 1;
  });

  const empty = list.querySelector<HTMLElement>("[data-blog-empty]");
  if (empty) {
    empty.hidden = visible > 0;
  }

  list.setAttribute("aria-busy", "false");
};

const bindSearchForm = (form: HTMLFormElement, list: HTMLElement) => {
  if (form.dataset.searchBound === "true") return;
  form.dataset.searchBound = "true";

  const input = form.querySelector<HTMLInputElement>('input[name="q"]');
  if (!input) return;

  const tag = form.dataset.activeTag || "";
  const baseClearHref = form.dataset.clearHref || "/";

  const navigate = (url: string) => {
    history.pushState({}, "", url);
    applyFilters(list);
    updateClearButton(form, input);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = input.value.trim();
    navigate(buildUrl(q, tag));
  });

  const clearBtn = form.querySelector<HTMLButtonElement>("[data-search-clear]");
  clearBtn?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    navigate(buildUrl("", tag));
  });

  const focusBtn = form.querySelector<HTMLButtonElement>("[data-search-focus]");
  focusBtn?.addEventListener("click", () => input.focus());

  input.addEventListener("input", () => updateClearButton(form, input));

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      input.value = "";
      navigate(baseClearHref);
      input.focus();
    }
  });

  updateClearButton(form, input);
};

const init = () => {
  const list = document.getElementById("blog-post-list");
  const form = document.querySelector<HTMLFormElement>("[data-search-form]");
  if (!list || !form) return;

  applyFilters(list);
  bindSearchForm(form, list);
};

init();
document.addEventListener("astro:page-load", init);
window.addEventListener("popstate", () => {
  const list = document.getElementById("blog-post-list");
  const form = document.querySelector<HTMLFormElement>("[data-search-form]");
  const input = form?.querySelector<HTMLInputElement>('input[name="q"]');
  if (!list || !form || !input) return;

  const params = getParams();
  input.value = params.get("q")?.trim() || "";
  applyFilters(list);
  updateClearButton(form, input);
});
