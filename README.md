# TERRALOG PRO - Enterprise Geotechnical Operations Platform

A production-ready, full-stack geotechnical investigation operations platform consisting of two synchronized clients and a unified backend:

1. **Mobile Field App (`/mobile`)**: React Native with Expo & TypeScript, offline-first local queue, client-side photo compression, device GPS telemetry, and 3 dedicated photo capture slots.
2. **Office Management Desktop Web App (`/web`)**: Next.js App Router, TypeScript, Tailwind CSS, TanStack Table (`@tanstack/react-table`), Recharts, Supabase Realtime subscriptions, and deep inspection modal.
3. **Backend OCR & Excel Generator Service (`/backend-ocr`)**: Node.js, Express, TypeScript, Google Gemini Vision API (`@google/generative-ai`), domain-specific heuristic geotechnical parser, and standardized `.xlsx` borehole log engine powered by `exceljs`.
4. **Cloud Infrastructure (`/supabase`)**: PostgreSQL schema, Row Level Security (RLS) policies for multi-tenant project assignment, storage buckets, and Realtime WebSocket publications.

---

## System Architecture

```
GEO TECHNICAL/
├── supabase/
│   ├── migrations/
│   │   └── 20261103_geotechnical_init.sql  # DDL, RLS policies, Storage buckets, Realtime publication
│   └── seed.sql                            # Production-grade seed data (Users, Metro & Tower projects, Logs)
│
├── backend-ocr/                            # Node.js + Express OCR & Excel Generator Service
│   ├── src/
│   │   ├── controllers/
│   │   │   └── extractionController.ts     # Upload handler, OCR execution, Excel creation, DB sync
│   │   ├── services/
│   │   │   ├── geminiVisionService.ts      # Gemini 1.5 Flash multimodal vision extractor
│   │   │   ├── ocrExtractor.ts             # Orchestrator with intelligent geotechnical heuristic fallback
│   │   │   ├── excelGenerator.ts           # Standardized ASTM D1586 / IS 1892 .xlsx generator via exceljs
│   │   │   └── supabaseService.ts          # Storage upload & site_logs relational persistence
│   │   ├── types/
│   │   │   └── geotechnical.ts             # Geotechnical TypeScript definitions
│   │   ├── routes/
│   │   │   └── apiRoutes.ts                # /api/health, /api/extract, /api/export-xlsx
│   │   ├── config.ts                       # Environment variable loader
│   │   └── index.ts                        # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── web/                                    # Office Management Desktop Web App (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                  # Root layout
│   │   │   ├── page.tsx                    # Operations Console, Realtime Feed, TanStack Table
│   │   │   ├── projects/page.tsx           # Multi-Project & Field Assignment Engine
│   │   │   └── analytics/page.tsx          # Subsurface Profiler & Cross-Borehole Correlation
│   │   ├── components/
│   │   │   ├── DashboardHeader.tsx         # KPI metrics, Realtime pulse, Navigation
│   │   │   ├── OperationsTable.tsx         # TanStack Table (filter by project, borehole, status, date)
│   │   │   ├── DeepInspectionModal.tsx     # 2-Pane Side-by-Side QA Viewer & verification controls
│   │   │   ├── PhotoViewer.tsx             # Zoomable high-res viewer (Field Sheet, Card, Rig photo)
│   │   │   ├── StratigraphyChart.tsx       # Recharts subsurface depth vs SPT N-value and recovery
│   │   │   ├── StatusBadge.tsx             # Approved, Pending Review, Flagged for Re-test
│   │   │   └── ExportModal.tsx             # Universal CSV & standardized XLSX export hub
│   │   ├── lib/
│   │   │   ├── supabaseClient.ts           # Supabase client & live subscription listener
│   │   │   ├── exportUtils.ts              # CSV batch downloader & XLSX trigger
│   │   │   └── mockData.ts                 # Calibrated seed data with demo fallback
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── mobile/                                 # React Native (Expo) Field App (Offline-First)
    ├── src/
    │   ├── components/
    │   │   ├── PhotoCaptureSlot.tsx        # 3 dedicated capture slots with compression badge
    │   │   ├── SyncBanner.tsx              # Real-time network indicator & queue counter
    │   │   ├── GpsStatusBadge.tsx          # Device GPS auto-tagging with accuracy meter
    │   │   └── StrataSelectorModal.tsx     # IS 1498 / USCS Soil classification picker
    │   ├── lib/
    │   │   ├── offlineStorage.ts           # Local storage queue (AsyncStorage / SQLite)
    │   │   ├── syncManager.ts              # Reconnect listener & automatic upload dispatcher
    │   │   └── imageCompressor.ts          # Client-side 80-90% bandwidth compression
    │   ├── screens/
    │   │   ├── LoginScreen.tsx             # Role authentication for Field Engineers
    │   │   ├── ProjectSelectorScreen.tsx   # Assigned Active Projects (RLS-enforced)
    │   │   ├── BoreholeLogScreen.tsx       # Primary geological data entry & multi-photo form
    │   │   └── SyncQueueScreen.tsx         # Inspection of offline queued drafts & status
    │   └── types/
    │       └── index.ts
    ├── App.tsx                             # Screen router & state container
    ├── app.json
    └── package.json
```

