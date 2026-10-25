# Shelf – a simple personal-care stocktake

**Use it:** https://torbanana.github.io/shelf-stocktake/ (open on your phone, then "Add to Home Screen").
Source: https://github.com/torbanana/shelf-stocktake. Every push to `main` redeploys automatically.

A list of what you own with **−** and **+** on every row, a shopping list made from whatever has
run low, and a small Maltese pup keeping an eye on it all.

## Run it

```bash
npm install
npm run dev      # opens on http://localhost:5173
npm run build    # production files in dist/
```

Open it on your phone by visiting your computer's address on the same Wi-Fi
(`npm run dev -- --host` prints it), or deploy the `dist/` folder (see below).

## What it does

- **My shelf**: every product with name, brand (optional), category, quantity and an optional unit.
  **−** / **+** on each row to record using something up or buying more. Never goes below 0.
- **Buy more when fewer than**: each product has a number (default 1). Below it, the product is
  "running low"; at 0 it is "none left". Both float to the top of every tab and are highlighted.
  Everything else is alphabetical.
- **Shopping list**: a card at the top says how many items need buying and opens the shopping
  page. It lists exactly the low products with how many to buy. **Bought** tops a product back up
  to its minimum and it drops off the list. The phone's back button returns to the shelf.
- **Undo**: deleting a product or marking something bought shows a toast with Undo for a few seconds.
- **Search** by name or brand, and **category tabs**. Tap a product to edit or delete it.
- **Add** with the + button. Create your own categories from the category dropdown.
- **⋯ menu**: load/remove sample products, export a JSON backup, restore a backup, delete everything.
- Soft pastel look, light and dark, with the pup as the app icon (PNG icons for Home Screen).
- No server or account needed; your data stays on the device.

## Technical notes

| Question | Answer |
| --- | --- |
| Stack | Vite + React + TypeScript. Data in the browser's IndexedDB via Dexie. No backend. |
| External APIs | None. The page needs the network to load, but all data stays on the device. Image recognition would need a vision API and barcode lookup an external product database; neither is included. |
| Storage | One IndexedDB database called `shelf` with `products` and `categories` tables, on the device only. Clearing browser data wipes it, so the menu has Export/Restore backup. |
| Accounts / cloud | Not needed. If you later want the same list on two devices, that is the point to add a sync backend. |
| Deploy | `npm run build`, then upload `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). `base: './'` in `vite.config.ts` means it works from any folder. On a phone, "Add to Home Screen" gives an app-like icon (manifest included). |

## Things deliberately left out (easy to add later)

Expiry dates, storage location, stocktake mode, product photos, image recognition, barcode
scanning and free-text shopping items were left out to keep the app small. The data model is
tiny, so any of these can be added as a column on `Product` plus a field in `src/ProductSheet.tsx`.

## Layout

```
src/
  main.tsx            entry
  App.tsx             two screens switched by the URL hash (#shopping)
  Inventory.tsx       the shelf: header, shopping card, search, category tabs, sorted list, + button
  Shopping.tsx        the shopping list page
  ProductSheet.tsx    add / edit / delete form (bottom sheet)
  MenuSheet.tsx       samples, backup, delete-all
  db.ts               Dexie database + default categories
  types.ts            Product and Category types
  lib/products.ts     create / update / change quantity / low-stock rules / sorting
  lib/sample.ts       sample products
  lib/backup.ts       export / import JSON
  components/         Pup (mascot SVG), Sheet + ConfirmDialog, Toast, QuantityStepper, EmptyState, Field
  styles.css          design tokens (light + dark) and components
public/               favicon.svg (the pup) and PNG icons generated from it
```
