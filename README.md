# SOFRA — Lebanese Restaurant Menu & Ordering (Codveda Level 3 · Task 1)

Full-stack CRUD app: **React + Vite** → **REST API (Express)** → **MongoDB (Mongoose)**.
Dishes are the primary CRUD resource; categories have full CRUD too; customers place orders that are saved in MongoDB.

## Run it locally

Requirements: Node 18+ and MongoDB (local install, or a free MongoDB Atlas cluster).

```bash
# 1. install everything
npm run install:all

# 2. configure the backend
cp server/.env.example server/.env      # set ADMIN_PASSWORD; configure Cloudinary to test admin uploads

# 3. load the starting menu (9 categories, 50 items) into MongoDB
npm run seed

# 4. start backend (http://localhost:5000) and, in a second terminal, the frontend (http://localhost:5173)
npm run server
npm run client
```

* Website: http://localhost:5173
* **Admin dashboard: http://localhost:5173/admin** — sign in with `ADMIN_PASSWORD` from `server/.env`. If unset during local development, the server uses the demo password `sofra2026`; set your own value.
* API: http://localhost:5000/api/health

Production-style: `npm run build`, then `npm run server` also serves `client/dist` at http://localhost:5000.
Reset the menu any time with `npm run seed -- --force` (orders are kept).

## No MongoDB installed? One command
```bash
npm run install:all
npm run server:local-db      # starts its own MongoDB, seeds the menu, starts the API
npm run client               # second terminal
```
First run downloads a MongoDB server binary (~100 MB, needs internet). Data persists in `server/.data`. In this mode you do not need `server/.env` or `npm run seed`.

## Deploy: Vercel frontend + Express backend

The frontend and API are deployed separately. The API uses MongoDB Atlas and Cloudinary; uploaded photos are stored outside the backend filesystem.

### Vercel frontend

1. Import the repository into Vercel and set **Root Directory** to `client`. The included `client/vercel.json` keeps direct routes such as `/admin` working.
2. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
3. Add `VITE_API_URL=https://<your-backend-host>/api` to the Vercel project environment. Do not add a trailing slash. This URL is public; do not put credentials in any `VITE_` variable.
4. Redeploy after changing environment variables.

### Express backend host

1. Create a Node.js service with **Root Directory** `server`, Node.js 18 or newer, and **Start Command** `npm start`.
2. Configure the variables from `server/.env.example` in the host's secret/environment settings:
   - `MONGODB_URI`: the MongoDB Atlas connection string.
   - `ADMIN_PASSWORD`: a long, unique secret; never use the local demo password in production.
   - `CLIENT_ORIGINS`: comma-separated exact origins, without trailing slashes, e.g. `https://<your-project>.vercel.app,https://<your-custom-domain>`. Include any Vercel preview origins you need to use.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: values from the Cloudinary console. Keep these only on the backend.
   - `NODE_ENV=production`. The hosting platform supplies `PORT`.
3. In MongoDB Atlas, allow network access from the backend host (use its static egress IP if available).
4. Add the final backend API URL, ending in `/api`, as `VITE_API_URL` in Vercel and redeploy the frontend.
5. Seed the Atlas database once with the starting menu by running `npm run seed --prefix server` while `MONGODB_URI` points to Atlas.

Local photo files under `client/public/assets/images` are served by Vercel as static assets. New photos uploaded through Admin are sent directly to Cloudinary and their secure URLs are saved in MongoDB.

## MongoDB connection
Local: `MONGODB_URI=mongodb://127.0.0.1:27017/sofra`.
Atlas: paste your `mongodb+srv://…` string into `server/.env`. Credentials only live in the backend `.env`.

