"use strict";

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", function () {
    const open = sidebar.classList.toggle("active");
    sidebarBtn.setAttribute("aria-expanded", String(open));
  });
}

const themeToggle = document.querySelector("[data-theme-toggle]");

function applyTheme(theme, persist) {
  document.documentElement.dataset.theme = theme;
  if (persist) localStorage.setItem("theme", theme);
  if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

if (themeToggle) {
  applyTheme(document.documentElement.dataset.theme || "dark", false);
  themeToggle.addEventListener("click", function () {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
}

const filterButtons = Array.from(document.querySelectorAll("[data-filter-btn]"));
const filterItems = Array.from(document.querySelectorAll("[data-filter-item]"));
const filterSelect = document.querySelector("[data-select]");
const filterSelectValue = document.querySelector("[data-select-value]");
const filterSelectItems = Array.from(document.querySelectorAll("[data-select-item]"));
const validFilters = ["all", "ai-vision", "data-automation", "products", "esports"];

function labelForFilter(value) {
  const button = filterButtons.find((item) => item.dataset.filter === value);
  return button ? button.textContent.trim() : value;
}

function applyFilter(value, updateUrl) {
  const filter = validFilters.includes(value) ? value : "all";

  filterItems.forEach(function (item) {
    item.classList.toggle("active", filter === "all" || item.dataset.category === filter);
  });

  filterButtons.forEach(function (button) {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (filterSelectValue) filterSelectValue.textContent = labelForFilter(filter);

  if (updateUrl) {
    const url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);
    history.replaceState(history.state, "", url);
  }
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    applyFilter(button.dataset.filter, true);
  });
});

if (filterSelect) {
  filterSelect.addEventListener("click", function () {
    const open = filterSelect.classList.toggle("active");
    filterSelect.setAttribute("aria-expanded", String(open));
  });
}

filterSelectItems.forEach(function (button) {
  button.addEventListener("click", function () {
    applyFilter(button.dataset.value, true);
    if (filterSelect) {
      filterSelect.classList.remove("active");
      filterSelect.setAttribute("aria-expanded", "false");
    }
  });
});

const requestedFilter = new URLSearchParams(window.location.search).get("filter");
applyFilter(requestedFilter || "all", false);

const pages = Array.from(document.querySelectorAll("[data-page]"));
const tabButtons = Array.from(document.querySelectorAll("button[data-nav-link]"));

function activateTab(name, push) {
  pages.forEach(function (page) {
    page.classList.toggle("active", page.dataset.page === name);
  });
  tabButtons.forEach(function (button) {
    const active = button.dataset.target === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  if (push) history.pushState({ tab: name }, "", `#${name}`);
}

tabButtons.forEach(function (button, index) {
  button.addEventListener("click", function () {
    activateTab(button.dataset.target, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  button.addEventListener("keydown", function (event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowLeft") next = (index - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === "ArrowRight") next = (index + 1) % tabButtons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabButtons.length - 1;
    tabButtons[next].focus();
    activateTab(tabButtons[next].dataset.target, true);
  });
});

const initialTab = window.location.hash.slice(1);
activateTab(pages.some((page) => page.dataset.page === initialTab) ? initialTab : "about", false);

window.addEventListener("popstate", function () {
  const name = window.location.hash.slice(1) || "about";
  activateTab(pages.some((page) => page.dataset.page === name) ? name : "about", false);
});

const copyButton = document.querySelector("[data-copy-email]");
if (copyButton) {
  copyButton.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.email);
      const label = copyButton.querySelector("span");
      if (!label) return;
      const original = label.textContent;
      label.textContent = copyButton.dataset.copied;
      setTimeout(function () {
        label.textContent = original;
      }, 2000);
    } catch (error) {
      // Clipboard access can be denied; the mailto link remains available.
    }
  });
}
