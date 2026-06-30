# Charleston-Donuts.com — Owner's Editing Cheat Sheet

A practical guide for making your own updates to the website — swapping
photos, editing text, and adjusting colors — without needing a developer.

---

## The Golden Rule

**Edit → Commit → Push.** No change is live until you do all three steps
in GitHub Desktop:

1. Make your edit (upload a photo, change a file, etc.)
2. Open GitHub Desktop → the "Changes" tab will show what you modified
3. Type a short description in the box at the bottom left (e.g. "Update
   hero photo") → click **Commit to main**
4. Click **Push origin** at the top

The live site updates within a minute or two of pushing.

---

## Task 1: Replace a Photo

This is the most common edit, and the easiest one.

1. On GitHub.com, go to your repo → open the **assets/images** folder
2. Find the photo you want to replace and note its **exact filename**
   (e.g. `hero-bg-combined.jpg`)
3. Click **"Add file" → "Upload files"**
4. Drag in your new photo, **renamed to match that exact filename**
5. GitHub will ask if you want to replace the existing file — confirm
6. Commit directly on GitHub.com (there's a commit box right there), or
   do it through GitHub Desktop if you prefer your usual workflow

**Why the filename has to match:** every page that uses that photo
references it by name. Keep the name identical and you don't have to
touch any other code — the new photo just appears everywhere the old
one did.

### Where each homepage photo lives
| Filename | Used for |
|---|---|
| `hero-bg-combined.jpg` | Big background photo behind the homepage headline |
| `feature-donuts-placeholder.jpg` | "Donuts & Menu" feature card on homepage |
| `feature-coffee-placeholder.jpg` | "Coffee & Breakfast" feature card |
| `custom-cake-placeholder.jpg` | "Custom Cakes & Events" feature card |
| `dessert-table-spread.jpg` | "Catering & Fundraisers" feature card |
| `gallery-donuts-01.jpg` through `08.jpg` | Gallery page, donut photos |
| `gallery-cakes-01.jpg` through `04.jpg` | Gallery page, cake/event photos |

To add a **brand new** photo (not replacing one), upload it to
`assets/images` with any filename you like, then tell me (or whoever's
editing the code) where you want it to appear — that part does need a
small code edit to add the `<img>` tag pointing to it.

---

## Task 2: Edit Text on Any Page

1. On GitHub.com, click into the page file you want to edit (e.g.
   `index.html` for the homepage, `menu.html` for the menu page)
2. Click the **pencil icon** in the top-right of the file view
3. Find the text you want to change — it'll be inside HTML tags like
   `<p>Your text here</p>` or `<h2>A Headline</h2>`. Just edit the words
   between the tags; leave everything else (the `<...>` parts) alone.
4. Scroll down, write a short commit message, click **Commit changes**

**Tip:** Use Ctrl+F (or Cmd+F) in the GitHub editor to search for the
exact phrase you want to change, so you don't have to scroll through
the whole file.

### Which file is which page
| File | Page |
|---|---|
| `index.html` | Home |
| `menu.html` | Donuts & Menu |
| `coffee.html` | Coffee & Breakfast |
| `cakes-events.html` | Custom Cakes & Events |
| `catering.html` | Catering & Fundraisers |
| `rewards.html` | Sweet Rewards |
| `gallery.html` | Gallery |
| `reviews.html` | Wall of Smiles (reviews) |
| `about.html` | Our Story |
| `contact.html` | Visit Us |
| `portal.html` | Owner Business Portal (private) |

---

## Task 3: Change Colors

All the site's colors are defined in **one place**, so changing the
palette site-wide is just a few line edits.

1. Go to `assets/css/styles.css`
2. Look at the very top of the file, inside the `:root { ... }` block
3. You'll see the current palette:

| Variable name | Current color | Used for |
|---|---|---|
| `--cream` | `#FFF8F0` | Page background |
| `--vanilla` | `#F7F1E6` | Section backgrounds, cards |
| `--chocolate` | `#4B352A` | Body text, headings |
| `--gold` | `#C48A3A` | Buttons, accents, dividers |
| `--raspberry` | `#C2185B` | Primary accent, main call-to-action buttons |
| `--teal` | `#007C9D` | Secondary accent, links |
| `--powder-pink` | `#F7D6DC` | Light accent panels |
| `--deep-coffee` | `#2F1E19` | Footer, header contrast |

4. To change a color, just replace the hex code after the colon — for
   example, changing `--raspberry: #C2185B;` to a different pink/red
   updates **every** raspberry-colored button, badge, and accent across
   the entire site automatically, on every page.

**You don't need to know what a hex code is** to use one — any color
picker tool (search "color picker" online, or use the one built into
Canva, Photoshop, etc.) will give you a 6-character code starting with
`#` that you can paste in directly.

---

## Task 4: Add or Remove a Navigation Link

The navigation menu appears near the top of every page. To change it,
you'll need to edit it in **each** HTML file (since each page has its
own copy of the header) — this is the one place where a single change
doesn't automatically apply everywhere.

Look for a block that looks like this near the top of any page file:

```html
<nav class="main-nav">
  <a href="index.html">Home</a>
  <a href="menu.html">Donuts</a>
  <a href="coffee.html">Coffee</a>
  ...
</nav>
```

Add, remove, or reorder the `<a href="...">Label</a>` lines as needed.
Because this exists on every page, this is the one task where I'd
recommend asking for help (or being extra careful to repeat the same
edit 11 times) — it's easy to make pages inconsistent by accident.

---

## Things to Be Careful With

- **Don't rename files** unless you're also updating every place that
  references them — renaming breaks the link between pages/images/styles.
- **Don't delete the `assets` folder** — it holds all your images,
  styles, and scripts. Deleting it breaks the whole site's appearance.
- **The Owner Portal passcode** (`portal.html`) is just a basic
  front-end gate, not real security — don't link real bank/POS accounts
  there without upgrading to proper login protection first.
- **Formspree forms** still need real form IDs (search for
  `REPLACE_WITH_FORM_ID` across the files) before form submissions will
  actually reach Theresa's email.

---

## When in Doubt

Bring me (or any developer) the exact file name and what you're trying
to change, and I'm happy to make the edit or walk you through it
step-by-step — this guide covers the common, low-risk changes you can
confidently make solo.
