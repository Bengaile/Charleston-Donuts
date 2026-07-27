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
let flavorBuilderState = {}; /* rowId -> array of quantities by flavor */
let individualDonutState = {}; /* rowId -> quantities for individual donut varieties */

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  buildMenuFromData();
  buildDayPicker();
  buildCategoryTabs();
  renderCart();
  loadCartFromStorage();
  importMenuPageDonutSelection();
});

/* =========================================================
   MENU — build from MENU_DATA in menu-data.js
   ========================================================= */
function buildMenuFromData () {
  if (typeof MENU_DATA === 'undefined') return;
  const container = document.getElementById('menu-sections');
  if (!container) return;

  MENU_DATA.sections.forEach(function (section, sectionIndex) {
    const div = document.createElement('div');
    div.className = 'menu-section' + (sectionIndex === 0 ? ' active' : '');
    div.id = 'sec-' + section.id;

    let html = '<div class="menu-section-header"><h2>' + section.label + '</h2>';
    if (section.subtitle) html += '<p>' + section.subtitle + '</p>';
    html += '</div>';

    section.items.forEach(function (item, itemIndex) {
      /* Group the separately priced donut varieties into one quantity builder. */
      if (section.id === 'donuts' && isIndividualDonutItem(item)) {
        var individualItems = section.items.filter(isIndividualDonutItem);
        if (item !== individualItems[0]) return;
        html += renderIndividualDonutBuilder(sectionIndex, individualItems);
        return;
      }
      const rowId = 'configured-' + section.id + '-' + itemIndex;
      const basePrice = getStartingPrice(item);
      const priceDisplay = basePrice > 0 ? (item.options ? 'From $' : '$') + basePrice.toFixed(2) : '$__.__';
      html += '<div class="menu-item-row configured-item" id="row-' + rowId + '">';
      html += '<div class="menu-item-info"><h4>' + item.name + '</h4>';
      if (item.options) {
        if (isFlavorQuantityBuilder(item)) {
          var requiredTotal = item.options.length;
          var choices = item.options[0].choices;
          flavorBuilderState[rowId] = flavorBuilderState[rowId] || choices.map(function () { return 0; });
          html += '<div class="flavor-builder" id="builder-' + rowId + '">';
          html += '<button type="button" class="flavor-builder-toggle" onclick="toggleFlavorBuilder(\'' + rowId + '\')" aria-expanded="false">';
          html += '<span>Choose your flavors</span><strong id="builder-tally-' + rowId + '">0 of ' + requiredTotal + ' selected</strong><span class="builder-chevron">&#9662;</span></button>';
          html += '<div class="flavor-builder-panel" id="builder-panel-' + rowId + '" hidden>';
          html += '<div class="flavor-builder-sticky"><span>Build your box</span><strong id="builder-tally-panel-' + rowId + '">0 of ' + requiredTotal + ' selected</strong></div>';
          choices.forEach(function (choice, choiceIndex) {
            html += '<div class="flavor-builder-row"><span class="flavor-name">' + choice.label + '</span>';
            html += '<div class="flavor-qty-controls">';
            html += '<button type="button" class="flavor-qty-btn" onclick="changeFlavorQty(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ',' + choiceIndex + ',-1)" aria-label="Remove one ' + choice.label + '">&#8722;</button>';
            html += '<span class="flavor-qty-value" id="flavor-qty-' + rowId + '-' + choiceIndex + '">0</span>';
            html += '<button type="button" class="flavor-qty-btn" onclick="changeFlavorQty(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ',' + choiceIndex + ',1)" aria-label="Add one ' + choice.label + '">&#43;</button>';
            html += '</div></div>';
          });
          html += '<div class="flavor-builder-action">';
          html += '<button type="button" class="flavor-add-order-btn" id="builder-add-' + rowId + '" onclick="addFlavorBuilderToOrder(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ')" disabled>Add to Order</button>';
          html += '<span class="flavor-add-help" id="builder-help-' + rowId + '">Select exactly ' + requiredTotal + ' donuts to continue.</span>';
          html += '</div>';
          html += '</div></div>';
        } else {
          html += '<div class="order-item-options">';
          item.options.forEach(function (option, optionIndex) {
            html += '<label><span>' + option.label + '</span><select id="option-' + rowId + '-' + optionIndex + '" onchange="refreshConfiguredQty(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ')">';
            html += '<option value="">' + optionPrompt(option.label) + '</option>';
            option.choices.forEach(function (choice, choiceIndex) {
              html += '<option value="' + choiceIndex + '">' + choice.label + (choice.price ? ' — $' + parseFloat(choice.price).toFixed(2) : '') + '</option>';
            });
            html += '</select></label>';
          });
          html += '</div>';
        }
      }
      html += '</div>';
      html += '<span class="menu-item-price" id="price-' + rowId + '">' + priceDisplay + '</span>';
      html += '<div class="item-qty-controls">';
      html += '<button class="qty-btn" aria-label="Remove one ' + item.name + '" onclick="changeConfiguredQty(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ',-1)">&#8722;</button>';
      html += '<span class="qty-display" id="qty-' + rowId + '">0</span>';
      html += '<button class="qty-btn" aria-label="Add one ' + item.name + '" onclick="changeConfiguredQty(\'' + rowId + '\',' + sectionIndex + ',' + itemIndex + ',1)">&#43;</button>';
      html += '</div></div>';
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}



