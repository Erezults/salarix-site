/* Salarix site — language toggle (EN default), scroll reveal, counters */
(function () {
  'use strict';
  var KEY = 'salarix-lang';

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', lang);
    // swap any element that carries both translations
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val != null) el.innerHTML = val;
    });
    // swap bilingual image sources (store screenshots)
    document.querySelectorAll('img[data-src-en]').forEach(function (img) {
      var src = img.getAttribute('data-src-' + lang) || img.getAttribute('data-src-en');
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    // swap document title / meta if provided
    var t = document.querySelector('title[data-en]');
    if (t) document.title = t.getAttribute('data-' + lang) || document.title;
    // toggle active flag state
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    applyLang(saved === 'he' || saved === 'en' ? saved : 'en'); // default EN
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (el.getAttribute('data-dec') | 0);
    var dur = 1500, start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window)) { nums.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  // animate the hero chart line drawing in
  function initChart() {
    document.querySelectorAll('.fc-line').forEach(function (path) {
      try {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        requestAnimationFrame(function () {
          path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.22,1,.36,1) .3s';
          path.style.strokeDashoffset = '0';
        });
      } catch (e) {}
    });
  }

  // store-screenshot placeholders: frames start as labeled placeholders (.ph)
  // and reveal the image only once it actually loads
  function initShots() {
    document.querySelectorAll('.canvas-shot img').forEach(function (img) {
      var fig = img.closest('.canvas-shot');
      if (!fig) return;
      function ok() { fig.classList.remove('ph'); }
      function bad() { fig.classList.add('ph'); }
      img.addEventListener('load', ok);
      img.addEventListener('error', bad);
      if (img.complete) (img.naturalWidth > 0 ? ok : bad)();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLang(); initReveal(); initCounters(); initChart(); initShots();
    document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  });
})();
