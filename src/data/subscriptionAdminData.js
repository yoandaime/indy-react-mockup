// Mock data for the Subscription page's admin "Overview" tab — which users
// subscribe to which tables, and the aggregate stats/charts derived from it.

import { SUBSCRIPTION_TABLES } from "./subscriptionTables"

export const ADMIN_USERS = [
  { id: 1, name: "Antonio Nusa", role: "Admin", subscribedTableIds: [1, 2, 3, 14, 15, 21, 22, 28, 33, 37] },
  { id: 2, name: "Sarah Putri", role: "Data Analyst", subscribedTableIds: [1, 5, 9, 13, 16, 19, 23] },
  { id: 3, name: "Budi Santoso", role: "Network Engineer", subscribedTableIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 4, name: "Fajar Wibowo", role: "Data Analyst", subscribedTableIds: [16, 17, 18, 19, 20, 21, 22] },
  { id: 5, name: "Rina Amalia", role: "Viewer", subscribedTableIds: [1, 3, 33, 34, 37] },
  { id: 6, name: "Dewi Kartika", role: "Data Analyst", subscribedTableIds: [2, 6, 10, 14, 18] },
  { id: 7, name: "Ivan Nurcahyo", role: "Network Engineer", subscribedTableIds: [3, 7, 11, 15, 19, 23, 27] },
  { id: 8, name: "Siti Nurhaliza", role: "Viewer", subscribedTableIds: [4, 8, 12] },
  { id: 9, name: "Bramantyo Adi", role: "Admin", subscribedTableIds: [1, 5, 9, 13, 17, 21, 25, 29, 33, 37] },
  { id: 10, name: "Nabila Putri", role: "Data Analyst", subscribedTableIds: [2, 6, 10, 14] },
  { id: 11, name: "Rahadian Aditya", role: "Network Engineer", subscribedTableIds: [16, 20, 24, 28, 32, 36, 40] },
  { id: 12, name: "Yoga Pratama", role: "Viewer", subscribedTableIds: [3, 7] },
  { id: 13, name: "Maya Sari", role: "Data Analyst", subscribedTableIds: [11, 15, 19, 23, 27, 31] },
  { id: 14, name: "Fikri Ramadhan", role: "Network Engineer", subscribedTableIds: [1, 2, 3, 4, 5, 6, 7, 8] },
]

const TABLE_BY_ID = new Map(SUBSCRIPTION_TABLES.map((table) => [table.id, table]))

export function getUserSubscribedTables(user) {
  return user.subscribedTableIds.map((id) => TABLE_BY_ID.get(id)).filter(Boolean)
}

// Aggregates every user's subscriptions into the stats/rankings the Overview
// tab renders — computed from ADMIN_USERS rather than hardcoded so it can't
// drift out of sync with the per-user lists above.
export function getAdminOverviewStats() {
  const appCounts = new Map()
  const tableCounts = new Map()
  let totalSubscriptions = 0

  for (const user of ADMIN_USERS) {
    for (const table of getUserSubscribedTables(user)) {
      totalSubscriptions += 1
      appCounts.set(table.app, (appCounts.get(table.app) ?? 0) + 1)
      tableCounts.set(table.id, (tableCounts.get(table.id) ?? 0) + 1)
    }
  }

  const topApps = [...appCounts.entries()]
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)

  const topTables = [...tableCounts.entries()]
    .map(([tableId, count]) => ({ table: TABLE_BY_ID.get(tableId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalUsers: ADMIN_USERS.length,
    totalSubscriptions,
    mostSubscribedApp: topApps[0] ?? null,
    mostSubscribedTable: topTables[0] ?? null,
    topApps,
    topTables,
  }
}