function isIndividualDonutItem (item) {
  return !!item && !item.options && /Donut$/i.test(item.name || '') && parseFloat(item.price || 0) === 1.80;
}

function renderIndividualDonutBuilder (sectionIndex, items) {
  var rowId = 'individual-donuts';
  individualDonutState[rowId] = individualDonutState[rowId] || items.map(function () { return 0; });
  var html = '<div class="menu-item-row configured-item individual-donut-group" id="row-' + rowId + '">';
  html += '<div class="menu-item-info"><h4>Individual Donuts</h4>';
  html += '<p class="individual-builder-intro">Mix and match any quantity. Your donut count and running total update as you choose.</p>';
  html += '<div class="flavor-builder individual-builder" id="builder-' + rowId + '">';
  html += '<button type="button" class="flavor-builder-toggle" onclick="toggleFlavorBuilder(\'' + rowId + '\')" aria-expanded="false">';
  html += '<span>Choose donut varieties</span><strong id="individual-tally-' + rowId + '">0 donuts · $0.00</strong><span class="builder-chevron">&#9662;</span></button>';
  html += '<div class="flavor-builder-panel" id="builder-panel-' + rowId + '" hidden>';
  html += '<div class="flavor-builder-sticky"><span>Build your selection</span><strong id="individual-tally-panel-' + rowId + '">0 donuts · $0.00</strong></div>';
  items.forEach(function (donut, donutIndex) {
    html += '<div class="flavor-builder-row"><span class="flavor-name">' + donut.name + '<small>$' + parseFloat(donut.price).toFixed(2) + ' each</small></span>';
    html += '<div class="flavor-qty-controls">';
    html += '<button type="button" class="flavor-qty-btn" onclick="changeIndividualDonutQty(\'' + rowId + '\',' + sectionIndex + ',' + donutIndex + ',-1)" aria-label="Remove one ' + donut.name + '">&#8722;</button>';
    html += '<span class="flavor-qty-value" id="individual-qty-' + rowId + '-' + donutIndex + '">0</span>';
    html += '<button type="button" class="flavor-qty-btn" onclick="changeIndividualDonutQty(\'' + rowId + '\',' + sectionIndex + ',' + donutIndex + ',1)" aria-label="Add one ' + donut.name + '">&#43;</button>';
    html += '</div></div>';
  });
  html += '<div class="flavor-builder-action">';
  html += '<button type="button" class="flavor-add-order-btn" id="individual-add-' + rowId + '" onclick="addIndividualDonutsToOrder(\'' + rowId + '\',' + sectionIndex + ')" disabled>Add to Order</button>';
  html += '<span class="flavor-add-help" id="individual-help-' + rowId + '">Choose at least one donut to continue.</span>';
  html += '</div></div></div></div>';
  html += '<span class="menu-item-price individual-running-price" id="individual-price-' + rowId + '">$0.00</span>';
  html += '</div>';
  return html;
}

