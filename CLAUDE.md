# NDQ Enrich Data Platform — Admin Pages Rebuild

## Project overview
This is a rebuild of an existing vanilla HTML/CSS/JS admin interface into a
modern React + Vite + Tailwind + shadcn/ui stack. The old version lives in a
separate folder (`ndq-enrich-platform/`) and is used **only as a functional
reference** — do not copy its HTML/CSS directly, rebuild it as real React
components using shadcn.

Design tokens (colors, spacing) from the old project are **not applied yet**
— use shadcn defaults for now. Token integration comes in a later phase.

## Tech stack
- React + Vite
- Tailwind CSS v4
- shadcn/ui (Base UI, Nova preset)
- Import alias: `@/*` → `./src/*`

## Pages to build

### 1. Admin page (`admin.html` reference)
List of all registered data source connections.

- Page header: title "Registered Data Sources" + short description
- Search input — filters rows live by: connection_id, group_apps, category,
  layer_name, table_name, granularity (case-insensitive substring match)
- Table columns: ID, Group Apps, Category, Layer, Table Name, Control Table,
  Reference, Granularity, Features (badges, one per feature tag), OLA
  Readiness, Action
- `Table Name` / `Control Table` / `Reference` are shown in monospace font
- Action column: a "Detail" button per row → navigates to the detail page
  for that connection_id

### 2. Admin detail page (`admin-detail.html` reference)
Detail view for a single connection, reached via connection id (route param
or query param — decide based on how routing is set up, e.g.
`/admin/:id` with React Router).

If no connection matches the id: show a "not found" alert instead of the
sections below.

Header: back link to Admin page, title "Data Source Detail", subtitle
showing `Connection ID: {id} — {table_name}`.

Five sections, each in its own card:

1. **Connections** — read-only key/value grid of all connection fields
   (connection_id, group_apps, category, layer_name, table_name,
   control_table, reference, granularity, features as badges, ola_readiness)
2. **Connection Column** — table of column mappings. Columns: No, Connection
   ID, Column Name, Type ID, Expression ID, Is Unique (checkbox), Is Validity
   (checkbox), Action. Each row has its own Edit → Save/Cancel toggle
   (inline editable inputs/checkboxes, per row independently)
3. **Dimension Rules** — read-only table: Connection ID, Dimension,
   Description (derived from the connection's `features` list)
4. **Active Table** — single row: Connection ID, Enabled status (badge when
   read-only, toggle/switch when editing), Edit → Save/Cancel
5. **Schedule** — single row: Start Time, Connection ID, Cron Schedule,
   Enabled, Action. Edit → Save/Cancel toggles Start Time and Cron Schedule
   into text inputs and Enabled into a switch

**Inline edit pattern used throughout (keep this behavior):**
- Row starts read-only (inputs disabled/readonly, checkboxes disabled,
  values shown as plain text/badges)
- Clicking "Edit" makes that row's fields editable and swaps the button for
  Save (+ Cancel where present)
- "Save" commits the values back to state and returns the row to read-only
- "Cancel" discards changes and re-renders the row from existing state
- Each row's edit state is independent from other rows

## Data shape reference (from old `admin-data.js`)

```js
// Connection (admin list + detail header)
{
  connection_id: number,
  group_apps: string,       // e.g. 'NDM'
  category: string,         // e.g. 'RAN', 'CORE CS', 'CORE VAS'
  layer_name: string,       // e.g. 'Speed Layer'
  table_name: string,       // dotted path, monospace
  control_table: string,    // dotted path, monospace
  reference: string,        // dotted path, monospace
  granularity: 'daily' | 'hourly',
  features: string[],       // e.g. ['count_row','validity_kpi','timeliness','uniqueness']
  ola_readiness: string,    // e.g. '1 day 08:00:00' or '04:00:00'
}

// Connection Column row
{
  no: number,
  connection_id: number,
  column_name: string,
  type_id: number | null,
  expression_id: number | null,
  is_uniq: boolean,
  is_validity: boolean,
}

// Dimension Rule row (derived from features)
{ connection_id: number, dimension: string, description: string }

// Active Table
{ connection_id: number, enabled: boolean }

// Schedule
{
  start_time: string,       // e.g. '08/07/2026'
  conn_id: number,
  cron_schedule: string,
  enabled: boolean,
}
```

For now, seed the new project with mock data matching this shape (can be a
`src/data/adminConnections.js` file) — no backend integration yet.

## Old project file map (for reference only)
```
ndq-enrich-platform/
├── admin.html              → becomes new Admin page
├── admin-detail.html       → becomes new Admin Detail page
├── js/admin-data.js        → mock data shape reference (see above)
├── js/admin-main.js        → list render + search filter logic reference
├── js/admin-detail.js      → detail sections + edit/save/cancel logic reference
├── css/styles.css          → design tokens (NOT used yet, later phase)
└── index.html, js/steps.js, js/integration.js, js/method.js,
    js/confirmation.js      → the original 4-step wizard, unrelated to
                               admin pages, not part of this rebuild phase
```

## Figma ↔ Code sync workflow

This project's Figma file is treated as the design source of truth once a
frame there has been manually finalized/edited. When asked to update code
to match a specific Figma frame/node:

- **Naming/token mismatches:** if a component or token name in the Figma
  design differs from what's used in the current code, don't skip or guess
  blindly. Treat the Figma design's actual values (colors, spacing, layout)
  as correct, and adapt/rename in the code where reasonable — staying
  consistent with the codebase's existing naming conventions.
- **Reuse before inventing:** if an existing semantic token (e.g.
  `border-muted`, `bg-secondary`, `text-neutral-600`) matches the Figma
  value exactly, reuse it. Only fall back to a plain Tailwind utility class
  (e.g. `bg-neutral-50`) when no existing project token matches — don't
  invent new token names ad hoc.
- **Scope MCP calls carefully:** when reading Figma context, target the
  specific frame/node directly (e.g. via its node-id) rather than pulling
  metadata for the entire file — the file can be large enough to exceed
  tool output limits.
- Direction of sync can go either way depending on the task: code → Figma
  (pushing a finished UI state into Figma for documentation/handoff) or
  Figma → code (updating React components to match a design that was
  edited directly in Figma). Always confirm which direction is intended
  before starting a sync task, since the two require different tools
  (`figma-generate-design` / `use_figma` for code → Figma, vs. Figma's Dev
  Mode MCP `extract_design_context` for Figma → code).

## Out of scope for this phase
- Hitakari design tokens / custom colors
- Backend / API integration (mock data only)
- The 4-step registration wizard (separate future phase)

