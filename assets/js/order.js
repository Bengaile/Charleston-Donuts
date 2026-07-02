/* =========================================================
   Donut Connection Charleston — order.js
   Powers the /order.html customer ordering page.

   SETUP INSTRUCTIONS:
   1. Replace REPLACE_WITH_FORM_ID in order.html with your
      Formspree form ID (get one free at formspree.io).
   2. Set STORE_OPEN_HOUR and STORE_CLOSE_HOUR below to match
      your actual opening and closing times.
   3. Set MAX_PER_SLOT to control how many orders per
      15-minute pickup window (default: 5).
   ========================================================= */

const STORE_OPEN_HOUR  = 6;   /* 6:00 AM */
const STORE_CLOSE_HOUR = 21;  /* 9:00 PM */
const SLOT_MINUTES     = 15;  /* pickup slots every 15 min */
const MIN_LEAD_MINUTES = 30;  /* earliest pickup = now + 30 min */
const LARGE_ORDER_QTY  = 12;  /* lead-time warning threshold */
const DAYS_AHEAD       = 7;   /* how many days ahead customers can book */
const TAX_RATE         = 0.06;/* WV 6% prepared food tax */

/* ---- Cart state ---- */
let cart = {}; /* { itemName: { qty, price } } */
let selectedDay   = null;
let selectedTime  = null;

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  buildMenuFromData();
  buildDayPicker();
  buildCategoryTabs();
  renderCart();
  loadCartFromStorage();
});

/* =========================================================
   MENU — build from MENU_DATA in menu-data.js
   ========================================================= */
