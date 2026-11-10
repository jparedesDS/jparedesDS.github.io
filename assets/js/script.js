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
