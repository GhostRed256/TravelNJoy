# TravelNJoy — Setup Guide

## Quick Start (Demo Mode)

The app works out-of-the-box with demo data. No Google API setup required to browse the site!

```bash
cd app
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

> **Admin login**: Go to `/admin/login` and use password `admin123`

---

## Full Setup with Google Sheets Sync

To enable real car record syncing and photo uploads to Google Drive, follow these steps:

### Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → Name it `TravelNJoy`
3. Click **Create**

### Step 2 — Enable APIs

In your project, go to **APIs & Services → Library** and enable:
- ✅ **Google Sheets API**
- ✅ **Google Drive API**

### Step 3 — Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Name: `travelnj-service`
4. Click **Create and Continue** (skip optional fields)
5. Click **Done**

### Step 4 — Create Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key → Create new key → JSON**
4. Download the JSON file (keep it safe, never commit it!)

### Step 5 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **TravelNJoy Records**
3. Create two tabs:
   - `Cars` (leave blank — the app will populate headers automatically)
   - `Messages` (leave blank — the app will populate headers automatically)
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
   ```

### Step 6 — Share Sheet with Service Account

1. Open your Google Sheet
2. Click **Share**
3. Enter the service account email (looks like `travelnj-service@your-project.iam.gserviceaccount.com`)
4. Set permission to **Editor**
5. Click **Send**

### Step 7 — Create Google Drive Folder

1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder named `TravelNJoy Car Photos`
3. Right-click the folder → **Share** → share with your service account email as **Editor**
4. Copy the Folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/[THIS_IS_YOUR_FOLDER_ID]
   ```

### Step 8 — Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=travelnj-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_FROM_JSON\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
ADMIN_PASSWORD=your_secure_password_here
```

> ⚠️ **Important**: The private key in the JSON file has actual newlines. Replace them with `\n` when copying to `.env.local`.

### Step 9 — Restart and Test

```bash
npm run dev
```

Test the connection:
1. Go to `/admin/login` → login
2. Click **Add Car** and fill in details + photo
3. Check your Google Sheet — the new row should appear!

---

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── cars/
│   │   │   ├── page.tsx          # Car listings
│   │   │   └── [id]/page.tsx     # Car detail
│   │   ├── chat/page.tsx         # Customer chat
│   │   ├── admin/
│   │   │   ├── login/page.tsx    # Admin login
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   └── chat/page.tsx     # Admin chat
│   │   └── api/
│   │       ├── sheets/
│   │       │   ├── cars/route.ts      # GET/POST cars
│   │       │   ├── cars/[id]/route.ts # PUT/DELETE car
│   │       │   └── upload/route.ts    # Image upload
│   │       ├── chat/
│   │       │   ├── route.ts          # GET/POST messages
│   │       │   └── sessions/route.ts # GET all chat sessions
│   │       └── admin/
│   │           ├── login/route.ts
│   │           ├── me/route.ts
│   │           └── logout/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── CarCard.tsx
│   ├── lib/
│   │   ├── sheets.ts    # Google Sheets client
│   │   ├── drive.ts     # Google Drive upload
│   │   └── utils.ts     # Helpers + demo data
│   └── types/
│       └── car.ts       # TypeScript types
├── public/
│   ├── hero-banner.png
│   ├── car-sedan.png
│   ├── car-suv.png
│   └── logo.png
├── .env.local            # Your config (gitignored)
├── .env.local.example    # Template
└── next.config.ts
```

---

## Google Sheets Structure

### Tab: `Cars`
| Column | Field | Example |
|--------|-------|---------|
| A | id | `car_1234_abc` |
| B | make | `Toyota` |
| C | model | `Camry` |
| D | year | `2021` |
| E | price | `2200000` |
| F | mileage | `32000` |
| G | fuel | `petrol` |
| H | transmission | `automatic` |
| I | color | `Pearl White` |
| J | description | `Full description...` |
| K | images | `URL1, URL2, URL3` |
| L | status | `available` |
| M | features | `Sunroof, Leather Seats` |
| N | engine | `2.5L 4-cylinder` |
| O | owners | `1` |
| P | createdAt | `2024-01-15T10:00:00Z` |
| Q | updatedAt | `2024-02-01T08:00:00Z` |

### Tab: `Messages`
| Column | Field | Example |
|--------|-------|---------|
| A | id | `msg_1234_xyz` |
| B | customerId | `cust_5678_abc` |
| C | customerName | `Rahul Sharma` |
| D | message | `Is this car available?` |
| E | sender | `customer` or `admin` |
| F | timestamp | `2024-01-15T14:30:00Z` |
| G | read | `true` or `false` |

---

## Changing Admin Password

Edit `.env.local`:
```
ADMIN_PASSWORD=my_new_secure_password
```
Restart the dev server.

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy!

### Other Platforms
Any platform supporting Node.js 18+ and Next.js 15 will work.
Set the environment variables in your platform's dashboard.
