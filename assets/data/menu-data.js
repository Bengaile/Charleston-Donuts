/* =========================================================
   Today's Fresh Picks — Menu Data File
   -----------------------------------------------------------
   HOW TO EDIT THIS FILE (no coding experience needed):

   1. Find the section you want to change below (Donuts, Coffee,
      Breakfast, Bakery Favorites, Specialty & Sweets).
   2. To change an item's name: edit the text inside the quotes
      after "name:" — for example, change "Jelly Donut" to
      "Raspberry Jelly Donut".
   3. To add a price: type it inside the quotes after "price:" —
      for example, price: "1.25"
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
        { name: "Chocolate Iced Donut", price: "2.19" },
        { name: "Blueberry Cake Donut", price: "2.19" },
        { name: "French Donut", price: "2.39" },
        { name: "Homecut Donut", price: "2.59" },
        { name: "Honey Dip Donut", price: "" },
        { name: "Boston Creme Donut", price: "" },
        { name: "Charleston Delight Donut", price: "" },
        { name: "Maple Iced Ring Donut", price: "" },
        { name: "Jelly Donut", price: "2.79" },
        { name: "Bavarian Donut", price: "2.79" },
        { name: "Sour Creme Donut", price: "2.39" },
        { name: "Powdered Donut", price: "2.39" },
        { name: "Donut Holes", price: "1.00" },
        { name: "Half Dozen Donuts", price: "11.99" },
        { name: "Dozen Donuts", price: "23.99" }
      ]
    },
    {
      id: "coffee",
      label: "Coffee",
      neonClass: "tfp-neon-teal",
      pillClass: "tfp-pill-2",
      subtitle: "Hot, iced, and always ready to go.",
      photo: "assets/images/feature-coffee-placeholder.jpg",
      photoPosition: "bl",
      items: [
        { name: "Coffee (Small)", price: "" },
        { name: "Coffee (Large)", price: "" },
        { name: "Hot Tea", price: "" },
        { name: "Iced Coffee", price: "" },
        { name: "Coffee Carafe", price: "" },
        { name: "Cappuccino", price: "" }
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
        { name: "Bagel with Cream Cheese", price: "" },
        { name: "Ham, Bacon, Sausage, or Pepperoni Sandwich with Cheese", price: "" },
        { name: "Ham, Bacon, or Sausage Sandwich with Egg & Cheese", price: "" },
        { name: "Link Sausage and Egg Sandwich with Pepperjack Cheese", price: "" }
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
        { name: "Apple Fritter", price: "" },
        { name: "Cinnamon Roll", price: "" },
        { name: "Brownie", price: "" },
        { name: "Brownie Cream Finger", price: "" },
        { name: "Cream Horn", price: "" },
        { name: "Apple Stick", price: "" }
      ]
    },
    {
      id: "fancies",
      label: "Fancies",
      neonClass: "tfp-neon-red",
      pillClass: "tfp-pill-5",
      subtitle: "A few extra-special fancies worth saving room for.",
      photo: "assets/images/specialty-drizzle-cookie.jpg",
      photoPosition: "bl",
      items: [
        { name: "Lady Fingers", price: "" },
        { name: "Eclair", price: "" },
        { name: "Cookies", price: "" },
        { name: "Cream Filled Cookie", price: "" },
        { name: "Apple Pecan Cake", price: "" },
        { name: "Pecan Roll", price: "" },
        { name: "Cake Ball", price: "" }
      ]
    }
  ]
};
