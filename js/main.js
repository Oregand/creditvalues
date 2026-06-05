/* Site interactivity for oregand.github.io
 * - Dark mode toggle (with aria-pressed/label sync, system listener)
 * - Mobile menu (with aria-expanded, Escape, outside click, link click)
 * - Smooth-scrolled anchor links (with reduced-motion respect)
 * - IntersectionObserver scroll-in animations
 * - Copilot iframe theme handshake (origin-scoped)
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initDarkMode();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initCopilotIframeHandshake();
  });

  // ----- Dark mode -----
  function initDarkMode() {
    var toggle = document.getElementById('dark-mode-toggle');
    var html = document.documentElement;

    syncToggleState();

    if (toggle) {
      toggle.addEventListener('click', function () {
        var nowDark = !html.classList.contains('dark');
        html.classList.toggle('dark', nowDark);
        try { localStorage.setItem('darkMode', String(nowDark)); } catch (e) { /* ignore */ }
        syncToggleState();
        notifyIframeOfTheme();
      });
    }

    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var systemListener = function (e) {
      var hasUserPref;
      try { hasUserPref = localStorage.getItem('darkMode') !== null; } catch (err) { hasUserPref = false; }
      if (hasUserPref) return;
      html.classList.toggle('dark', e.matches);
      syncToggleState();
      notifyIframeOfTheme();
    };
    if (media.addEventListener) media.addEventListener('change', systemListener);
    else if (media.addListener) media.addListener(systemListener);

    function syncToggleState() {
      if (!toggle) return;
      var isDark = html.classList.contains('dark');
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // ----- Mobile menu -----
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    var setOpen = function (open) {
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    btn.addEventListener('click', function () {
      setOpen(menu.classList.contains('hidden'));
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        setOpen(false);
        btn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('hidden')) return;
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });
  }

  // ----- Smooth scroll for in-page anchors -----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target;
        try { target = document.querySelector(href); } catch (err) { return; }
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
      });
    });
  }

  // ----- Scroll-in animations via IntersectionObserver -----
  function initScrollAnimations() {
    var els = document.querySelectorAll('.animate-on-scroll');
    if (!els.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('animate-fade-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ----- Copilot iframe theme handshake -----
  function notifyIframeOfTheme() {
    var iframe = document.getElementById('copilot-feed-iframe');
    if (!iframe || !iframe.contentWindow) return;
    var isDark = document.documentElement.classList.contains('dark');
    try {
      iframe.contentWindow.postMessage({ type: 'theme', dark: isDark }, window.location.origin);
    } catch (err) { /* ignore */ }
  }

  function initCopilotIframeHandshake() {
    var iframe = document.getElementById('copilot-feed-iframe');
    if (!iframe) return;
    iframe.addEventListener('load', notifyIframeOfTheme);

    window.addEventListener('message', function (event) {
      if (event.origin !== window.location.origin) return;
      var data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'iframe-height' && typeof data.height === 'number') {
        iframe.style.height = Math.max(200, data.height) + 'px';
      }
    });
  }
})();
