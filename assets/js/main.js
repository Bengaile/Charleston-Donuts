/* =========================================================
   Donut Connection Charleston — main.js
   Shared behavior across all pages.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile nav toggle ----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var isOpen = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu when a link is tapped (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }

  // ---- Highlight current page in nav ----
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.style.color = 'var(--raspberry)';
      link.style.textDecoration = 'underline';
    }
  });

  // ---- Auto-update footer year ----
  document.querySelectorAll('.auto-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Basic "thank you" UX for Formspree forms ----
  // NOTE: Forms post directly to Formspree (action="https://formspree.io/f/REPLACE_WITH_FORM_ID").
  // This just gives a friendly inline confirmation if JS fetch is used instead of a full page reload.
  // To keep this a robust, no-build static site, forms submit normally (full page POST) by default,
  // and Formspree will redirect to a thank-you page if one is configured in the Formspree dashboard,
  // or show its own default confirmation. Replace REPLACE_WITH_FORM_ID in each form's action attribute.

  // ---- Simple upload-placeholder label update ----
  document.querySelectorAll('input[type="file"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var label = input.closest('.field') ? input.closest('.field').querySelector('.hint') : null;
      if (label && input.files && input.files.length) {
        label.textContent = input.files.length + ' file(s) selected: ' + input.files[0].name;
      }
    });
  });

});
