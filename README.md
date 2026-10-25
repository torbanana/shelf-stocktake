# Shelf – a simple personal-care stocktake

**Use it:** https://torbanana.github.io/shelf-stocktake/ (open on your phone, then "Add to Home Screen").
Source: https://github.com/torbanana/shelf-stocktake. Every push to `main` redeploys automatically.

What you own, with **−** and **+** on every row, a shopping list made from whatever has run low,
and a fluffy blue Maltese under a starry sky.

## Run it

```bash
npm install
npm run dev      # opens on http://localhost:5173
npm run build    # production files in dist/
```

## The three tabs

- **Overview** – a night-sky hero with the pup, four tiles (none left, running low, stocked, total),
  the products that need buying, and a per-category breakdown. Tap a tile or category to jump to it.
  The ⋯ menu here has sample products, backup export/restore and delete-all.
- **Products** – everything you own. **−** / **+** on each row, never below 0. Items that have run out
  or are below their minimum float to the top and are highlighted; the rest are alphabetical.
  Search, category chips, tap a product to edit or delete, + to add.
- **Shopping** – exactly the products below their minimum, with how many to buy. **Bought** tops a
  product back up and it drops off the list. If you saved a shop link on the product, a
  **Buy online** button opens it.

## Per-product settings

- **Buy more when fewer than** (default 1 = only when it runs out). Set 2 to always keep a spare.
  Below this number the product is "running low" and goes on the shopping list.
- **Where to buy it** – paste the shop page. Shown as "Buy online" on the shopping list.

## Undo

Every change (−/+, bought, add, edit, delete) can be undone. An **↶ Undo** button appears in the top
bar of every tab whenever there is something to undo; the toast after a delete or a Bought also has
Undo. The undo history clears when the page reloads.

## Technical notes

| Question | Answer |
| --- | --- |
| Stack | Vite + React + TypeScript. Data in the browser's IndexedDB via Dexie. No backend. |
| External APIs | None. The page needs the network to load, but all data stays on the device. Image recognition would need a vision API and barcode lookup an external product database; neither is included. |
| Storage | One IndexedDB database called `shelf` with `products` and `categories` tables, on the device only. Clearing browser data wipes it, so the menu has Export/Restore backup. |
| Accounts / cloud | Not needed. If you later want the same list on two devices, that is the point to add a sync backend. |
| Deploy | `npm run build`, then upload `dist/` to any static host. This repo deploys to GitHub Pages from `.github/workflows/deploy.yml`. |

## Things deliberately left out (easy to add later)

Expiry dates, storage location, stocktake mode, product photos, image recognition, barcode
scanning and free-text shopping items. The data model is tiny, so any of these can be added as a
column on `Product` plus a field in `src/ProductSheet.tsx`.

## Layout

```
src/
  main.tsx              entry
  App.tsx               three tabs switched by the URL hash (#, #products[/category], #shopping)
  Overview.tsx          hero, tiles, needs-buying, by-category
  Inventory.tsx         the Products tab
  Shopping.tsx          the Shopping tab (Buy online + Bought)
  ProductSheet.tsx      add / edit / delete form (bottom sheet)
  MenuSheet.tsx         samples, backup, delete-all
  db.ts                 Dexie database + default categories
  types.ts              Product and Category types
  lib/products.ts       changes (all undoable), low-stock rules, sorting, URL helpers
  lib/undo.ts           the undo stack
  lib/sample.ts         sample products
  lib/backup.ts         export / import JSON
  components/           Pup (mascot), Sky (hero art), TopBar (with Undo), BottomNav, Sheet, Toast, …
  styles.css            starry-night tokens and components
public/                 favicon.svg (the pup) and PNG icons generated from it
```
