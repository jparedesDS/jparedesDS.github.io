(function () {
  'use strict';
  if (window.__gaConsentInit) return;
  window.__gaConsentInit = true;
  var script = document.currentScript;
  if (!script) return;
  var id = script.getAttribute('data-ga');
  if (!id) return;
  var privacy = script.getAttribute('data-privacy') || '';
  var cookieDomain = script.getAttribute('data-cookie-domain') || '';
  var KEY = 'ga_consent_v1';

  var T = {
    en: { text: 'We use Google Analytics cookies to understand how this site is used. You can accept or decline.', accept: 'Accept', reject: 'Decline', privacy: 'Privacy' },
    es: { text: 'Usamos cookies de Google Analytics para entender cómo se usa este sitio. Puedes aceptarlas o rechazarlas.', accept: 'Aceptar', reject: 'Rechazar', privacy: 'Privacidad' },
    pt: { text: 'Usamos cookies do Google Analytics para entender como este site é usado. Você pode aceitar ou recusar.', accept: 'Aceitar', reject: 'Recusar', privacy: 'Privacidade' },
    fr: { text: 'Nous utilisons des cookies Google Analytics pour comprendre comment ce site est utilisé. Vous pouvez accepter ou refuser.', accept: 'Accepter', reject: 'Refuser', privacy: 'Confidentialité' },
    de: { text: 'Wir verwenden Google-Analytics-Cookies, um zu verstehen, wie diese Website genutzt wird. Du kannst sie akzeptieren oder ablehnen.', accept: 'Akzeptieren', reject: 'Ablehnen', privacy: 'Datenschutz' },
    it: { text: 'Usiamo cookie di Google Analytics per capire come viene utilizzato questo sito. Puoi accettarli o rifiutarli.', accept: 'Accetta', reject: 'Rifiuta', privacy: 'Privacy' },
    ja: { text: 'このサイトの利用状況を把握するために Google Analytics の Cookie を使用します。同意または拒否できます。', accept: '同意する', reject: '拒否する', privacy: 'プライバシー' },
    ko: { text: '이 사이트의 사용 현황을 파악하기 위해 Google Analytics 쿠키를 사용합니다. 동의하거나 거부할 수 있습니다.', accept: '동의', reject: '거부', privacy: '개인정보' },
    zh: { text: '我们使用 Google Analytics Cookie 来了解网站的使用情况。你可以接受或拒绝。', accept: '接受', reject: '拒绝', privacy: '隐私' },
  };

  var lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
  var t =
    lang.indexOf('pt') === 0 ? T.pt :
    lang.indexOf('zh') === 0 ? T.zh :
    lang.indexOf('ja') === 0 ? T.ja :
    lang.indexOf('ko') === 0 ? T.ko :
    lang.indexOf('fr') === 0 ? T.fr :
    lang.indexOf('de') === 0 ? T.de :
    lang.indexOf('it') === 0 ? T.it :
    lang.indexOf('es') === 0 ? T.es :
    T.en;

  var choice = null;
  try {
    choice = localStorage.getItem(KEY);
  } catch (e) {
    /* storage blocked */
  }
  if (!choice) {
    var match = document.cookie.match(/(?:^|; )ga_consent=(granted|denied)/);
    if (match) {
      choice = match[1];
      try {
        localStorage.setItem(KEY, choice);
      } catch (e) {
        /* ignore */
      }
    }
  }

  function load() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    gtag('config', id, { anonymize_ip: true });
  }

  if (choice === 'granted') {
    load();
    return;
  }
  if (choice === 'denied') return;

  function decide(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* ignore */
    }
    var cookie = 'ga_consent=' + value + '; Max-Age=31536000; Path=/; SameSite=Lax';
    if (location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
    if (cookieDomain) document.cookie = cookie + '; Domain=' + cookieDomain;
    var box = document.getElementById('ga-consent');
    if (box) box.parentNode.removeChild(box);
    if (value === 'granted') load();
  }

  function build() {
    var box = document.createElement('div');
    box.id = 'ga-consent';
    box.className = 'ga-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookies');

    var p = document.createElement('p');
    p.appendChild(document.createTextNode(t.text + ' '));
    if (privacy) {
      var a = document.createElement('a');
      a.href = privacy;
      a.textContent = t.privacy;
      p.appendChild(a);
    }

    var buttons = document.createElement('div');
    buttons.className = 'ga-consent-btns';

    var reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = t.reject;
    reject.addEventListener('click', function () {
      decide('denied');
    });

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'primary';
    accept.textContent = t.accept;
    accept.addEventListener('click', function () {
      decide('granted');
    });

    buttons.appendChild(reject);
    buttons.appendChild(accept);
    box.appendChild(p);
    box.appendChild(buttons);
    document.body.appendChild(box);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);

  window.gaConsentReset = function () {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
    window.location.reload();
  };
})();
