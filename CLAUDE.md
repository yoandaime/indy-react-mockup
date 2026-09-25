# NDQ with shadcn

## Tech Stack
- React + Vite
- Tailwind CSS v4
- shadcn/ui (Base UI, Nova preset)
- Import alias: `@/*` → `./src/*`

## Figma ↔ Code Sync Workflow

This project's Figma file is the source of truth once a frame is finalized/edited there.

- **Confirm sync direction first.** It can go two ways:
  - **Code → Figma** (push finished UI into Figma for docs/handoff) — use `figma-generate-design` / `use_figma`
  - **Figma → Code** (update React to match a design edited in Figma) — use Figma's Dev Mode MCP `extract_design_context`
- **Scope MCP calls carefully.** Target the specific frame/node (node-id) directly, not the whole file — the file can be too large for tool output limits.
- **Naming/token mismatches:** if a component or token name in Figma differs from code, don't skip or guess. Treat Figma's actual values (colors, spacing, layout) as correct, and adapt/rename in code — staying consistent with existing naming conventions.
- **Figma guides structure, not literal specs.** It shows layout, field order/grouping, and which states should exist — it is not a literal component spec.

## Component Rules
- **Reuse before installing new.** Always check `src/components/ui/` first before running an install command.
- **Use real shadcn/ui components**, not custom recreations of Figma layers. When a Figma element maps to an existing shadcn/ui component or pattern (Select, Dialog, Tabs, Avatar, Badge, Combobox, multi-select, etc.), implement it with the real component and its actual props/variants — even if the Figma layer name doesn't match.
- **Compose before building custom.** shadcn doesn't ship every pattern as one ready component (e.g. Combobox, multi-select are composed from `Command` + `Popover` + `Badge`). Compose from existing primitives first. Only write a fully custom element if no reasonable composition covers it.
- Components are installed via the standard shadcn CLI (`npx shadcn add <component>`) — this generates the `.jsx` file automatically. No extra documentation step is needed for this part right now.

## Colors
- Use shadcn semantic tokens first (e.g. `border-muted`, `bg-secondary`, `text-neutral-600`). Only fall back to a plain Tailwind default utility (e.g. `bg-neutral-50`) when no existing token matches.
- Don't hardcode hex values in components.
- Don't invent new token names ad hoc.

## Text Casing
- **Use Title Case for UI labels** (menu items, section/group headers, sidebar labels, buttons, etc.) — not ALL CAPS via `uppercase`, even for small/muted section headers.
- Only render text as full uppercase when the underlying data itself is uppercase (e.g. an acronym, a status code, a value from a data source) — never apply an `uppercase` CSS transform purely for visual styling.

## Icons
- **Lucide icons** — primary icon set, used by default across the project.
- **Google Material Symbols (Rounded style — Filled and Outline variants)** — secondary icon set, kept available for cases Lucide doesn't cover well.
  - Setup: loaded via CDN link in `index.html` (Material Symbols Rounded, variable font).
  - Usage: `<span className="material-symbols-rounded">icon_name</span>` — add `style={{ fontVariationSettings: "'FILL' 1" }}` for filled variant.
- Don't mix in any other icon set beyond these two (e.g. Tabler, Heroicons).

## Out of Scope (for now)
- Backend / API integration — all pages use mock data only, no live backend
- Component registry/documentation file — not needed at this stage