## REST API
| Resource | Endpoints |
|---|---|
| Admin | `POST /api/admin/login`, `GET /api/admin/verify`, `POST /api/uploads/dish-image` (multipart field `image`, JPG/PNG/WebP/AVIF ≤ 5 MB) |
| Categories | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id` (delete refused with 409 while it still has dishes) |
| Dishes | `GET/POST /api/dishes` (`?category=slug&search=&featured=true`), `GET/PUT/DELETE /api/dishes/:id` |
| Orders | `POST /api/orders`, `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/orders/stats`, `GET /api/orders/lookup/:orderId` |

**Who can do what:** everyone can `GET` the menu, categories and place/look up an order. Every other write (dish/category create-update-delete, uploads, listing/updating/deleting orders) needs the admin password and returns **401** otherwise.

Order totals are computed on the server from database prices; unavailable dishes are rejected.

## Features
* Customer: animated hero, featured dishes, category showcase, story, searchable/filterable menu, dish details with ingredients and optional add-ons, cart drawer (persisted in localStorage, re-synced with live prices/availability), checkout with validation, order confirmation, mascot with the three required Arabic messages, mobile menu, reduced-motion support.
* Admin: overview with live DB stats, dishes CRUD (price, category, description, ingredients, image, availability, featured, add-ons), categories CRUD, orders list with status updates (Pending / Preparing / Delivered).
* Limestone background is generated in CSS/SVG (procedural noise lighting), not a photo.

## Real food photography — how to add it
**No photographs are bundled.** The build environment could not reach Unsplash, Pexels or Pixabay and could not view images, so nothing was chosen blind. Until photos are added, dishes show a clean text card, the hero shows only the limestone + text, and the "Taste of Lebanon" strip shows only its text (tiles appear only for dishes that have a photo — no empty cards).

Add photos by dropping files into `client/public/assets/images/` with these names (jpg / jpeg / png / webp / avif):

| Folder | File names |
|---|---|
| `dishes/` | `<dish-slug>.jpg` — `hummus`, `moutabal`, `baba-ghanouj`, `tabbouleh`, `fattoush`, `warak-enab`, `labneh`, `kibbeh`, `cheese-rakakat`, `sambousek`, `batata-harra`, `grilled-halloumi`, `soujouk`, `shish-tawook`, `kafta`, `shish-kebab`, `mixed-grill`, `grilled-chicken`, `kibbeh-bil-sanieh`, `sayadieh`, `kafta-bil-sanieh`, `moghrabieh`, `fatteh`, `knefeh`, `baklava`, `maamoul`, `sfouf`, `meghli`, `jallab`, `ayran`, `lebanese-lemonade`, `tamarind`, `fresh-juice` |
| `categories/` | `cold-mezza`, `hot-mezza`, `lebanese-grill`, `traditional-dishes`, `desserts`, `drinks` |
| `site/` | `hero` (wide landscape table photo, right side is what shows), `story`, and optional transparent PNGs `rakwe`, `jarn`, `lantern`, `jug` (real heritage objects) and `cedar` (real cedar for the menu cover) |

Then:
```bash
npm run photos:scan                      # wires the files in
npm run photos:check                     # confirms each file really is an image (and warns on duplicates)
npm run seed -- --force --prefix server  # or: cd server && npm run seed -- --force
```
Dish photos can also be changed one at a time in **/admin → Dishes → Edit → Dish photo → Upload photo** (live preview). Record every source, photographer and licence in `PHOTO_CREDITS.md`.

## Menu cover, cedar and heritage objects (honest notes)
* The **menu cover** (emerald leather, gold foil, سُفْرَة, "OPEN MENU") opens like a hardcover book using CSS 3D transforms. It appears when visitors arrive via "Our Menu"; links straight to a category skip it. Reduced-motion users get a simple fade.
* The **cedar** on the cover is a procedurally drawn gold-foil *engraving*, not a photograph and not a 3D model. For a photoreal cedar, add a transparent `site/cedar.png`.
* The **mascot** and **heritage objects** (copper rakwe, jarn, lantern, jug) are shaded layered SVG, **not** photoreal or GLB/GLTF models — no licensed assets could be obtained here. Transparent photos of real objects in `site/` replace the drawn ones automatically.

## Testing status
UI flows (book entrance, menu cover, cart, checkout, mascot messages, admin CRUD, mobile) were exercised in a real browser against a temporary in-memory stand-in for the API, because MongoDB could not be installed in the build sandbox. `server/scripts/smoke-test.js` (`npm run test:api --prefix server`) runs 30+ checks against the real API + MongoDB; **run it on your machine** after seeding.


## Admin photo uploads
In **/admin → Dishes → New/Edit → Upload photo**, files are checked by type, real image signature and size, streamed to Cloudinary, and the returned secure URL is saved on the dish or category. Replaced or deleted uploads are removed from Cloudinary when no record still references them. Configure the backend Cloudinary variables as described in `server/.env.example`. Dishes with no photo show a card labelled **"Photo coming soon"** — no fake pictures are used.

## Menu & photos (from your ZIP)
Nine categories: Cold Mezza, Hot Mezza, Lebanese Grill, Main Courses, **Manakish**, Lebanese Desserts, Fresh Drinks, Coffee & Hot Drinks, **Shisha**. Only items that have a matching photo in your ZIP are on the menu (39 photographed dishes + 5 Manakish + 6 Shisha). **Manakish and Shisha each use ONE shared photo** (`assets/images/categories/manakish.jpg`, `shisha.jpg`; category layout = *Shared photo*), with every variety listed under it with its own Arabic name, price and Add button.

Photos live in `client/public/assets/images/dishes/<dish-slug>.jpg` and `categories/<category-slug>.jpg`. Photos that were not used (extra dishes not on your list, a duplicate, and a mixed-juice photo that needs your confirmation) are in the `Unidentified Images/` folder with a table explaining each.

**Prices are placeholders** (flagged `pricePlaceholder`; admin shows a yellow *placeholder* tag). Editing a price in /admin clears the flag. Run `npm run seed -- --force` once to load this menu.

Admin → Categories: add/rename/delete categories, Arabic name, upload/replace/remove the category photo, and choose *Photo per dish* or *Shared photo*.

## Extra tests
`npm run test:offline --prefix server` (no database needed) checks the admin guard, Cloudinary upload handling, CORS and model validation (37 checks; run before the DB tests).

## Mascot (waiter)
Exactly five approved Arabic messages, defined in `client/src/context/MascotContext.jsx`: opening the website (once per browser tab session), selecting a dish (opening its details), adding to cart, opening the cart, and a successful checkout (only after the server accepts the order). No other actions trigger the mascot.

## Entrance
The SOFRA book (`MenuCover.jsx`, mounted in `Layout.jsx`) is the single entrance: shown once per browser tab session, the customer clicks **Open**, the book opens, then the Home page appears. "Explore Our Menu" and the Our Menu link go straight to the menu with no book. The old green curtain animation was removed.
