# Ticketing Admin Control Center Spec — v1.3

## Context
A new admin-only section within the Ticketing (NDQ-Forum) feature, separate
from the existing "Admin" page elsewhere in the app (the data source
connections admin — different feature, do not confuse routes/naming).

This is a **new, separate route** (not an overlay/tab on the existing
ticketing page). Suggested path prefix: `/ticketing/admin/...` to avoid any
collision with the existing `/admin` route used by the data source
connections feature.

Built entirely from screenshots/video reference in this doc — no Figma
links provided for this feature yet.

## 1. Entry point — user account dropdown
On the main Ticketing page (NDQ-Forum), add a chevron icon beside the user
account (e.g. "Antonio Nusa") to indicate it opens a dropdown menu.

Dropdown items for now:
- **Admin Control Center** — functional, navigates to the new admin route
- **My Profile** — show in the dropdown (per the reference), but non-functional — clicking does nothing (no navigation, no toast needed)
- **Sign Out** — show in the dropdown (per the reference), but non-functional, same as above
- **My Tickets** — explicitly skipped for this round, do not add to the dropdown at all

## 2. Admin Control Center shell
Once "Admin Control Center" is clicked, navigate to the new route. This
page has its own layout:
- Left sidebar with sections: **Dashboard**, **Executive Summary**, **Audit
  Log**, **Manage Users**, **Content Moderation**, **Manage Categories**
- Top bar: a **"Back to Forum"** button (navigates back to the main
  ticketing page), positioned to the left of the account profile/icons
- Active sidebar item is visually highlighted

## 3. Dashboard (mock data only)
"System Overview" header with a small SLA compliance subtitle line.
4 summary cards:
- Total Tickets
- Open & In Progress
- Closed (Archive)
- SLA Breach

Use plausible mock numbers (see screenshot: Total Tickets 6, Open & In
Progress 2, Closed 4, SLA Breach 2 — can reuse similar numbers or adjust for
consistency with existing ticketing mock data).

## 4. Executive Summary
4 summary cards at top:
- Open Tickets (count)
- Closed Tickets (count)
- SLA Meet Rate (percentage)
- Avg Aging (Open) — time duration, e.g. "NaNh" placeholder acceptable if
  no real calculation exists yet, but ideally compute a real mock value

Below that, a **"Daily Activity — Last 7 Days"** table:
- Columns: Date, Opened (count), Closed (count), Trend
- **Trend column**: render as a **mini horizontal stacked bar** (not a
  sparkline), using 2 colors matching the "Opened"/"Closed" legend shown
  below the table
- 7 rows of mock daily data (dates can be sequential, e.g. last 7 days from
  today)

Below the table, a **"Today's Activity"** card summarizing today's
opened/closed counts in one line.

## 5. Audit Log
Header: "Activity Tracking & Form Audit Log (SQLite DB)" with a small
"ndq_forum.db" tag/badge and a "Total: N Log" counter on the right.

Table columns: Timestamp, Action Type, User, Form Activity Details, IP
Address.

Empty state is acceptable: "No activity logs found in database." — this
can ship with zero mock rows, matching the reference screenshot.

## 6. Manage Users
Header: "User Management" with subtitle ("Manage access roles, approve new
members, or suspend problematic accounts") and a "Total Users: N" counter.

Controls: a search input ("Search by name, @username, or email...") and a
role filter dropdown ("All Roles").

Table columns: User, Email, Department, Role, Status, Timestamps, Action.

Populate with mock user data (reuse existing mock people already used
elsewhere in ticketing — e.g. Fengky Pratama, Ivan Nurcahyo, etc. — for
consistency, rather than inventing entirely new names).

## 7. Content Moderation
Header: "Content Moderation" with subtitle about pinning/resolving/deleting
threads, plus filter tabs: **All (N)**, **Pinned**, **Solved**.

**Reuse the existing ticket card component** already built for the main
NDQ-Forum board/list — don't rebuild from scratch. Make it responsive to
fit this admin list layout.

Difference from the normal ticket card: add action items on the right side
of each card:
- **Pin** / **Unpin** (toggle label depending on current pin state)
- **Mark Solved** / **Unmark Solved** (toggle label depending on current
  state)
- **Delete**

These actions should be functional against local mock state (in-memory
React state, not localStorage/backend):
- **Delete** removes the ticket from the list
- **Pin/Unpin** toggles pin status, which affects the "Pinned" filter tab
- **Mark Solved/Unmark Solved** toggles solved status, which affects the
  "Solved" filter tab

Since this is in-memory only, a page refresh/reload resets everything back
to the original mock data — that's expected behavior for this stage, not a
bug.

## 8. Manage Categories
Header: "Manage Forum Categories" with subtitle about add/edit/remove +
audit trail note.

Two tabs: **Categories** / **Requests**.

A **"+ Create Root Category"** button.

Empty state is fine: "No categories found. Create a new category above to
get started." — ship with blank/empty data, per the reference.

## Notes
- Don't add any conditional visibility, permission logic, or extra
  behavior beyond what's described in each section — if ambiguous, ask
  instead of assuming (per project-wide convention already in CLAUDE.md).
- Use real shadcn/ui components throughout — sidebar nav, tables, tabs,
  dropdown menu, search input, etc. — don't recreate custom equivalents.
