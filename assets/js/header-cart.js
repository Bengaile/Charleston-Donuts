(function () {
  'use strict';

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem('dc_cart') || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function itemCount() {
    return Object.keys(readCart()).reduce(function (total, key) {
      var row = readCart()[key] || {};
      return total + Math.max(0, Number(row.qty) || 0);
    }, 0);
  }

  function updateBadge() {
    var button = document.getElementById('dc-global-cart-launcher');
    var badge = document.getElementById('dc-global-cart-count');
    if (!button || !badge) return;
    var count = itemCount();
    badge.textContent = count > 99 ? '99+' : String(count);
    button.classList.toggle('is-empty', count === 0);
    button.setAttribute(
      'aria-label',
      count === 1 ? 'Open cart with 1 item' : 'Open cart with ' + count + ' items'
    );
  }

  function openCart() {
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    if (page === 'menu.html' && typeof window.openMenuCart === 'function') {
      window.openMenuCart();
      return;
    }

    if (page === 'order.html') {
      var target = document.querySelector('.cart-sidebar') ||
                   document.getElementById('checkout-section') ||
                   document.getElementById('mobile-form-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    location.href = 'menu.html?openCart=1';
  }

  function bind() {
    var button = document.getElementById('dc-global-cart-launcher');
    if (!button) return;

    var touched = false;
    button.addEventListener('touchend', function (event) {
      touched = true;
      event.preventDefault();
      event.stopPropagation();
      openCart();
      setTimeout(function () { touched = false; }, 450);
    }, { passive: false });

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!touched) openCart();
    });

    updateBadge();
  }

  document.addEventListener('DOMContentLoaded', bind);
  window.addEventListener('pageshow', updateBadge);
  window.addEventListener('storage', updateBadge);
  window.addEventListener('dc-cart-updated', updateBadge);

  /* The Menu page updates localStorage in the same tab; refresh the badge promptly. */
  setInterval(updateBadge, 750);
})();
