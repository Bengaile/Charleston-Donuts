/* =========================================================
   Today's Fresh Picks — Menu Data File
   -----------------------------------------------------------
   HOW TO EDIT THIS FILE (no coding experience needed):

   1. Find the section you want to change below (Donuts, Coffee,
      Breakfast, Bakery Favorites, Specialty & Sweets, etc.).
   2. To change an item's name: edit the text inside the quotes
      after "name:" — for example, change "Jelly Donut" to
      "Raspberry Jelly Donut".
   3. To change a price: edit the number inside the quotes after
      "price:" — for example, price: "1.50"
      Leave it as price: ""  (empty quotes) to show a blank "$__"
      until you're ready to add a real price.
   4. To add a brand new item: copy an existing line that starts
      with "{ name:" and ends with "},", paste it where you want
      the new item to appear, then change the name/price.
   5. To remove an item: delete its whole "{ name: ... },"  line.
   6. To add a whole new section: copy one of the section blocks
      (everything from "{ id:" down to the matching "},") and
      edit the id, label, subtitle, and items list.
   7. Save the file, then commit + push in GitHub Desktop as usual.
      The live menu page updates automatically — no other files
      need to be touched.

   IMPORTANT: Keep the quotation marks "  " and commas , exactly
   where they are — those are part of the file's structure, not
   things to delete. If you're ever unsure, it's safe to just
   change the words between quotes and leave all punctuation
   alone.

   PRICES LAST UPDATED: July 2026 from DC_Menu.xlsx workbook.
   ========================================================= */

