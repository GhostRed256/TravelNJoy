<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:travelnjoy-context -->
# TravelNJoy Project Context (DO NOT FORGET)

## Golden Rule & Loop Prevention
Firestore is the absolute source of truth. Google Sheets is a secondary writable surface.
To prevent infinite sync loops, any write to Firestore or Apps Script requires a **diff-before-write** check.

## Architecture
- Next.js / Vercel API (`/api/cars`, `/api/sync-from-sheets`) communicates with Firestore.
- Google Sheet is updated via Apps Script Webhooks (`upsert`, `markSold`).
- Sheet manual edits trigger Next.js API via Apps Script `onEdit`.

## Sheet Structure & `sheetRow`
- We use the cached `sheetRow` on the Firestore document to precisely target updates on the "Listed & Reserved" sheet.
- When a car is sold, the row is cleared (not deleted, to preserve indexing for other `sheetRow` values) and moved to the "Sold" sheet.

## Data Privacy / Schema
- Schema in `src/types/car.ts` strictly separates public data from sensitive admin data.
- Public website displays only: Make, Model Variant, Year, Price, Color, and specs.
- Sensitive documents (RC, Insurance, PUC, NOC, Aadhar, PAN) and seller/buyer details are exclusively accessible through the Admin Panel.
<!-- END:travelnjoy-context -->

<!-- BEGIN:setup-progress -->
# Setup Progress (RESUME HERE)

## What Is Done
- Next.js app fully built: public site, admin panel with login, car CRUD, file uploads
- Firebase project created (project ID: `travelnjoy`)
- Firebase Admin SDK keys saved in `.env.local` (FIREBASE_ADMIN_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)
- Firebase client-side config saved in `.env.local` (all NEXT_PUBLIC_ keys)
- Google Sheet created and linked to Apps Script
- Apps Script deployed as Web App (URL saved in `.env.local` as SHEETS_WEBAPP_URL)
- Apps Script code is in `apps-script/Code.gs` — DO NOT recreate it, it already handles upsert/markSold/delete/onEdit
- `firebase-admin.ts` uses modular imports: `firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/storage`
- `@opentelemetry/api` npm package installed (was missing, caused silent crashes)
- Car detail page (`src/app/cars/[id]/page.tsx`) fixed to fetch from `/api/cars/${id}` instead of old `/api/sheets/cars`
- Autocomplete hints added for Make and Model fields in admin panel

## BLOCKED: One Step Remaining
**The Cloud Firestore API is NOT enabled yet in Google Cloud Console.**
The user must visit this URL and click "Enable":
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=travelnjoy

Once enabled, wait 1-2 minutes, then restart `npm run dev`. Everything will work:
- Cars save to Firestore permanently
- Cars show on public site after refresh
- Google Sheet auto-populates with headers and data via Apps Script

## Apps Script CONFIG Needs Update (after Vercel deploy)
In Google Apps Script editor, update these values in `CONFIG`:
- `VERCEL_API_URL` → actual Vercel domain (e.g. `https://travelnjoy.vercel.app`)
- `SYNC_SECRET` → a shared secret (also add to `.env.local` as `SYNC_SECRET`)
Without these, Sheet→Firestore sync (onEdit) won't work, but Firestore→Sheet sync will work fine.

## Key Files
- `src/lib/firebase-admin.ts` — Firebase Admin singleton
- `src/app/api/cars/route.ts` — GET all cars, POST new car
- `src/app/api/cars/[id]/route.ts` — GET/PUT/DELETE single car
- `src/app/admin/page.tsx` — Admin dashboard with car CRUD
- `src/app/cars/[id]/page.tsx` — Public car detail page
- `src/app/cars/page.tsx` — Public car listing page
- `apps-script/Code.gs` — Google Apps Script (already deployed)
- `.env.local` — All secrets (DO NOT commit)
<!-- END:setup-progress -->
