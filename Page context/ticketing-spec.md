# Ticketing Page Spec (NDQ-Forum)

## Context

A ticketing/forum menu inside the NDQ Enrich Data Platform. Users publish issues about data quality and discuss them per issue-post, similar to a forum + kanban board hybrid. Reference UI already exists (from a screen recording); we are rebuilding it in our own style using the existing stack (React + Vite + Tailwind + shadcn/ui, reusing `Topbar.jsx` and design tokens).

Design mode: **light mode only** for now. No dark mode toggle needed.

---

## Data model (per ticket)

| Field | Notes |
|---|---|
| `id` | Ticket ID |
| `author` | Who posted the issue |
| `createdAt` | Created time |
| `title` | Issue title |
| `description` | Detailed data issue description |
| `category` | 3 separate levels: `application`, `type`, `dimension` (e.g. NDM / Data Quality / Completeness) |
| `tags` | Comma-separated tags (e.g. `ndm_speed_layer`) |
| `status` | `backlog` \| `active` (in progress) \| `done` (archived/arsip solusi) |
| `sla` | Default `<12h` |
| `upvotes` | Count |
| `views` | Count |
| `repliesCount` | Count |
| `replies[]` | Discussion thread — each reply has author, text, optional image |
| `resolution` | Filled only when closed: `rootCause`, `suspectSystem`, `resolutionNotes` |

---

## Page structure

### 1. Navbar (left sidebar) — category filter tree

- Folder-style tree, default structure:
  - NDM
    - Data Quality
      - Completeness
      - Validity
    - Data Ingestion
      - Format Data
    - Keamanan dan akses table
- "Expand all" / "Collapse all" controls
- "Request Kategori" button → opens a simple form to request a new category. Input format: `title/title/title` (application/type/dimension)

### 2. Top filter bar

- **Board** — default view, shows open tickets (backlog + active)
- **Archive** — shows closed/done tickets only, so users can search past resolutions. Recommend: Archive always renders as **list/table view** (searching solutions doesn't need drag-and-drop or cards) — Board keeps all 3 display modes.
- Search bar (search tickets/tables)
- "+ New Ticket" button
- Display mode switcher: **Grid** / **List (table)** / **Kanban**

### 3. Grid view (default)

Card per ticket, showing:
- Author (with avatar)
- Ticket ID
- Created time
- Title
- Upvote/like button + count
- Tag(s)
- Status badge (Backlog / Active Issue / Done — Arsip Solusi)
- SLA badge (e.g. `<12h`)
- Reply count, view count

Pagination: reuse existing pattern (10 rows/cards per page) if applicable.

### 4. List/table view

Same fields as grid, in table row format. Reuse existing table styling (subtle gray header, row numbers, avatar left of name — same as Admin page).

### 5. Kanban view

- 3 columns: **Backlog (Terkirim)**, **In Progress (Active Issue)**, **Done (Arsip Solusi)**
- Drag and drop cards between columns → updates ticket `status`
- Column header shows count of tickets

### 6. Create new ticket (modal/form)

Fields:
- **Issue Category** — 3 separate inputs, not one combined dropdown:
  - Application (e.g. NDM)
  - Type (e.g. Data Quality)
  - Dimension (e.g. Completeness)
- Issue / Ticket Title
- Detailed Data Issue Description
- Issue Tags (comma separated)
- Actions: Cancel / Open Issue Ticket

### 7. Detail post page

Shows:
- Author, ticket ID, created time, title, tag, status, issue category, SLA
- Upvote button + count
- "Submit Close & Archive" button (only relevant when ticket is still open)
- **Discussion & Replies** section:
  - Reply input with image upload support
  - Keep UI simple — expect many replies over time, so prioritize scannability (compact reply rows, clear author/time, avoid heavy nesting)
- Audit note banner: tickets cannot be arbitrarily deleted (SLA compliance) — must go through Close & Archive to resolve

### 8. Close & Archive form (triggered by "Submit Close & Archive")

Fields:
- Root Cause Analysis (RCA)
- Suspect System / Pipeline
- Keterangan Solusi yang Benar (Resolution notes)
- Actions: Batal (Cancel) / Simpan Solusi & Tutup Tiket (Save & Close)

On submit: ticket status → `done`, moves to Archive.

---

## UX notes / things to double check while building

1. Category input as free text (`title/title/title`) is error-prone — prefer 3 separate small fields, consistent with the Create Ticket form fix above.
2. Archive tab: consider list/table-only view (no kanban/grid) since its purpose is searching past solutions, not managing active work.
3. Reply UI must scale well visually as reply count grows — avoid deeply nested threads.
4. Reuse existing components where possible: `Topbar.jsx`, table/pagination pattern from Admin page, tokens from `src/styles/tokens.css`.

---

## Build order (suggested phases for Claude Code prompts)

1. Page shell + navbar filter tree (categories, expand/collapse, request category button)
2. Grid view (default) — ticket cards
3. List/table view
4. Kanban view with drag & drop
5. Create ticket form (modal)
6. Detail post page — info + discussion + image upload
7. Close & Archive form
