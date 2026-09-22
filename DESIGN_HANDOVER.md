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


### Data Observability — `/data-observability`

- **Entry:** `src/pages/DataObservabilityPage.jsx` (~1000 baris — halaman
  terbesar kedua di repo ini)
- **Pendukung:** `src/components/dataObservability/*` (Composer
  fields/results, Profiling fields/results, Rules management list, Save
  Rule dialog)
- **Mock data:** `src/data/dqComposerMockData.js`, logika rule catalog di
  `src/lib/dqComposer/`

### Enrich Data — `/enrich-data/admin` (+ `/enrich-data/register`)

- **Entry:** `src/pages/EnrichDataAdminPage.jsx` (list),
  `EnrichDataAdminDetailPage.jsx`, `EnrichDataAddPage.jsx` (wizard koneksi
  baru), `src/pages/RegisterDataPage.jsx` (halaman berdiri sendiri, diakses
  dari portal, **bukan** di balik sidebar layout)
- **Mock data:** `src/data/adminConnections.js`,
  `src/data/enrichDataWizardMock.js`

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

### Catalog Knowledge — `/catalog-knowledge`

- **Entry:** `src/pages/CatalogKnowledgePage.jsx`

### INDY Assistant — `/indy-assistant`

- **Entry:** `src/pages/IndyAssistantPage.jsx`
- **Pendukung:** `src/components/indyAssistant/*` (chat input/message,
  brand header, sidebar, stat card, tabel DQ)
- **Mock data:** `src/data/indyAssistantData.js` (termasuk
  `getMockAssistantReply` — generator respons kalengan, bukan pemanggilan
  model beneran)


---