function getIndividualDonutItems (sectionIndex) {
  return MENU_DATA.sections[sectionIndex].items.filter(isIndividualDonutItem);
}

function changeIndividualDonutQty (rowId, sectionIndex, donutIndex, delta) {
  var items = getIndividualDonutItems(sectionIndex);
  var state = individualDonutState[rowId] || items.map(function () { return 0; });
  state[donutIndex] = Math.max(0, state[donutIndex] + delta);
  individualDonutState[rowId] = state;
  var qtyEl = document.getElementById('individual-qty-' + rowId + '-' + donutIndex);
  if (qtyEl) qtyEl.textContent = state[donutIndex];
  updateIndividualDonutTally(rowId, sectionIndex);
}

function updateIndividualDonutTally (rowId, sectionIndex) {
  var items = getIndividualDonutItems(sectionIndex);
  var state = individualDonutState[rowId] || items.map(function () { return 0; });
  var count = state.reduce(function (sum, qty) { return sum + qty; }, 0);
  var total = state.reduce(function (sum, qty, index) { return sum + qty * parseFloat(items[index].price || 0); }, 0);
  var text = count + ' donut' + (count === 1 ? '' : 's') + ' · $' + total.toFixed(2);
  ['individual-tally-' + rowId, 'individual-tally-panel-' + rowId].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.textContent = text;
  });
  var price = document.getElementById('individual-price-' + rowId);
  if (price) price.textContent = '$' + total.toFixed(2);
  var add = document.getElementById('individual-add-' + rowId);
  if (add) add.disabled = count === 0;
  var help = document.getElementById('individual-help-' + rowId);
  if (help) help.textContent = count ? 'Ready to add ' + count + ' selected donut' + (count === 1 ? '' : 's') + '.' : 'Choose at least one donut to continue.';
  var builder = document.getElementById('builder-' + rowId);
  if (builder) builder.classList.toggle('complete', count > 0);
}