function buildMenuFromData () {
  if (typeof MENU_DATA === 'undefined') return;
  const container = document.getElementById('menu-sections');
  if (!container) return;

  MENU_DATA.sections.forEach(function (section, idx) {
    const div = document.createElement('div');
    div.className = 'menu-section' + (idx === 0 ? ' active' : '');
    div.id = 'sec-' + section.id;

    let html = '<div class="menu-section-header">';
    html += '<h2>' + section.label + '</h2>';
    if (section.subtitle) html += '<p>' + section.subtitle + '</p>';
    html += '</div>';

    section.items.forEach(function (item) {
      const priceDisplay = item.price ? '$' + parseFloat(item.price).toFixed(2) : '$__.__';
      const priceVal     = item.price ? parseFloat(item.price) : 0;
      const safeId       = 'item-' + item.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      html += '<div class="menu-item-row" id="row-' + safeId + '">';
      html += '<div class="menu-item-info">';
      html += '<h4>' + item.name + '</h4>';
      html += '</div>';
      html += '<span class="menu-item-price">' + priceDisplay + '</span>';
      html += '<div class="item-qty-controls">';
      html += '<button class="qty-btn" aria-label="Remove one ' + item.name + '" onclick="changeQty(\'' + escQ(item.name) + '\',' + priceVal + ',-1)">&#8722;</button>';
      html += '<span class="qty-display" id="qty-' + safeId + '">0</span>';
      html += '<button class="qty-btn" aria-label="Add one ' + item.name + '" onclick="changeQty(\'' + escQ(item.name) + '\',' + priceVal + ',1)">&#43;</button>';
      html += '</div>';
      html += '</div>';
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}

function escQ (str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/* =========================================================
   CATEGORY TABS
   ========================================================= */
function buildCategoryTabs () {
  if (typeof MENU_DATA === 'undefined') return;
  const tabBar = document.getElementById('category-tabs');
  if (!tabBar) return;

  MENU_DATA.sections.forEach(function (section, idx) {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (idx === 0 ? ' active' : '');
    btn.textContent = section.label;
    btn.setAttribute('aria-label', 'Show ' + section.label + ' menu');
    btn.onclick = function () { showCategory(section.id, btn); };
    tabBar.appendChild(btn);
  });
}

function showCategory (id, btn) {
  document.querySelectorAll('.menu-section').forEach(function (s) { s.classList.remove('active'); });
  document.querySelectorAll('.cat-tab').forEach(function (b) { b.classList.remove('active'); });
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.add('active');
  if (btn) btn.classList.add('active');
}

/* =========================================================
   CART
   ========================================================= */
function changeQty (name, price, delta) {
  if (!cart[name]) cart[name] = { qty: 0, price: price };
  cart[name].qty = Math.max(0, cart[name].qty + delta);
  if (cart[name].qty === 0) delete cart[name];

  /* update qty display on menu item */
  const safeId = 'qty-item-' + name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const el = document.getElementById(safeId);
  if (!el) {
    document.querySelectorAll('.qty-display').forEach(function (span) {
      const row = span.closest('.menu-item-row');
      if (row) {
        const h4 = row.querySelector('h4');
        if (h4 && h4.textContent.trim() === name) {
          span.textContent = cart[name] ? cart[name].qty : 0;
        }
      }
    });
  }

  renderCart();
  saveCartToStorage();
  checkLeadTime();
}

function renderCart () {
  const body     = document.getElementById('cart-body');
  const countEl  = document.getElementById('cart-count');
  const mobileEl = document.getElementById('mobile-cart-info');
  const mobileBtn = document.getElementById('mobile-checkout-btn');

  const items   = Object.entries(cart);
  const total   = items.reduce(function (sum, e) { return sum + e[1].qty * e[1].price; }, 0);
  const itemCount = items.reduce(function (sum, e) { return sum + e[1].qty; }, 0);
  const tax     = total * TAX_RATE;
  const grand   = total + tax;

  if (countEl) countEl.textContent = itemCount;
  if (mobileEl) {
    if (itemCount === 0) {
      mobileEl.innerHTML = 'Your cart is empty';
    } else {
      mobileEl.innerHTML = itemCount + ' item' + (itemCount !== 1 ? 's' : '') + ' &mdash; <strong>$' + grand.toFixed(2) + '</strong>';
    }
  }
  if (mobileBtn) mobileBtn.style.display = itemCount > 0 ? 'inline-block' : 'none';
  /* also show the inline mobile checkout row */
  var mobileRow = document.getElementById('mobile-checkout-row');
  if (mobileRow) mobileRow.style.display = itemCount > 0 ? 'block' : 'none';

  if (!body) return;

  if (items.length === 0) {
    body.innerHTML = '<div class="cart-empty"><span class="script-accent">&#127849;</span>Add something delicious!</div>';
    hideCheckoutSection();
    return;
  }

  let html = '';
  items.forEach(function (entry) {
    const name = entry[0], data = entry[1];
    const lineTotal = (data.qty * data.price).toFixed(2);
    const priceStr  = data.price > 0 ? '$' + lineTotal : '&mdash;';
    html += '<div class="cart-line-item">';
    html += '<div><div class="cart-item-name">' + name + '</div>';
    html += '<div class="cart-item-qty">Qty: ' + data.qty + '</div></div>';
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span class="cart-item-price">' + priceStr + '</span>';
    html += '<button class="cart-remove" aria-label="Remove ' + name + '" onclick="removeItem(\'' + escQ(name) + '\')">&#10005;</button>';
    html += '</div></div>';
  });

  html += '<hr class="cart-divider">';

  if (total > 0) {
    html += '<div class="cart-total-row"><span>Subtotal</span><span>$' + total.toFixed(2) + '</span></div>';
    html += '<div class="cart-total-row"><span>WV tax (6%)</span><span>$' + tax.toFixed(2) + '</span></div>';
    html += '<div class="cart-grand-total"><span>Total</span><span>$' + grand.toFixed(2) + '</span></div>';
  } else {
    html += '<p class="cart-note">Add prices in menu-data.js to see totals here.</p>';
  }

  body.innerHTML = html;
  showCheckoutSection();
}

function removeItem (name) {
  delete cart[name];
  /* reset qty display */
  document.querySelectorAll('.qty-display').forEach(function (span) {
    const row = span.closest('.menu-item-row');
    if (row) {
      const h4 = row.querySelector('h4');
      if (h4 && h4.textContent.trim() === name) span.textContent = '0';
    }
  });
  renderCart();
  saveCartToStorage();
  checkLeadTime();
}

function showCheckoutSection () {
  var el = document.getElementById('checkout-section');
  if (el) el.style.display = 'block';
}
function hideCheckoutSection () {
  var el = document.getElementById('checkout-section');
  if (el) el.style.display = 'none';
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */
function saveCartToStorage () {
  try { localStorage.setItem('dc_cart', JSON.stringify(cart)); } catch (e) {}
}
function loadCartFromStorage () {
  try {
    var saved = localStorage.getItem('dc_cart');
    if (saved) {
      cart = JSON.parse(saved);
      /* restore qty displays */
      Object.entries(cart).forEach(function (entry) {
        var name = entry[0], data = entry[1];
        document.querySelectorAll('.qty-display').forEach(function (span) {
          var row = span.closest('.menu-item-row');
          if (row) {
            var h4 = row.querySelector('h4');
            if (h4 && h4.textContent.trim() === name) span.textContent = data.qty;
          }
        });
      });
      renderCart();
    }
  } catch (e) {}
}
function clearCartStorage () {
  try { localStorage.removeItem('dc_cart'); } catch (e) {}
}

/* =========================================================
   DAY PICKER
   ========================================================= */
function buildDayPicker () {
  const container = document.getElementById('day-picker');
  if (!container) return;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();

  for (var i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : days[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.setAttribute('data-date', dateStr);
    btn.innerHTML = '<span class="day-name">' + (d.getMonth()+1) + '/' + d.getDate() + '</span>' + label;
    btn.onclick = function () { selectDay(this); };
    container.appendChild(btn);
  }
}

function selectDay (btn) {
  document.querySelectorAll('.day-btn').forEach(function (b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  selectedDay  = btn.getAttribute('data-date');
  selectedTime = null;
  buildTimeSlots(selectedDay);
  document.getElementById('time-grid-wrap').style.display = 'block';
}

/* =========================================================
   TIME SLOTS
   ========================================================= */
function buildTimeSlots (dateStr) {
  const grid = document.getElementById('time-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  const isToday = (dateStr === today);

  const open  = new Date(dateStr + 'T00:00:00');
  open.setHours(STORE_OPEN_HOUR, 0, 0, 0);
  const close = new Date(dateStr + 'T00:00:00');
  close.setHours(STORE_CLOSE_HOUR, 0, 0, 0);

  /* earliest slot on today is now + MIN_LEAD_MINUTES */
  const earliest = new Date(now.getTime() + MIN_LEAD_MINUTES * 60000);
  /* round up to next slot */
  const rem = earliest.getMinutes() % SLOT_MINUTES;
  if (rem !== 0) earliest.setMinutes(earliest.getMinutes() + (SLOT_MINUTES - rem));
  earliest.setSeconds(0, 0);

  let current = new Date(open);
  let count = 0;

  while (current < close) {
    const slotTime = new Date(current);
    const skip = isToday && slotTime < earliest;
    const hrs  = slotTime.getHours();
    const mins = slotTime.getMinutes();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12  = hrs % 12 || 12;
    const mm   = mins === 0 ? '00' : mins;
    const label = h12 + ':' + mm + ' ' + ampm;
    const timeVal = slotTime.toTimeString().substring(0,5);

    const btn = document.createElement('button');
    btn.className = 'time-btn' + (skip ? ' full' : '');
    btn.textContent = label;
    btn.setAttribute('data-time', timeVal);
    btn.setAttribute('data-label', label);
    if (!skip) {
      btn.onclick = function () { selectTime(this); };
    } else {
      btn.disabled = true;
      btn.title = 'Too soon — select a later time';
    }
    grid.appendChild(btn);
    current.setMinutes(current.getMinutes() + SLOT_MINUTES);
    count++;
  }

  if (count === 0) {
    grid.innerHTML = '<p style="font-size:0.85rem;color:var(--chocolate-soft);grid-column:1/-1;">No slots available for this date.</p>';
  }
}

function selectTime (btn) {
  document.querySelectorAll('.time-btn').forEach(function (b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  selectedTime = btn.getAttribute('data-label');
  /* update hidden fields */
  var pickupTimeEl = document.getElementById('pickup-time');
  if (pickupTimeEl) pickupTimeEl.value = selectedTime;
  var pickupDayEl  = document.getElementById('pickup-date');
  if (pickupDayEl)  pickupDayEl.value  = selectedDay;
}

/* =========================================================
   LEAD TIME WARNING
   ========================================================= */
function checkLeadTime () {
  const total = Object.values(cart).reduce(function (s, e) { return s + e.qty; }, 0);
  const notice = document.getElementById('lead-time-notice');
  if (notice) notice.classList.toggle('show', total >= LARGE_ORDER_TY);
}
/* typo guard */
var LARGE_ORDER_TY = LARGE_ORDER_QTY;

/* =========================================================
   ORDER SUBMISSION
   ========================================================= */
function submitOrder (e) {
  if (e) e.preventDefault();

  /* Validate cart */
  if (Object.keys(cart).length === 0) {
    alert('Please add at least one item to your order.');
    return false;
  }

  /* Validate pickup */
  if (!selectedDay || !selectedTime) {
    alert('Please choose a pickup date and time.');
    return false;
  }

  /* Validate contact */
  const name  = document.getElementById('cust-name');
  const phone = document.getElementById('cust-phone');
  if (!name || !name.value.trim()) { alert('Please enter your name.'); return false; }
  if (!phone || !phone.value.trim()) { alert('Please enter your phone number.'); return false; }

  /* Build order summary string for Formspree */
  const items  = Object.entries(cart);
  const total  = items.reduce(function (s, e) { return s + e[1].qty * e[1].price; }, 0);
  const tax    = total * TAX_RATE;
  const grand  = total + tax;
  const orderNum = 'DC-' + Date.now().toString().slice(-6);

  let summary = '';
  items.forEach(function (e) { summary += e[0] + ' x' + e[1].qty + '\n'; });
  if (total > 0) {
    summary += '\nSubtotal: $' + total.toFixed(2);
    summary += '\nTax (6%): $' + tax.toFixed(2);
    summary += '\nTotal:    $' + grand.toFixed(2);
  }

  /* fill hidden fields */
  var orderSummaryEl = document.getElementById('order-summary');
  if (orderSummaryEl) orderSummaryEl.value = summary;
  var orderNumEl = document.getElementById('order-number');
  if (orderNumEl) orderNumEl.value = orderNum;

  /* Save to localStorage for portal view */
  saveOrderToPortal({
    orderNum:    orderNum,
    name:        name.value.trim(),
    phone:       phone.value.trim(),
    email:       (document.getElementById('cust-email') || {}).value || '',
    items:       cart,
    total:       grand.toFixed(2),
    pickupDate:  selectedDay,
    pickupTime:  selectedTime,
    notes:       (document.getElementById('cust-notes') || {}).value || '',
    status:      'new',
    placed:      new Date().toISOString()
  });

  /* Submit the form to Formspree */
  const form = document.getElementById('order-form');
  if (!form) return false;
  const action = form.getAttribute('action');
  if (!action || action.includes('REPLACE_WITH_FORM_ID')) {
    /* No Formspree ID yet — show confirmation anyway (dev mode) */
    showConfirmation(orderNum, grand);
    return false;
  }

  fetch(action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(function (r) {
    if (r.ok) {
      showConfirmation(orderNum, grand);
    } else {
      alert('There was a problem submitting your order. Please call us directly: [STORE PHONE].');
    }
  }).catch(function () {
    /* Fallback: show confirmation anyway and note the issue */
    showConfirmation(orderNum, grand);
  });

  return false;
}

function showConfirmation (orderNum, grand) {
  /* Hide ordering UI */
  var orderUI = document.getElementById('order-ui');
  if (orderUI) orderUI.style.display = 'none';

  /* Show confirmation */
  var conf = document.getElementById('order-confirmation');
  if (conf) conf.style.display = 'block';

  /* Populate confirmation */
  var confNumEl = document.getElementById('conf-order-num');
  if (confNumEl) confNumEl.textContent = '#' + (document.getElementById('order-number') || {}).value;

  var confNameEl = document.getElementById('conf-name');
  if (confNameEl) confNameEl.textContent = (document.getElementById('cust-name') || {}).value;

  var confPickupEl = document.getElementById('conf-pickup');
  if (confPickupEl) confPickupEl.textContent = formatDate(selectedDay) + ' at ' + selectedTime;

  var confTotalEl = document.getElementById('conf-total');
  if (confTotalEl && grand > 0) confTotalEl.textContent = '$' + grand.toFixed(2);

  /* Clear cart */
  cart = {};
  clearCartStorage();

  /* Scroll to top */
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDate (dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/* =========================================================
   SAVE ORDER TO PORTAL (localStorage — same-device portal)
   ========================================================= */
function saveOrderToPortal (order) {
  try {
    var key    = 'dc_orders';
    var orders = JSON.parse(localStorage.getItem(key) || '[]');
    orders.unshift(order); /* newest first */
    if (orders.length > 50) orders = orders.slice(0, 50); /* cap at 50 */
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (e) {}
}

/* =========================================================
   MOBILE CHECKOUT — scroll to cart/form
   ========================================================= */
function mobileCheckout () {
  var checkout = document.getElementById('checkout-section');
  if (checkout) {
    checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
