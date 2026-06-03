const normalize = (value: string) => value.trim().toLowerCase();

const getParams = () => new URLSearchParams(window.location.search);

const buildUrl = (q: string) => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/?${query}` : "/";
};

const matchesItem = (item: HTMLElement, q: string) => {
  if (!q) return true;

  const haystack = [item.dataset.title, item.dataset.description, item.dataset.slug, item.dataset.tags]
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

const resetListVisibility = (list: HTMLElement) => {
  list.querySelectorAll<HTMLElement>("[data-blog-item]").forEach((item) => {
    item.hidden = false;
  });
  list.querySelectorAll<HTMLElement>("[data-blog-year]").forEach((section) => {
    section.hidden = false;
  });
  const empty = list.querySelector<HTMLElement>("[data-blog-empty]");
  const hasItems = list.querySelectorAll<HTMLElement>("[data-blog-item]").length > 0;
  if (empty) empty.hidden = hasItems;
  list.setAttribute("aria-busy", "false");
};

const applyFilters = (list: HTMLElement) => {
  const params = getParams();
  const q = normalize(params.get("q") || "");

  if (!q) {
    resetListVisibility(list);
    return;
  }

  const items = list.querySelectorAll<HTMLElement>("[data-blog-item]");
  let visible = 0;

  items.forEach((item) => {
    const show = matchesItem(item, q);
    item.hidden = !show;
    if (show) visible += 1;
  });

  list.querySelectorAll<HTMLElement>("[data-blog-year]").forEach((section) => {
    const sectionItems = section.querySelectorAll<HTMLElement>("[data-blog-item]");
    const sectionVisible = [...sectionItems].some((el) => !el.hidden);
    section.hidden = !sectionVisible;
  });

  const empty = list.querySelector<HTMLElement>("[data-blog-empty]");
  if (empty) empty.hidden = visible > 0;

  list.setAttribute("aria-busy", "false");
};

const bindSearchForm = (form: HTMLFormElement, list: HTMLElement) => {
  if (form.dataset.searchBound === "true") return;
  form.dataset.searchBound = "true";

  const input = form.querySelector<HTMLInputElement>("#blog-search");
  if (!input) return;

  const baseClearHref = form.dataset.clearHref || "/";

  const navigate = (url: string) => {
    history.pushState({}, "", url);
    applyFilters(list);
    updateClearButton(form, input);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    navigate(buildUrl(input.value.trim()));
  });

  form.querySelector<HTMLButtonElement>("[data-search-clear]")?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    navigate(buildUrl(""));
  });

  input.addEventListener("input", () => updateClearButton(form, input));

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      input.value = "";
      navigate(baseClearHref);
      input.focus();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(buildUrl(input.value.trim()));
    }
  });

  updateClearButton(form, input);
};

const syncFromUrl = () => {
  const list = document.getElementById("blog-post-list");
  const form = document.querySelector<HTMLFormElement>("[data-search-form]");
  const input = form?.querySelector<HTMLInputElement>("#blog-search");
  if (!list || !form || !input) return;

  const params = getParams();
  input.value = params.get("q")?.trim() || "";
  applyFilters(list);
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
document.addEventListener("astro:page-load", () => {
  init();
  syncFromUrl();
});
window.addEventListener("popstate", syncFromUrl);
