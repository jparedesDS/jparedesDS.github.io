// Code blocks that overflow horizontally are scrollable regions. Without a tab
// stop, keyboard users cannot reach them to scroll. Axe flags the scrollable
// <pre> as an accessibility failure, so make every code block focusable.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre").forEach((pre) => {
    if (!pre.hasAttribute("tabindex")) {
      pre.setAttribute("tabindex", "0");
    }
  });
});
