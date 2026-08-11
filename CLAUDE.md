# NDQ with shadcn

## Tech stack
- React + Vite
- Tailwind CSS v4
- shadcn/ui (Base UI, Nova preset)
- Import alias: `@/*` → `./src/*`

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
- **Use real shadcn/ui components, not literal recreations of Figma
  layers.** A Figma reference is primarily there to guide layout structure,
  field order/grouping, and which details/states should exist — it is not
  a literal component spec. When a Figma element maps to an existing
  shadcn/ui component or pattern (Select, Dialog, Tabs, Avatar, Badge,
  Combobox, multi-select, etc.), implement it using the real shadcn
  component and its actual props/variants — even if the Figma layer or
  variable name doesn't match shadcn's naming. Don't rebuild a
  custom-styled clone just because the Figma layer looks visually similar
  but is named differently.
- shadcn doesn't ship every pattern as a single ready-made component — e.g.
  Combobox and multi-select are typically composed from existing
  primitives (`Command` + `Popover`, plus `Badge` for selected-value
  chips), not separate standalone components. When a needed pattern isn't
  a single existing component, compose it from existing shadcn primitives
  first. Only write a fully custom element from scratch if no reasonable
  composition of existing shadcn primitives covers the pattern.

## Out of scope (project-wide, for now)
- Hitakari design tokens / custom colors — use shadcn defaults until token
  integration is scheduled as its own phase
- Backend / API integration — all pages use mock data only, no live backend