// Open external links (and PDFs) in a new tab.
// Applies to every link in the page content, so new portfolio entries
// added to index.md are covered automatically.
(function () {
  function isExternal(link) {
    return link.hostname && link.hostname !== window.location.hostname;
  }

  function isPdf(link) {
    return /\.pdf($|\?|#)/i.test(link.pathname || '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('.content a[href]');

    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href') || '';

      // Leave in-page anchors, mail and phone links alone.
      if (href.charAt(0) === '#' || /^(mailto:|tel:)/i.test(href)) {
        return;
      }

      if (isExternal(link) || isPdf(link)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });
})();
