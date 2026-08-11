# Ticketing Page Spec (NDQ-Forum) — v1.1

> **Changelog v1.0 → v1.1:** Focus of this revision is **admin capability** on Create Ticket form, plus status flow rework and a "My Tasks" filter. Sections below marked **(v1.1)** are new or changed; everything else carries over from v1.0.

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
| `category` | 3 separate levels: `application`, `scope`, `concern` *(v1.1: renamed from `type`/`category`/`dimension` — see Create Ticket section)* |
| `domain` **(v1.1 new)** | `NDM AL` \| `NDM SL` — editable later on detail page |
| `tableName` **(v1.1 new)** | Free text or picked from suggested table name options |
| `ticketFor` **(v1.1 new)** | `self` \| `other` — whether ticket is created for the requester or on behalf of someone else |
| `issueOwner` **(v1.1 new)** | The person the ticket is actually for. Defaults to `author` when `ticketFor = self`; a separate selected user when `ticketFor = other` |
| `pic[]` **(v1.1 new)** | Multiple PIC (person in charge) assigned to the ticket — multi-select |
| `priority` **(v1.1 new)** | `Critical` \| `High` \| `Medium` \| `Low` |
| `tags` | Comma-separated tags (e.g. `ndm_speed_layer`) |
| `status` | **(v1.1 changed)** `open` \| `in_progress` \| `solved` \| `closed` — see Status Flow section below |
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
- "Request Kategori" button → opens a simple form to request a new category. Input format: `title/title/title` (application/scope/concern)

### 2. Top filter bar

- **Board** — default view, shows open tickets (open + in progress + solved)
- **Archive** — shows closed tickets only, so users can search past resolutions. Archive always renders as **list/table view** — Board keeps all 3 display modes.
- **"My Tasks" filter (v1.1 new)** — available in every view (Grid/List/Kanban, and both Board & Archive). Shows only tickets involving the current user — as `author`, `issueOwner`, or listed in `pic[]`.
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
- Status badge — **(v1.1)** Open / In Progress / Solved / Closed
- Priority badge **(v1.1 new)** — Critical / High / Medium / Low
- SLA badge (e.g. `<12h`)
- Reply count, view count

Pagination: reuse existing pattern (10 rows/cards per page) if applicable.

### 4. List/table view

Same fields as grid, in table row format. Reuse existing table styling (subtle gray header, row numbers, avatar left of name — same as Admin page). Include Priority column **(v1.1 new)**.

### 5. Kanban view

- **(v1.1 changed)** 3 columns: **Open**, **In Progress**, **Solved**. `Closed` is intentionally **not** a kanban column — a ticket only reaches `Closed` by submitting the Ticket Closure & Resolution Details Form (see Section 8), which moves it straight to Archive.
- Drag and drop cards between the 3 visible columns → updates ticket `status`
- Column header shows count of tickets

### 6. Create new ticket (modal/form) — (v1.1 revised)

**Top of form:**
- Radio button: **"For Myself"** / **"For Other User"** — plus a short helper text explaining the difference.
  - If **For Myself** → `issueOwner` = current user automatically, no extra field shown.
  - If **For Other User** → an additional field appears to select the target user (`issueOwner`).
  - **(v1.1 confirmed)** When `ticketFor = other`, the selected `issueOwner` receives an approval/notification request before (or upon) ticket creation — matches the real-world process where the target user needs to be informed/approve being assigned an issue.

**Issue Category** — 3 separate inputs, renamed in v1.1:
- Application (e.g. NDM)
- **Scope** *(renamed from "Category")*
- **Concern** *(renamed from "Sub Category")*

**Domain (v1.1 new)** — select/combobox, placed directly below Issue Category:
- Options: `NDM AL`, `NDM SL`
- Editable later on the detail page

**Table Name (v1.1 new)** — placed directly below Domain:
- Combobox with suggested table name options, but also accepts free text

**Issue / Ticket Title**

**Detailed Data Issue Description**

**PIC (v1.1 new)** — select/combobox with multi-select support

**Priority (v1.1 new)** — select/combobox: Critical / High / Medium / Low

**Issue Tags** (comma separated)

**Actions:** Cancel / Open Issue Ticket

### 7. Detail post page

Shows:
- Author, ticket ID, created time, title, tag, issue category (Application / Scope / Concern), Domain, Table Name, PIC(s), Priority, SLA
- Upvote button + count
- **Status dropdown (v1.1 new)** — user can move ticket between `Open` → `In Progress` → `Solved` directly from the detail page
- **(v1.1 confirmed)** Anyone listed in `pic[]` has edit rights on the ticket, including changing status via this dropdown — not just display/notification
- "Submit Close & Archive" button — triggers the **Ticket Closure & Resolution Details Form**, the only path to reach `Closed`
- **Discussion & Replies** section:
  - Reply input with image upload support
  - Keep UI simple — expect many replies over time, so prioritize scannability (compact reply rows, clear author/time, avoid heavy nesting)
- Audit note banner: tickets cannot be arbitrarily deleted (SLA compliance) — must go through the Closure form to resolve

### 8. Ticket Closure & Resolution Details Form (v1.1 renamed, was "Close & Archive form")

Triggered by "Submit Close & Archive" button.

Fields:
- Root Cause Analysis (RCA)
- Suspect System / Pipeline
- Keterangan Solusi yang Benar (Resolution notes)
- Actions: Batal (Cancel) / Simpan Solusi & Tutup Tiket (Save & Close)

On submit: ticket status → `closed`, moves to Archive.

---

## Status flow (v1.1 new section)

```
Open → In Progress → Solved → Closed
```

- `Open`, `In Progress`, `Solved` are all changeable directly via dropdown on the detail page, and are visible as Kanban columns.
- `Closed` is reachable **only** through the Ticket Closure & Resolution Details Form — never via the status dropdown directly.
- Once `Closed`, the ticket moves out of Board and into Archive.

---

## UX notes / things to double check while building

1. Category input as free text (`title/title/title`) is error-prone — prefer 3 separate small fields (Application / Scope / Concern), consistent with the Create Ticket form.
2. Archive tab: list/table-only view (no kanban/grid) since its purpose is searching past solutions, not managing active work.
3. Reply UI must scale well visually as reply count grows — avoid deeply nested threads.
4. Reuse existing components where possible: `Topbar.jsx`, table/pagination pattern from Admin page, tokens from `src/styles/tokens.css`.
5. **(v1.1 confirmed)** "For Other User" ticket creation triggers an approval/notification request to the target user (`issueOwner`), matching the real-world process.
6. **(v1.1 confirmed)** `pic[]` has full edit rights on the ticket, including status changes — not display/notification-only.

---

## Build order (suggested phases for Claude Code prompts)

1. Page shell + navbar filter tree (categories, expand/collapse, request category button)
2. Grid view (default) — ticket cards
3. List/table view
4. Kanban view with drag & drop (3 columns: Open / In Progress / Solved)
5. Create ticket form (modal) — including v1.1 fields: For Myself/Other, Domain, Table Name, PIC, Priority
6. Detail post page — info + status dropdown + discussion + image upload
7. Ticket Closure & Resolution Details Form
8. "My Tasks" filter across all views