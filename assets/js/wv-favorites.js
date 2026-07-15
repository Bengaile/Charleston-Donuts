/**
 * wv-favorites.js
 * GBI Creative Brief No. 001 — WV Favorites Concept Page
 * --------------------------------------------------------
 * Minimal vanilla JS. Single responsibility: reveal
 * .wvf-card, .wvf-fact-card, and .wvf-vote-card elements
 * with a staggered entrance animation as the user scrolls
 * them into view, using IntersectionObserver.
 *
 * No dependencies. No framework. Degrades gracefully if
 * IntersectionObserver is unavailable (all cards become
 * visible immediately via the fallback block below).
 */

(function () {
  'use strict';

  // Selectors for animated elements
  var ANIMATED = '.wvf-card, .wvf-fact-card, .wvf-vote-card';

  // Class added when element enters viewport
  var VISIBLE_CLASS = 'wvf-visible';

  // Stagger delay between sibling cards (milliseconds)
  var STAGGER_MS = 90;

  function initAnimations () {
    var elements = document.querySelectorAll(ANIMATED);
    if (!elements.length) return;

    // Graceful fallback: if IntersectionObserver isn't supported,
    // make everything visible immediately
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
        el.classList.add(VISIBLE_CLASS);
      });
      return;
    }

    // Respect user's motion preference
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      elements.forEach(function (el) {
        el.classList.add(VISIBLE_CLASS);
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          // Stagger siblings within the same parent grid
          var siblings = Array.from(
            entry.target.parentElement.querySelectorAll(ANIMATED)
          );
          var index = siblings.indexOf(entry.target);

          setTimeout(function () {
            entry.target.classList.add(VISIBLE_CLASS);
          }, index * STAGGER_MS);

          // Stop observing once revealed
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,    // trigger when 12% of card is visible
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

}());