function addIndividualDonutsToOrder (rowId, sectionIndex) {
  var items = getIndividualDonutItems(sectionIndex);
  var state = individualDonutState[rowId] || items.map(function () { return 0; });
  var count = state.reduce(function (sum, qty) { return sum + qty; }, 0);
  if (!count) return;
  state.forEach(function (qty, index) {
    if (qty > 0) changeQty(items[index].name, parseFloat(items[index].price), qty);
  });
  individualDonutState[rowId] = items.map(function () { return 0; });
  items.forEach(function (_, index) {
    var qtyEl = document.getElementById('individual-qty-' + rowId + '-' + index);
    if (qtyEl) qtyEl.textContent = '0';
  });
  updateIndividualDonutTally(rowId, sectionIndex);
  var panel = document.getElementById('builder-panel-' + rowId);
  var toggle = document.querySelector('#builder-' + rowId + ' .flavor-builder-toggle');
  if (panel) panel.setAttribute('hidden', '');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function importMenuPageDonutSelection () {
  try {
    var raw = localStorage.getItem('dc_pending_individual_donuts');
    if (!raw) return;
    var pending = JSON.parse(raw);
    Object.keys(pending).forEach(function (name) {
      var entry = pending[name];
      if (entry && entry.qty > 0) changeQty(name, parseFloat(entry.price), parseInt(entry.qty, 10));
    });
    localStorage.removeItem('dc_pending_individual_donuts');
  } catch (e) {}
}

function isFlavorQuantityBuilder (item) {
  if (!item || !item.options || item.options.length < 2) return false;
  var first = item.options[0].choices || [];
  if (!first.length) return false;
  return item.options.every(function (option) {
    var choices = option.choices || [];
    if (choices.length !== first.length) return false;
    return choices.every(function (choice, index) {
      return choice.label === first[index].label && String(choice.price || '') === String(first[index].price || '');
    });
  });
}

function toggleFlavorBuilder (rowId) {
  var panel = document.getElementById('builder-panel-' + rowId);
  var button = document.querySelector('#builder-' + rowId + ' .flavor-builder-toggle');
  if (!panel || !button) return;
  var willOpen = panel.hasAttribute('hidden');
  if (willOpen) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
  button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function getFlavorBuilderTotal (rowId) {
  return (flavorBuilderState[rowId] || []).reduce(function (sum, qty) { return sum + qty; }, 0);
}

function changeFlavorQty (rowId, sectionIndex, itemIndex, choiceIndex, delta) {
  var item = MENU_DATA.sections[sectionIndex].items[itemIndex];
  var requiredTotal = item.options.length;
  var state = flavorBuilderState[rowId] || item.options[0].choices.map(function () { return 0; });
  var currentTotal = state.reduce(function (sum, qty) { return sum + qty; }, 0);
  if (delta > 0 && currentTotal >= requiredTotal) return;
  state[choiceIndex] = Math.max(0, state[choiceIndex] + delta);
  flavorBuilderState[rowId] = state;
  var qtyEl = document.getElementById('flavor-qty-' + rowId + '-' + choiceIndex);
  if (qtyEl) qtyEl.textContent = state[choiceIndex];
  updateFlavorBuilderTally(rowId, requiredTotal);
  refreshConfiguredQty(rowId, sectionIndex, itemIndex);
}

function updateFlavorBuilderTally (rowId, requiredTotal) {
  var total = getFlavorBuilderTotal(rowId);
  var text = total + ' of ' + requiredTotal + ' selected';
  var top = document.getElementById('builder-tally-' + rowId);
  var panel = document.getElementById('builder-tally-panel-' + rowId);
  if (top) top.textContent = text;
  if (panel) panel.textContent = text;
  var builder = document.getElementById('builder-' + rowId);
  if (builder) {
    builder.classList.toggle('complete', total === requiredTotal);
    builder.classList.toggle('over-limit', total > requiredTotal);
  }
  var addButton = document.getElementById('builder-add-' + rowId);
  var help = document.getElementById('builder-help-' + rowId);
  if (addButton) addButton.disabled = total !== requiredTotal;
  if (help) {
    var remaining = requiredTotal - total;
    help.textContent = total === requiredTotal
      ? 'Your box is complete and ready to add.'
      : 'Select ' + remaining + ' more ' + (remaining === 1 ? 'donut' : 'donuts') + ' to continue.';
  }
}

function addFlavorBuilderToOrder (rowId, sectionIndex, itemIndex) {
  var configured = getConfiguredItem(rowId, sectionIndex, itemIndex, true);
  if (!configured) return;
  changeQty(configured.key, configured.price, 1);

  /* Reset the builder so the customer can create another, different box. */
  var item = MENU_DATA.sections[sectionIndex].items[itemIndex];
  flavorBuilderState[rowId] = item.options[0].choices.map(function () { return 0; });
  flavorBuilderState[rowId].forEach(function (_, choiceIndex) {
    var qtyEl = document.getElementById('flavor-qty-' + rowId + '-' + choiceIndex);
    if (qtyEl) qtyEl.textContent = '0';
  });
  updateFlavorBuilderTally(rowId, item.options.length);
  refreshConfiguredQty(rowId, sectionIndex, itemIndex);

  var panel = document.getElementById('builder-panel-' + rowId);
  var toggle = document.querySelector('#builder-' + rowId + ' .flavor-builder-toggle');
  if (panel) panel.setAttribute('hidden', '');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');

  var cartSidebar = document.getElementById('cart-sidebar');
  if (window.innerWidth <= 900 && cartSidebar) {
    cartSidebar.classList.add('mobile-open');
  }
}

function optionPrompt (label) {
  var clean = String(label || '').replace(/^Choose\s+(?:a|an)\s+/i, '').replace(/^Choose\s+/i, '');
  return 'Select ' + clean.toLowerCase();
}

function escQ (str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function getStartingPrice (item) {
  if (item.price) return parseFloat(item.price);
  var prices = [];
  (item.options || []).forEach(function (option) {
    option.choices.forEach(function (choice) { if (choice.price) prices.push(parseFloat(choice.price)); });
  });
  return prices.length ? Math.min.apply(null, prices) : 0;
}

function getConfiguredItem (rowId, sectionIndex, itemIndex, showAlert) {
  var item = MENU_DATA.sections[sectionIndex].items[itemIndex];
  var selectedLabels = [];
  var price = item.price ? parseFloat(item.price) : 0;
  var complete = true;
  if (isFlavorQuantityBuilder(item)) {
    var state = flavorBuilderState[rowId] || item.options[0].choices.map(function () { return 0; });
    var requiredTotal = item.options.length;
    var selectedTotal = state.reduce(function (sum, qty) { return sum + qty; }, 0);
    complete = selectedTotal === requiredTotal;
    state.forEach(function (qty, choiceIndex) {
      if (qty > 0) selectedLabels.push(qty + ' ' + item.options[0].choices[choiceIndex].label);
    });
  } else {
    (item.options || []).forEach(function (option, optionIndex) {
      var select = document.getElementById('option-' + rowId + '-' + optionIndex);
      var choiceIndex = select ? select.value : '';
      if (choiceIndex === '') { complete = false; return; }
      var choice = option.choices[parseInt(choiceIndex, 10)];
      selectedLabels.push(option.label + ': ' + choice.label);
      if (choice.price) price = parseFloat(choice.price);
    });
  }
  if (!complete) {
    if (showAlert) alert(isFlavorQuantityBuilder(item) ? 'Please choose exactly ' + item.options.length + ' donuts for ' + item.name + '.' : 'Please select each option for ' + item.name + ' first.');
    return null;
  }
  var name = item.name + (selectedLabels.length ? ' — ' + selectedLabels.join(', ') : '');
  return { key: name, name: name, price: price };
}

function changeConfiguredQty (rowId, sectionIndex, itemIndex, delta) {
  var configured = getConfiguredItem(rowId, sectionIndex, itemIndex, delta > 0);
  if (!configured) return;
  changeQty(configured.key, configured.price, delta);
  refreshConfiguredQty(rowId, sectionIndex, itemIndex);
}

function refreshConfiguredQty (rowId, sectionIndex, itemIndex) {
  var configured = getConfiguredItem(rowId, sectionIndex, itemIndex, false);
  var qty = document.getElementById('qty-' + rowId);
  var price = document.getElementById('price-' + rowId);
  var item = MENU_DATA.sections[sectionIndex].items[itemIndex];
  if (configured) {
    if (qty) qty.textContent = cart[configured.key] ? cart[configured.key].qty : 0;
    if (price) price.textContent = configured.price > 0 ? '$' + configured.price.toFixed(2) : '$__.__';
  } else {
    if (qty) qty.textContent = '0';
    var starting = getStartingPrice(item);
    if (price) price.textContent = starting > 0 ? (item.options ? 'From $' : '$') + starting.toFixed(2) : '$__.__';
  }
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

function loadPendingBoxBuilder () {
  try {
    var raw = localStorage.getItem('dc_pending_box_builder');
    if (!raw) return;
    var pending = JSON.parse(raw);
    if (pending && pending.name) changeQty(pending.name, parseFloat(pending.price) || 0, parseInt(pending.qty,10) || 1);
    localStorage.removeItem('dc_pending_box_builder');
  } catch (e) {}
}

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
   CLEAR ORDER / START OVER
   Clears cart, selected options, pickup choices and customer fields.
   ========================================================= */
function clearOrderAndStartOver () {
  var hasProgress = Object.keys(cart).length > 0 || selectedDay || selectedTime ||
    ['cust-name','cust-phone','cust-email','cust-notes','m-name','m-phone','m-email','m-notes']
      .some(function (id) { var el = document.getElementById(id); return el && el.value.trim(); });

  if (hasProgress && !window.confirm('Clear this order and start over?')) return;

  cart = {};
  selectedDay = null;
  selectedTime = null;
  clearCartStorage();

  document.querySelectorAll('.configured-item select').forEach(function (select) { select.selectedIndex = 0; });
  flavorBuilderState = {};
  individualDonutState = {};
  document.querySelectorAll('.flavor-qty-value').forEach(function (el) { el.textContent = '0'; });
  document.querySelectorAll('.flavor-builder').forEach(function (builder) { builder.classList.remove('complete','over-limit'); });
  document.querySelectorAll('[id^="builder-tally-"]').forEach(function (el) { var m = el.textContent.match(/of\s+(\d+)/); if (m) el.textContent = '0 of ' + m[1] + ' selected'; });
  document.querySelectorAll('.qty-display').forEach(function (qty) { qty.textContent = '0'; });
  document.querySelectorAll('.configured-item').forEach(function (row) {
    var id = row.id.replace(/^row-/, '');
    var parts = id.replace(/^configured-/, '').split('-');
    var sectionId = parts.slice(0, -1).join('-');
    var itemIndex = parseInt(parts[parts.length - 1], 10);
    var sectionIndex = MENU_DATA.sections.findIndex(function (section) { return section.id === sectionId; });
    if (sectionIndex >= 0 && !Number.isNaN(itemIndex)) refreshConfiguredQty(id, sectionIndex, itemIndex);
  });

  document.querySelectorAll('.day-btn,.time-btn').forEach(function (btn) { btn.classList.remove('selected'); });
  var timeGrid = document.getElementById('time-grid');
  if (timeGrid) timeGrid.innerHTML = '';
  var timeWrap = document.getElementById('time-grid-wrap');
  if (timeWrap) timeWrap.style.display = 'none';

  ['pickup-date','pickup-time','order-number','order-summary'].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  ['cust-name','cust-phone','cust-email','cust-notes','m-name','m-phone','m-email','m-notes'].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });

  var form = document.getElementById('order-form');
  if (form) form.reset();
  var pickupSummary = document.getElementById('pickup-summary');
  if (pickupSummary) pickupSummary.innerHTML = '&nbsp;Choose a date &amp; time above';
  var mobilePickup = document.getElementById('mobile-pickup-display');
  if (mobilePickup) mobilePickup.textContent = ' Choose a date & time above';

  renderCart();
  updateMobileCartSummary();
  checkLeadTime();
  closeMobileCheckout();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
  const email = document.getElementById('cust-email');
  if (!name || !name.value.trim()) { alert('Please enter your name.'); return false; }
  if (!phone || !phone.value.trim()) { alert('Please enter your phone number.'); return false; }
  if (!email || !email.value.trim() || !email.checkValidity()) { alert('Please enter a valid email address for your order confirmation.'); return false; }

  /* Build order summary string for Formspree */
  const items  = Object.entries(cart);
  const total  = items.reduce(function (s, e) { return s + e[1].qty * e[1].price; }, 0);
  const tax    = total * TAX_RATE;
  const grand  = total + tax;
  const orderNum = 'DC-' + Date.now().toString().slice(-6);

  let summary = 'DONUT CONNECTION — MACCORKLE AVENUE\n';
  summary += '3509 MacCorkle Ave SE, Charleston, WV 25302\n';
  summary += 'Phone: (304) 925-4261\n\n';
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
      alert('There was a problem submitting your order. Please call us directly at (304) 925-4261.');
    }
  }).catch(function () {
    alert('There was a problem submitting your order. Please call us directly at (304) 925-4261.');
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


/* =========================================================
   MOBILE FORM — permanent section below menu on mobile
   Shows/hides on mobile, updates cart summary and pickup
   ========================================================= */

function initMobileForm () {
  var section = document.getElementById('mobile-form-section');
  if (!section) return;

  /* Show on mobile only */
  if (window.innerWidth <= 900) {
    section.style.display = 'block';
  }

  /* Place order button */
  var btn = document.getElementById('mobile-place-order-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      /* Validate cart */
      if (Object.keys(cart).length === 0) {
        alert('Please add at least one item from the menu above.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      /* Validate pickup */
      if (!selectedDay || !selectedTime) {
        alert('Please choose a pickup date and time above before placing your order.');
        document.getElementById('day-picker').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      /* Validate name and phone */
      var name  = document.getElementById('m-name');
      var phone = document.getElementById('m-phone');
      var email = document.getElementById('m-email');
      if (!name || !name.value.trim())  { alert('Please enter your name.');         return; }
      if (!phone || !phone.value.trim()) { alert('Please enter your phone number.'); return; }
      if (!email || !email.value.trim() || !email.checkValidity()) { alert('Please enter a valid email address for your order confirmation.'); return; }

      /* Copy to desktop form fields */
      var dName  = document.getElementById('cust-name');
      var dPhone = document.getElementById('cust-phone');
      var dEmail = document.getElementById('cust-email');
      var dNotes = document.getElementById('cust-notes');
      if (dName)  dName.value  = name.value;
      if (dPhone) dPhone.value = phone.value;
      if (dEmail) dEmail.value = (document.getElementById('m-email') || {value:''}).value;
      if (dNotes) dNotes.value = (document.getElementById('m-notes') || {value:''}).value;

      /* Submit the order */
      submitOrder(null);
    });
  }
}

/* Update mobile cart summary whenever cart changes */
function updateMobileCartSummary () {
  var el = document.getElementById('mobile-cart-summary');
  if (!el) return;

  var items = Object.entries(cart);
  if (items.length === 0) {
    el.innerHTML = '<p style="font-size:0.88rem;color:var(--chocolate-soft);font-style:italic;">Add items from the menu above to see them here.</p>';
    return;
  }

  var html = '';
  var total = 0;
  items.forEach(function (e) {
    var lineTotal = e[1].qty * e[1].price;
    total += lineTotal;
    html += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed rgba(75,53,42,0.1);font-size:0.88rem;">';
    html += '<span style="color:var(--chocolate);">' + e[0] + ' &times;' + e[1].qty + '</span>';
    html += '<span style="font-weight:700;color:var(--gold-dark);">' + (e[1].price > 0 ? '$' + lineTotal.toFixed(2) : '') + '</span>';
    html += '</div>';
  });

  if (total > 0) {
    var tax   = total * TAX_RATE;
    var grand = total + tax;
    html += '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:0.82rem;color:var(--chocolate-soft);"><span>WV tax (6%)</span><span>$' + tax.toFixed(2) + '</span></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;font-size:1rem;color:var(--chocolate);border-top:2px solid var(--gold);margin-top:4px;"><span>Total</span><span>$' + grand.toFixed(2) + '</span></div>';
  }

  el.innerHTML = html;
}

/* Update mobile pickup display */
function updateMobilePickup () {
  var el = document.getElementById('mobile-pickup-display');
  if (!el) return;
  if (selectedDay && selectedTime) {
    el.textContent = ' ' + formatDate(selectedDay) + ' at ' + selectedTime;
    el.style.color = 'var(--teal-dark)';
  }
}

/* Hook into existing functions */
var _origChangeQty = changeQty;
changeQty = function (name, price, delta) {
  _origChangeQty(name, price, delta);
  updateMobileCartSummary();
};

var _origRemoveItem = removeItem;
removeItem = function (name) {
  _origRemoveItem(name);
  updateMobileCartSummary();
};

var _origSelectDay = selectDay;
selectDay = function (btn) {
  _origSelectDay(btn);
  updateMobilePickup();
};

var _origSelectTime = selectTime;
selectTime = function (btn) {
  _origSelectTime(btn);
  updateMobilePickup();
};

/* Init on load */
document.addEventListener('DOMContentLoaded', function () {
  initMobileForm();
  updateMobileCartSummary();
  loadPendingBoxBuilder();
});

/* Handle resize */
window.addEventListener('resize', function () {
  var section = document.getElementById('mobile-form-section');
  if (!section) return;
  section.style.display = window.innerWidth <= 900 ? 'block' : 'none';
});