---

## Core Workflows

### 1. Multi-Project & Assignment Engine (RLS Enforced)
- **Office Managers & Admins** create projects and assign certified Field Engineers via `project_assignments`.
- **Field Engineers** log into the mobile app and see **only active projects assigned to them**, preventing accidental data entry across unrelated sites.
- Engineers select assigned projects and station boreholes (e.g., `BH-01`, `TP-02`).

### 2. Mobile Data & Photo Capture (Offline-First)
- **Dedicated 3 Photo Capture Slots**:
  1. *Site Environment / Rig Photo* (Setup alignment, rig type, casing depth)
  2. *Sample Tag Card* (Close-up of specimen label, run ID, depth)
  3. *Physical Field Log Sheet / Ledger* (Raw field paperwork)
- **Automatic Client-Side Image Compression**: Raw high-res photos (8MB–15MB) are resized to max 1600px edge and compressed at 72% JPEG quality to ~600KB (**80–90% cellular data savings**).
- **Offline Queue**: Form entries and compressed images are stored immediately in local flash storage. When cell signal drops, work continues uninterrupted.
- **Auto-Sync Uplink**: `SyncManager` listens to network state and flushes pending records to the backend when connectivity resumes.
- **GPS Telemetry**: High-precision latitude, longitude, and accuracy (e.g., ±2.8m) are captured automatically.

### 3. Vision OCR & Automated XLSX Generator Engine
- Uploaded field sheets are parsed using **Google Gemini Vision API** (`gemini-1.5-flash`) or the built-in **Geotechnical Domain Heuristic Parser**.
- Extracts tabular columns: Run No, Depth From/To, Strata Classification, SPT Blow Counts (0-15cm, 15-30cm, 30-45cm, Total N-value), Core Recovery %, RQD %, and Water Table Depth.
- Auto-generates a standardized `.xlsx` spreadsheet via `exceljs` featuring:
  - Official borehole ledger header (Project, Client, Rig, Elevation, Coordinates, Field Engineer)
  - Color-coded lithology stratigraphy (Rose for Clay, Yellow for Sand, Slate for Granite)
  - SPT blow counts and core recovery columns
  - Lead PE certification and signature blocks
- Uploads the generated file to Supabase Storage and returns a direct download URL.

### 4. Office Management Dashboard
- **WebSocket Realtime Updates**: Connected to Supabase Realtime channel `realtime_site_logs`. When a field engineer submits a test or syncs offline drafts, the office dashboard updates instantly without browser refresh.
- **Operations TanStack Table**: Sort and filter by Project, Borehole ID, Date, Engineer, and Verification Status.
- **Deep Inspection 2-Pane Viewer**:
  - *Left Pane*: Extracted & verified data fields (Depth, Strata, SPT, Water table, GPS pin, timestamps).
  - *Right Pane*: Zoomable high-res photo viewer with OCR annotations overlay.
  - *QA Verification Controls*: Mark "Approved", "Pending Review", or "Flagged for Re-test" with Lead Geologist review comments.
- **Subsurface Profiler**: Recharts depth profile of SPT N-values and rock core recovery against depth.
- **Export Hub**: One-click download of standardized `.xlsx` or batch CSV export of project records.

---

## Quickstart & Local Execution

### 1. Database (Supabase)
Apply the SQL migration and seed files in your Supabase project dashboard or local CLI:
```bash
# In Supabase SQL Editor:
1. Run: supabase/migrations/20261103_geotechnical_init.sql
2. Run: supabase/seed.sql
```

### 2. Backend OCR & Excel Generator
```bash
cd backend-ocr
npm install
npm run build
npm start
# Service runs on http://localhost:4000
# Health check: http://localhost:4000/api/health
```

### 3. Office Management Web Dashboard
```bash
cd web
npm install
npm run build
npm start
# Dashboard runs on http://localhost:3000
```

### 4. Mobile Field App
```bash
cd mobile
npm install
npx expo start
```