const MENU_DATA = {
  sections: [
    {
      id: "donuts",
      label: "Donuts",
      neonClass: "tfp-neon-pink",
      pillClass: "tfp-pill-1",
      subtitle: "Fried fresh, glazed, filled, and frosted \u2014 every single day.",
      photo: "assets/images/gallery-donuts-03.jpg",
      photoPosition: "tr",
      items: [
        { name: "Single Donut", price: "1.50" },
        { name: "Half Dozen Donuts", price: "7.00" },
        { name: "Eight Pack Donuts", price: "9.50" },
        { name: "Dozen Donuts", price: "13.49" },
        { name: "Donut Holes (Single)", price: "0.27" },
        { name: "Donut Holes (Half Dozen)", price: "1.79" },
        { name: "Donut Holes (Dozen)", price: "3.69" },
        { name: "Donut Holes (Box of 30)", price: "7.69" },
        { name: "Donut Holes (Box of 45)", price: "9.29" }
      ]
    },
    {
      id: "coffee",
      label: "Coffee & Drinks",
      neonClass: "tfp-neon-teal",
      pillClass: "tfp-pill-2",
      subtitle: "Hot, iced, and always ready to go.",
      photo: "assets/images/feature-coffee-placeholder.jpg",
      photoPosition: "bl",
      items: [
        { name: "Coffee (Small)", price: "1.99" },
        { name: "Coffee (Medium)", price: "1.69" },
        { name: "Coffee (Large)", price: "1.99" },
        { name: "Coffee (Extra Large)", price: "2.29" },
        { name: "Coffee Carafe", price: "16.99" },
        { name: "Travel Mug Refill", price: "0.62" },
        { name: "One Pound Coffee Beans", price: "7.99" },
        { name: "Cappuccino (Small)", price: "1.99" },
        { name: "Cappuccino (Medium)", price: "2.29" },
        { name: "Cappuccino (Large)", price: "2.59" },
        { name: "Cappuccino (Extra Large)", price: "2.89" },
        { name: "Hot Chocolate (Small)", price: "1.99" },
        { name: "Hot Chocolate (Medium)", price: "2.29" },
        { name: "Hot Chocolate (Large)", price: "2.59" },
        { name: "Hot Chocolate (Extra Large)", price: "2.89" },
        { name: "Hot Chocolate Carafe", price: "18.99" },
        { name: "Cold Brew (16 oz.)", price: "2.19" },
        { name: "Cold Brew (20 oz.)", price: "2.39" }
      ]
    },
    {
      id: "breakfast",
      label: "Breakfast",
      neonClass: "tfp-neon-gold",
      pillClass: "tfp-pill-3",
      subtitle: "Hearty bites to start the morning right.",
      photo: "",
      photoPosition: "",
      singleColumn: true,
      items: [
        { name: "Bagel", price: "1.29" },
        { name: "Pepperoni Grandwich", price: "3.99" },
        { name: "Ham and Cheese Grandwich", price: "3.99" },
        { name: "Bacon and Cheese Grandwich", price: "3.99" },
        { name: "Sausage and Cheese Grandwich", price: "3.99" },
        { name: "Bacon, Egg and Cheese Grandwich", price: "4.59" },
        { name: "Sausage, Egg and Cheese Grandwich", price: "4.59" },
        { name: "Ham, Egg and Cheese Grandwich", price: "4.59" }
      ]
    },
    {
      id: "bakery",
      label: "Bakery Favorites",
      neonClass: "tfp-neon-mint",
      pillClass: "tfp-pill-4",
      subtitle: "Old-fashioned bakery classics, made fresh.",
      photo: "assets/images/fritters-rolls-bearclaws-cinnamon.jpg",
      photoPosition: "tr",
      items: [
        { name: "Eclairs", price: "2.39" },
        { name: "Lady Fingers", price: "2.39" },
        { name: "Hot Dogs", price: "2.39" },
        { name: "Maple Bacon Long Johns", price: "2.39" },
        { name: "Fritters", price: "2.39" },
        { name: "Cinnamon Rolls", price: "2.39" },
        { name: "Cream-Filled Cookies", price: "2.59" },
        { name: "Muffins", price: "1.79" },
        { name: "Brownie Cream Fingers", price: "1.69" },
        { name: "Brownies", price: "1.59" },
        { name: "Cinnamon Twists", price: "1.59" },
        { name: "Cream Horns", price: "1.49" },
        { name: "Turnovers", price: "1.49" }
      ]
    },
    {
      id: "fancies",
      label: "Fancies & Sweets",
      neonClass: "tfp-neon-red",
      pillClass: "tfp-pill-5",
      subtitle: "Cookies, ice cream, shakes, smoothies, and cold drinks.",
      photo: "assets/images/specialty-drizzle-cookie.jpg",
      photoPosition: "bl",
      items: [
        { name: "Cookie (Single)", price: "0.75" },
        { name: "Cookies (Half Dozen)", price: "4.19" },
        { name: "Cookies (Dozen)", price: "7.29" },
        { name: "Cookie Bites", price: "0.50" },
        { name: "Donut \u00e0 la Mode", price: "2.49" },
        { name: "Brownie \u00e0 la Mode", price: "3.09" },
        { name: "Kids Cone", price: "1.19" },
        { name: "Single Dip", price: "2.49" },
        { name: "Double Dip", price: "3.49" },
        { name: "Waffle Cone (Add-on)", price: "0.40" },
        { name: "Two-Scoop Sundae", price: "3.49" },
        { name: "Three-Scoop Sundae", price: "4.49" },
        { name: "Pint", price: "3.99" },
        { name: "Quart", price: "4.99" },
        { name: "Milkshake (16 oz.)", price: "2.79" },
        { name: "Milkshake (20 oz.)", price: "3.39" },
        { name: "Smoothie (Small)", price: "3.49" },
        { name: "Smoothie (Large)", price: "4.49" },
        { name: "Juice", price: "1.79" },
        { name: "Bug Juice", price: "1.05" },
        { name: "Chocolate Milk", price: "1.75" },
        { name: "Milk", price: "1.70" },
        { name: "Soda", price: "1.70" },
        { name: "Water", price: "1.79" },
        { name: "Energy Drink", price: "2.69" },
        { name: "Gatorade", price: "1.69" },
        { name: "Party Tray", price: "32.99" }
      ]
    }
  ]
};
