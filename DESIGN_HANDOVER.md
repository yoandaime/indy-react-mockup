# Design Handover — NDQ (INDY) React Mockup

**Ini masih mock-up.** Semua halaman baca dari mock data lokal di
`src/data/`. Belum ada integrasi backend sama sekali di repo ini (lihat
bagian "Out of Scope" di `CLAUDE.md`) — kalau ada yang keliatan kayak
manggil API, itu belum beneran ada.

---

## Rincian per menu

### Applications — `/applications`

- **Entry:** `src/pages/ApplicationsPage.jsx`
- **Pendukung:** `src/components/applications/ApplicationsSidebar.jsx`,
  `MainDashboardView.jsx`, `TrendAreaChart.jsx`
- **Mock data:** `src/data/applicationsDashboardData.js`
- **Catatan desain:** Grid launcher buat aplikasi data quality (Main
  Dashboard, Report Management, RCA, Custom Report, Bot) pakai ikon PNG dari
  `src/assets/application-icons/`. `MainDashboardView` satu-satunya tujuan
  yang udah dibangun lengkap; ini referensi implementasi Recharts di proyek
  ini (`TrendAreaChart.jsx`).

### Insiden Management (Ticketing) — `/ticketing`

- **Entry:** `src/pages/TicketingPage.jsx` (list/board),
  `TicketingDetailPage.jsx` (detail satu tiket), keduanya dibungkus
  `src/components/ticketing/TicketingLayout.jsx`
- **Sub-route admin:** `/ticketing/admin/*` → `src/pages/ticketing-admin/*`
  (Dashboard, SLA Management, PIC Category (+ detail), Audit Log, Manage
  Users, Content Moderation, Manage Categories)
- **Pendukung:** `src/components/ticketing/*` (18 komponen — badge, dialog,
  timeline, sidebar, category nav, dll)
- **Mock data:** `src/data/ticketingData.js`, `src/data/picCategoryData.js`
- **Catatan desain:** Area fitur paling gede dan paling matang — jadiin ini
  referensi buat "seharusnya kayak apa sebuah bagian admin yang udah jadi"
  (toggle grid/kanban/list, nested tabs, dialog, avatar stack).
  `ManageUsersSection.jsx` contoh baku pemakaian komponen `Table` yang
  bener (header/cell sejajar, kolom aksi, status pill) — tiru pola ini,
  bukan pola CSS-grid `SubscriptionPage.jsx` versi awal (yang sekarang
  udah diperbaiki).

### Data Observability — `/data-observability`

- **Entry:** `src/pages/DataObservabilityPage.jsx` (~1000 baris — halaman
  terbesar kedua di repo ini)
- **Pendukung:** `src/components/dataObservability/*` (Composer
  fields/results, Profiling fields/results, Rules management list, Save
  Rule dialog)
- **Mock data:** `src/data/dqComposerMockData.js`, logika rule catalog di
  `src/lib/dqComposer/`
- **Catatan desain:** Workspace rule-builder / profiling. Pakai
  `MultiSelect`, `Textarea`, `Label`, dan `Table` asli — referensi kedua
  yang enak buat UI admin yang berat form, selain Ticketing.

### Enrich Data — `/enrich-data/admin` (+ `/enrich-data/register`)

- **Entry:** `src/pages/EnrichDataAdminPage.jsx` (list),
  `EnrichDataAdminDetailPage.jsx`, `EnrichDataAddPage.jsx` (wizard koneksi
  baru), `src/pages/RegisterDataPage.jsx` (halaman berdiri sendiri, diakses
  dari portal, **bukan** di balik sidebar layout)
- **Mock data:** `src/data/adminConnections.js`,
  `src/data/enrichDataWizardMock.js`
- **Catatan desain:** Cuma bagian ini yang pakai `ViewModeContext`
  (`src/context/ViewModeContext.jsx` + `src/components/ViewModeBar.jsx`)
  buat toggle view mode bar "admin" di bawah layout — jangan langsung tiru
  pola ini ke bagian lain tanpa cek dulu apa memang perlu.
  `RegisterDataPage.jsx` memang sengaja dibikin simpel bergaya "coming
  soon" — bukan kelupaan, memang belum dibangun.

### Customer Data Ops — `/subscription`

- **Entry:** `src/pages/SubscriptionPage.jsx` (gede banget — tab utamanya
  **User Management** dan **Subscription**)
- **Pendukung:** `src/components/subscription/*` — `UserDetailView.jsx`
  (profil user + subscription + activity, layout 3 kolom), `shared.jsx`
  (`TagRow`, `ActivityLogEntry` — dipakai bareng antara halaman detail
  user dan halaman utamanya), plus wrapper ECharts
  (`DimensionBarChart.jsx`, `LoginDurationChart.jsx`,
  `VisitorTrendChart.jsx`, `PlatformActivitySummary.jsx`)
- **Mock data:** `src/data/subscriptionAdminData.js` (user, field profil,
  activity log, statistik platform activity), `src/data/subscriptionTables.js`
  (katalog table yang bisa disubscribe + tier dimensi DQ)
- **Catatan desain:** Ini bagian yang paling baru diiterasi dan referensi
  terbaik sekarang buat: pola nested-tabs, integrasi ECharts pakai helper
  warna Tailwind, dan pola list dengan expandable-row berbasis `<Table>`
  asli (`TableSubscriptionRow` di `SubscriptionPage.jsx`). Kalau kamu mau
  bikin layar admin list+detail baru di bagian lain aplikasi, mulai dari
  baca file ini sampai habis.

### Catalog Knowledge — `/catalog-knowledge`

- **Entry:** `src/pages/CatalogKnowledgePage.jsx`
- **Catatan desain:** Cuma placeholder (empty state "Under development").
  Belum ada keputusan layout apa pun di sini — jangan nyimpulin konvensi
  dari halaman ini.

### INDY Assistant — `/indy-assistant`

- **Entry:** `src/pages/IndyAssistantPage.jsx`
- **Pendukung:** `src/components/indyAssistant/*` (chat input/message,
  brand header, sidebar, stat card, tabel DQ)
- **Mock data:** `src/data/indyAssistantData.js` (termasuk
  `getMockAssistantReply` — generator respons kalengan, bukan pemanggilan
  model beneran)
- **Catatan desain:** Layout gaya chat dengan sidebar history yang bisa
  di-collapse sendiri (`IndyAssistantSidebar.jsx` — panel simpel 240px
  dengan tombol collapse, nggak ada hubungannya sama rail hover-peek punya
  `AppSidebar`).

---
