// Subany palette for Mermaid diagrams.
//
// `al_charts` renders Mermaid from the bundled mermaid-setup.js, which uses
// Mermaid's own "default"/"dark" palette. This file re-renders the generated
// diagrams with the site palette, both on first load and whenever theme.js
// toggles the theme.

const subanyMermaidFontFamily = "Inter, sans-serif";

const subanyMermaidLightVariables = {
  background: "#c9ae8c",
  primaryColor: "#d6bfa0",
  primaryTextColor: "#1c1915",
  primaryBorderColor: "#b69a75",
  lineColor: "#4a4238",
  secondaryColor: "#d6bfa0",
  secondaryTextColor: "#1c1915",
  secondaryBorderColor: "#b69a75",
  tertiaryColor: "#c9ae8c",
  tertiaryTextColor: "#1c1915",
  tertiaryBorderColor: "#b69a75",
  textColor: "#1c1915",
  mainBkg: "#d6bfa0",
  nodeBorder: "#b69a75",
  clusterBkg: "#c9ae8c",
  clusterBorder: "#b69a75",
  titleColor: "#1c1915",
  edgeLabelBackground: "#c9ae8c",
  noteBkgColor: "#d6bfa0",
  noteTextColor: "#1c1915",
  noteBorderColor: "#b69a75",
  actorBkg: "#d6bfa0",
  actorTextColor: "#1c1915",
  actorBorder: "#b69a75",
  signalColor: "#4a4238",
  signalTextColor: "#1c1915",
  labelBoxBkgColor: "#d6bfa0",
  labelBoxTextColor: "#1c1915",
  labelBoxBorderColor: "#b69a75",
  loopTextColor: "#1c1915",
  activationBkgColor: "#d6bfa0",
  activationBorderColor: "#b69a75",
  sequenceNumberColor: "#1c1915",
  fontFamily: subanyMermaidFontFamily,
};

const subanyMermaidDarkVariables = {
  background: "#3a3633",
  primaryColor: "#45403c",
  primaryTextColor: "#ede3d3",
  primaryBorderColor: "#5a544f",
  lineColor: "#c0b5a4",
  secondaryColor: "#45403c",
  secondaryTextColor: "#ede3d3",
  secondaryBorderColor: "#5a544f",
  tertiaryColor: "#3a3633",
  tertiaryTextColor: "#ede3d3",
  tertiaryBorderColor: "#5a544f",
  textColor: "#ede3d3",
  mainBkg: "#45403c",
  nodeBorder: "#5a544f",
  clusterBkg: "#3a3633",
  clusterBorder: "#5a544f",
  titleColor: "#ede3d3",
  edgeLabelBackground: "#3a3633",
  noteBkgColor: "#45403c",
  noteTextColor: "#ede3d3",
  noteBorderColor: "#5a544f",
  actorBkg: "#45403c",
  actorTextColor: "#ede3d3",
  actorBorder: "#5a544f",
  signalColor: "#c0b5a4",
  signalTextColor: "#ede3d3",
  labelBoxBkgColor: "#45403c",
  labelBoxTextColor: "#ede3d3",
  labelBoxBorderColor: "#5a544f",
  loopTextColor: "#ede3d3",
  activationBkgColor: "#45403c",
  activationBorderColor: "#5a544f",
  sequenceNumberColor: "#ede3d3",
  fontFamily: subanyMermaidFontFamily,
};

window.getSubanyMermaidThemeVariables = (theme) => (theme === "dark" ? subanyMermaidDarkVariables : subanyMermaidLightVariables);

// Mermaid calls the light built-in theme "default".
let subanyMermaidThemeName = (theme) => (theme === "dark" ? "dark" : "default");

let renderSubanyMermaid = (theme) => {
  if (typeof mermaid === "undefined") {
    return;
  }

  let nodes = document.querySelectorAll(".mermaid");
  if (nodes.length === 0) {
    return;
  }

  nodes.forEach((elem) => {
    // The diagram source is kept in the hidden backup block that
    // mermaid-setup.js inserts before the generated .mermaid node.
    let backup = elem.previousSibling;
    if (!backup || !backup.childNodes || !backup.childNodes[0]) {
      return;
    }
    elem.removeAttribute("data-processed");
    elem.innerHTML = backup.childNodes[0].innerHTML;
  });

  mermaid.initialize({
    startOnLoad: false,
    theme: subanyMermaidThemeName(theme),
    themeVariables: window.getSubanyMermaidThemeVariables(theme),
  });
  mermaid.init(undefined, document.querySelectorAll(".mermaid"));
};

let subanyMermaidRendered = false;

let initSubanyMermaid = () => {
  if (subanyMermaidRendered || document.readyState !== "complete") {
    return;
  }

  // Non-Mermaid pages (and pages where the library failed to load) must never
  // reach setMermaidTheme/mermaid.initialize. Leaving the flag unset also lets
  // the `load` fallback retry if mermaid-setup.js created the nodes late.
  if (typeof mermaid === "undefined" || document.querySelector(".mermaid") === null) {
    return;
  }

  subanyMermaidRendered = true;

  let theme =
    document.documentElement.getAttribute("data-theme") || (typeof determineComputedTheme === "function" ? determineComputedTheme() : "light");

  // setMermaidTheme() re-renders with the same palette variables and also
  // attaches the d3 zoom observer to the final SVG. Only fall back to the
  // direct render when theme.js did not provide it.
  if (typeof setMermaidTheme === "function") {
    setMermaidTheme(theme);
  } else {
    renderSubanyMermaid(theme);
  }
};

// mermaid-setup.js registers its own `readystatechange` handler first, so this
// handler runs after the `.mermaid` nodes have been created. The load listener
// covers browsers where the complete event was missed before this script ran.
document.addEventListener("readystatechange", initSubanyMermaid);
window.addEventListener("load", initSubanyMermaid);
initSubanyMermaid();
