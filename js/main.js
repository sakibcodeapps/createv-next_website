/* ==========================================================
   CREATEV NEXT — main.js  (no dependencies)
   ========================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------
     CONFIG — edit here
     ------------------------------------------------------ */
  var CONFIG = {
    whatsappNumber: '8801342920791',
    // Leave empty to share the page's current URL (the real deployed address).
    // Set to e.g. 'https://your-domain.com' only once you have a real domain.
    shareUrl: '',
    // Add your own poster images here. Example:
    // { src: 'assets/posters/poster-01.jpg', alt: 'Poster for ...', title: 'Poster title' }
    posters: [
      { src: 'https://i.postimg.cc/0NHMT2VS/9ecbf61af70944831c1df35a5a214ad0.jpg', alt: 'CREATEV NEXT poster design 1', title: 'Poster Design 01' },
      { src: 'https://i.postimg.cc/26sq59RH/ea8046278e16d9acdd1b2b50a4642fc9.jpg', alt: 'CREATEV NEXT poster design 2', title: 'Poster Design 02' },
      { src: 'https://i.postimg.cc/j2yDn6RT/d81cc1eb435bb85d98851fa5f60e5d1c.jpg', alt: 'CREATEV NEXT poster design 3', title: 'Poster Design 03' }
    ]
  };

  var MIN_POSTER_SLOTS = 3; // placeholders fill up to this many tiles

  /* ------------------------------------------------------
     Helpers
     ------------------------------------------------------ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ------------------------------------------------------
     WhatsApp links with prefilled messages
     ------------------------------------------------------ */
  var GREETING = 'Assalamu Alaikum, CREATEV NEXT! ';

  function waUrl(message) {
    return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
  }

  function messageFor(el) {
    var type = el.getAttribute('data-wa');
    if (type === 'plan') {
      return GREETING + 'I would like to order the ' + el.getAttribute('data-plan') +
        ' — ' + el.getAttribute('data-qty') + ' Ad Videos for ' + el.getAttribute('data-price') + '. ' +
        'Please share the next steps. I understand the final requirements and delivery schedule will be agreed before the order is confirmed. Thank you!';
    }
    if (type === 'service') {
      return GREETING + 'I’m interested in your ' + el.getAttribute('data-service') +
        ' service. Please share the details and next steps.';
    }
    if (type === 'motion') {
      return GREETING + 'I watched your motion graphics showcase and would like to discuss my project. Please share the details and next steps.';
    }
    return GREETING + 'I’m interested in your creative services. Please share the details and help me choose the right service.';
  }

  $$('[data-wa]').forEach(function (a) {
    a.href = waUrl(messageFor(a));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------ */
  var nav = $('#main-nav');
  var menuBtn = $('#menu-toggle');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* Active nav link on scroll */
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('.main-nav ul a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
          links[en.target.id].classList.add('active');
          links[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) navObs.observe(s); });
  }

  /* ------------------------------------------------------
     Video players — nothing loads until the visitor presses play
     ------------------------------------------------------ */
  var players = [];

  function setToggle(btn, playing, title) {
    if (!btn) return;
    var label = btn.querySelector('span');
    var use = btn.querySelector('use');
    if (label) label.textContent = playing ? 'Pause' : 'Play';
    if (use) use.setAttribute('href', playing ? '#i-pause' : '#i-play');
    btn.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + title);
  }

  function initPlayer(box) {
    var video = $('video', box);
    var playBtn = $('.vplay', box);
    var err = $('.verror', box);
    var title = box.getAttribute('data-title') || 'video';
    var src = box.getAttribute('data-video');
    var scope = box.closest('.vcard, .motion-video, .hero-card');
    var toggle = scope ? $('.vtoggle', scope) : null;
    var loadedSrc = false;

    video.setAttribute('aria-label', title);

    function ensureSrc() {
      if (loadedSrc) return;
      video.src = src;
      video.preload = 'auto';
      loadedSrc = true;
    }

    function start() {
      err.hidden = true;
      ensureSrc();
      box.classList.add('loading');
      var p = video.play();
      if (p && p.catch) {
        p.catch(function (e) {
          if (e && e.name === 'NotAllowedError') { box.classList.remove('loading'); }
        });
      }
    }

    function toggleVideo() {
      if (video.paused) start(); else video.pause();
    }

    playBtn.addEventListener('click', start);
    if (toggle) toggle.addEventListener('click', toggleVideo);

    video.addEventListener('playing', function () {
      box.classList.remove('loading');
      box.classList.add('playing', 'loaded');
      video.controls = true; // native play / pause / seek / volume controls
      setToggle(toggle, true, title);
      players.forEach(function (o) { if (o.video !== video && !o.video.paused) o.video.pause(); });
    });
    video.addEventListener('play', function () { setToggle(toggle, true, title); });
    video.addEventListener('pause', function () { box.classList.remove('playing'); setToggle(toggle, false, title); });
    video.addEventListener('ended', function () { setToggle(toggle, false, title); });
    video.addEventListener('error', function () {
      box.classList.remove('loading', 'playing', 'loaded');
      video.controls = false;
      loadedSrc = false;
      video.removeAttribute('src');
      video.load();
      err.hidden = false;
      setToggle(toggle, false, title);
    });

    players.push({ video: video });
  }
  $$('.vplayer').forEach(initPlayer);

  /* ------------------------------------------------------
     Poster gallery + lightbox
     ------------------------------------------------------ */
  var grid = $('#poster-grid');
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbCap = $('#lb-cap');
  var lbPrev = $('#lb-prev');
  var lbNext = $('#lb-next');
  var current = 0;
  var lastFocus = null;

  function renderPosters() {
    var items = CONFIG.posters || [];
    items.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'poster';
      b.setAttribute('aria-label', 'View poster: ' + (p.title || p.alt || ('Poster ' + (i + 1))));
      var img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || p.title || ('Poster ' + (i + 1));
      img.loading = 'lazy';
      img.decoding = 'async';
      b.appendChild(img);
      if (p.title) {
        var t = document.createElement('span');
        t.className = 'poster-title';
        t.textContent = p.title;
        b.appendChild(t);
      }
      b.addEventListener('click', function () { openLightbox(i, b); });
      grid.appendChild(b);
    });
    for (var n = items.length; n < MIN_POSTER_SLOTS; n++) {
      var ph = document.createElement('div');
      ph.className = 'poster placeholder';
      ph.innerHTML = '<svg class="ic" width="34" height="34" aria-hidden="true"><use href="#i-image"/></svg>' +
        '<strong>Your poster here</strong><span>Placeholder — add your poster image in js/main.js</span>';
      grid.appendChild(ph);
    }
  }

  function showPoster(i) {
    var items = CONFIG.posters;
    current = (i + items.length) % items.length;
    var p = items[current];
    lbImg.src = p.src;
    lbImg.alt = p.alt || p.title || ('Poster ' + (current + 1));
    lbCap.textContent = p.title || '';
    var multi = items.length > 1;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
  }
  function openLightbox(i, opener) {
    lastFocus = opener;
    showPoster(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    $('#lb-close').focus();
  }
  function closeLightbox() {
    if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  }
  lb.addEventListener('close', function () { lbImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); });
  $('#lb-close').addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { showPoster(current - 1); });
  lbNext.addEventListener('click', function () { showPoster(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && !lbPrev.hidden) showPoster(current - 1);
    if (e.key === 'ArrowRight' && !lbNext.hidden) showPoster(current + 1);
  });
  renderPosters();

  /* ------------------------------------------------------
     Share website (Web Share API → clipboard fallback)
     ------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  $('#share-btn').addEventListener('click', function () {
    var url = CONFIG.shareUrl || (location.origin + location.pathname);
    if (location.protocol === 'file:') url = location.href;
    var data = { title: 'CREATEV NEXT — Create Beyond Ordinary', text: 'Check out CREATEV NEXT — video ads, motion graphics, video editing and poster design.', url: url };
    if (navigator.share) {
      navigator.share(data).catch(function (e) {
        if (e && e.name === 'AbortError') return; // user closed the share sheet
        copyText(url).then(function () { toast('Website link copied to clipboard.'); },
                           function () { toast('Could not share or copy. Please copy the address from your browser.'); });
      });
    } else {
      copyText(url).then(function () { toast('Website link copied to clipboard.'); },
                         function () { toast('Could not copy the link. Please copy the address from your browser.'); });
    }
  });

  /* ------------------------------------------------------
     Back to top
     ------------------------------------------------------ */
  var topBtn = $('#to-top');
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      topBtn.hidden = window.scrollY < 700;
      ticking = false;
    });
  }, { passive: true });
  topBtn.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------
     Reveal on scroll (light, one-time)
     ------------------------------------------------------ */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revObs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.section-head, .service, .vcard, .plan, .about-grid > *, .contact-card').forEach(function (el) {
      el.classList.add('reveal');
      revObs.observe(el);
    });
  }

  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
