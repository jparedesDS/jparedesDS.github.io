/**
 * Localize the ninja-keys search modal.
 *
 * The component only ships English interface strings: the input placeholder and
 * the footer hints ("to select", "to navigate", "to close"). The localized
 * values travel in `data-*` attributes on the <ninja-keys> element from
 * `_includes/plugins/al_search_assets.liquid`, so this script stays language
 * agnostic and works for every configured language.
 *
 * Result titles, descriptions and section names are localized server-side in
 * the inline `ninja.data` script; this file only touches the UI chrome.
 */
(function () {
  "use strict";

  var ninja = document.querySelector("ninja-keys");
  if (!ninja) return;

  // The component reads its `placeholder` reactive property.
  var placeholder = ninja.dataset.placeholder;
  if (placeholder) {
    ninja.placeholder = placeholder;
  }

  var labels = [
    ["to select", ninja.dataset.select],
    ["to navigate", ninja.dataset.navigate],
    ["to close", ninja.dataset.close],
  ].filter(function (entry) {
    return entry[1];
  });

  if (labels.length === 0) return;

  // Reentrancy guard: replacing a text node fires the observer again, and the
  // callback must not run while the previous pass is still mutating the tree.
  var localizing = false;

  function localizeFooter(root) {
    if (!root || localizing) return;
    localizing = true;

    try {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var node = walker.nextNode();
      while (node) {
        var original = node.nodeValue;
        var trimmed = original.trim();

        for (var i = 0; i < labels.length; i += 1) {
          if (trimmed === labels[i][0]) {
            node.nodeValue = original.replace(labels[i][0], labels[i][1]);
            break;
          }
        }

        node = walker.nextNode();
      }
    } finally {
      localizing = false;
    }
  }

  function localizeWhenReady() {
    var root = ninja.shadowRoot;

    // Fail gracefully: without a shadow root the search still works, in English.
    if (!root) return false;

    localizeFooter(root);

    // The component renders the footer when it opens and may re-render it, so
    // keep watching instead of translating once.
    var observer = new MutationObserver(function () {
      localizeFooter(root);
    });
    observer.observe(root, { childList: true, subtree: true });

    return true;
  }

  if (!localizeWhenReady()) {
    // The custom element upgrades asynchronously (its module may still be
    // loading), so retry briefly, then give up silently.
    var attempts = 0;
    var retry = function () {
      attempts += 1;
      if (localizeWhenReady() || attempts >= 20) return;
      window.setTimeout(retry, 100);
    };
    window.setTimeout(retry, 100);
  }
})();
