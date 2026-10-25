# Shelf – a simple personal-care stocktake

**Use it:** https://torbanana.github.io/shelf-stocktake/ (open on your phone, then "Add to Home Screen").
Source: https://github.com/torbanana/shelf-stocktake. Every push to `main` redeploys automatically.

One screen that lists what you own, grouped by category, with **−** and **+** on every row.
Items that have run out (0) or are on their last one (1) float to the top of every tab and are
highlighted, so you can see at a glance what to buy.

## Run it

```bash
npm install
npm run dev      # opens on http://localhost:5173
npm run build    # production files in dist/
```

Open it on your phone by visiting your computer's address on the same Wi-Fi
(`npm run dev -- --host` prints it), or deploy the `dist/` folder (see below).

## What it does

- **List of products** with name, brand (optional), category, quantity and an optional unit
  (tubes, bottles…).
- **− / +** on each row to record using something up or buying more. Never goes below 0.
- **Low items first**: every tab (All, Makeup, Skincare, …) is sorted by quantity, so 0s come
  first (red, "None left"), then 1s (amber, "Last one"), then everything else alphabetically.
- **Search** by name or brand, and **category tabs**.
- **Tap a product** to edit or delete it (delete asks for confirmation).
- **Add** with the + button. You can create your own categories from the category dropdown.
- **⋯ menu**: load/remove sample products, export a JSON backup, restore a backup, delete everything.
- No server or account needed; your data stays on the device. Follows your phone's light/dark setting.

## Technical notes

| Question | Answer |
| --- | --- |
| Stack | Vite + React + TypeScript. Data in the browser's IndexedDB via Dexie. No backend. |
| External APIs | None. The page needs the network to load, but all data stays on the device. Image recognition would need a vision API and barcode lookup an external product database; neither is included. |
| Storage | One IndexedDB database called `shelf` with `products` and `categories` tables, on the device only. Clearing browser data wipes it, so the menu has Export/Restore backup. |
| Accounts / cloud | Not needed. If you later want the same list on two devices, that is the point to add a sync backend. |
| Deploy | `npm run build`, then upload `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). `base: './'` in `vite.config.ts` means it works from any folder. On a phone, "Add to Home Screen" gives an app-like icon (manifest included). |

## Things deliberately left out (easy to add later)

Expiry dates, storage location, minimum-stock thresholds per product, shopping list,
stocktake mode, product photos, image recognition and barcode scanning were all removed
to keep the app to a single, fast screen. The data model is small, so any of these can be
added back as a column on `Product` plus a field in `src/ProductSheet.tsx`.

## Layout

```
src/
  main.tsx          entry
  App.tsx           shell
  Inventory.tsx     the one screen: header, search, category tabs, sorted list, + button
  ProductSheet.tsx  add / edit / delete form (bottom sheet)
  MenuSheet.tsx     samples, backup, delete-all
  db.ts             Dexie database + default categories
  types.ts          Product and Category types
  lib/products.ts   create / update / change quantity / delete
  lib/sample.ts     sample products
  lib/backup.ts     export / import JSON
  components/       Sheet + ConfirmDialog, Toast, QuantityStepper, EmptyState, Field
  styles.css        design tokens (light + dark) and components
```
