(function () {
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderMenuMaster() {
    const container = document.getElementById("menu-master");
    if (!container || typeof MENU_MASTER_DATA === "undefined") return;

    const grouped = MENU_MASTER_DATA.reduce((groups, item) => {
      (groups[item.category] ||= []).push(item);
      return groups;
    }, {});

    container.innerHTML = Object.entries(grouped).map(([category, items]) => `
      <section class="master-menu-group" aria-labelledby="menu-${slug(category)}">
        <div class="master-menu-heading">
          <h2 id="menu-${slug(category)}">${escapeHtml(category)}</h2>
          <p>${items.length} item${items.length === 1 ? "" : "s"}</p>
        </div>
        <div class="master-menu-grid">
          ${items.map(item => `
            <article class="master-menu-card${item.image ? "" : " no-photo"}">
              ${item.image
                ? `<img src="assets/images/menu/${escapeHtml(item.image)}"
                         alt="${escapeHtml(item.name)} at Donut Connection Charleston"
                         loading="lazy" width="900" height="900">`
                : `<div class="menu-image-placeholder" aria-hidden="true">
                     <span>${escapeHtml(item.category)}</span>
                   </div>`
              }
              <div class="master-menu-card-body">
                <div class="master-menu-card-topline">
                  <p class="master-menu-id">${escapeHtml(item.id)}</p>
                  ${item.price ? `<p class="master-menu-price">$${escapeHtml(item.price)}</p>` : ""}
                </div>
                <h3>${escapeHtml(item.name)}</h3>
                <p class="master-menu-description">${escapeHtml(item.description)}</p>
                ${item.price ? "" : `<p class="master-menu-price-note">Price available in store</p>`}
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", renderMenuMaster);
})();