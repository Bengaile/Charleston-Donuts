(function () {
  function money(value) { return value ? `$${value}` : ""; }
  function slug(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function renderMenuPhotos() {
    const container = document.getElementById("menu-photo-grid");
    if (!container || typeof MENU_PHOTO_DATA === "undefined") return;
    const grouped = MENU_PHOTO_DATA.reduce((acc, item) => {
      (acc[item.category] ||= []).push(item); return acc;
    }, {});
    container.innerHTML = Object.entries(grouped).map(([category, items]) => `
      <section class="photo-menu-group" aria-labelledby="photo-${slug(category)}">
        <h3 id="photo-${slug(category)}">${category}</h3>
        <div class="photo-card-grid">
          ${items.map(item => `
            <article class="photo-menu-card">
              <img src="assets/images/menu/${item.image}" alt="${item.name} at Donut Connection Charleston" loading="lazy" width="900" height="900">
              <div class="photo-menu-card-body">
                <div><p class="photo-menu-id">${item.id}</p><h4>${item.name}</h4></div>
                ${item.price ? `<p class="photo-menu-price">${money(item.price)}</p>` : ""}
              </div>
            </article>`).join("")}
        </div>
      </section>`).join("");
  }
  function renderGalleryPhotos() {
    const container = document.getElementById("seasonal-event-gallery");
    if (!container || typeof GALLERY_PHOTO_DATA === "undefined") return;
    const grouped = GALLERY_PHOTO_DATA.reduce((acc, item) => {
      (acc[item.group] ||= []).push(item); return acc;
    }, {});
    container.innerHTML = Object.entries(grouped).map(([group, items]) => `
      <section class="photo-menu-group" aria-labelledby="gallery-${slug(group)}">
        <div class="sign-heading"><h2 id="gallery-${slug(group)}" class="mt-0">${group}</h2><div class="sign-divider"></div></div>
        <div class="photo-card-grid gallery-photo-grid">
          ${items.map(item => `
            <figure class="photo-menu-card">
              <img src="assets/images/gallery/seasonal-events/${item.image}" alt="${item.name} creation from Donut Connection Charleston" loading="lazy" width="900" height="900">
              <figcaption class="gallery-photo-caption">${item.name}</figcaption>
            </figure>`).join("")}
        </div>
      </section>`).join("");
  }
  document.addEventListener("DOMContentLoaded", function () { renderMenuPhotos(); renderGalleryPhotos(); });
})();
