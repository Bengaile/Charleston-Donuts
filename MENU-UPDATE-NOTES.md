# Menu and Order Ahead Update

- Updated parent menu prices from `DC_Menu_Prices_Hierarchy.xlsx`.
- Added 12 required donut selections for Dozen Donuts.
- Added 6 required donut selections for Half Dozen Donuts.
- Added 8 selections for the existing Eight Pack.
- Added `None` to non-box flavor selections, including Cappuccino and Iced Coffee.
- Preserved the existing Formspree Order Ahead submission, pickup scheduler, cart, tax, and confirmation logic.
- `CNAME` remains included because this package is intended for the primary `charleston-donuts.com` repository.

## Assorted box selector improvement
- Replaced repetitive flavor dropdowns for assorted donut boxes with one expandable flavor list.
- Each flavor now has minus/quantity/plus controls.
- A live tally shows progress, such as `7 of 12 selected`.
- The box cannot be added until the exact required count is selected.
- The outer quantity control still adds/removes identical completed boxes.

- Added an in-builder **Add to Order** button for assorted boxes. It activates only when the exact required count is selected, adds the completed assortment to the cart, and resets the builder for another box.
