// Mock data for the Ticketing (NDQ-Forum) page — no backend integration yet.

export const CURRENT_USER = "Antonio Nusa"

export const STATUS = {
  pending: "pending",
  open: "open",
  inProgress: "inProgress",
  solved: "solved",
  closed: "closed",
}

export const STATUS_META = {
  pending: {
    label: "Pending",
    archiveLabel: "Pending",
    badgeClass: "bg-gray-700 text-gray-50",
    dotClass: "bg-gray-50",
    outlineClass: "bg-gray-50 border-gray-100 text-gray-700",
    outlineDotClass: "bg-gray-700",
  },
  open: {
    label: "Open",
    archiveLabel: "Terkirim",
    // Solid style — used for the Kanban column header badge only.
    badgeClass: "bg-sky-700 text-sky-50",
    dotClass: "bg-sky-50",
    // Outline style — used everywhere else (grid cards, list rows).
    outlineClass: "bg-sky-100 border-sky-700 text-sky-700",
    outlineDotClass: "bg-sky-700",
  },
  inProgress: {
    label: "In Progress",
    archiveLabel: "Active Issue",
    badgeClass: "bg-amber-700 text-yellow-50",
    dotClass: "bg-yellow-50",
    outlineClass: "bg-amber-100 border-amber-700 text-amber-700",
    outlineDotClass: "bg-amber-700",
  },
  solved: {
    label: "Solved",
    archiveLabel: "Arsip Solusi",
    badgeClass: "bg-emerald-700 text-emerald-50",
    dotClass: "bg-emerald-50",
    outlineClass: "bg-green-100 border-green-700 text-green-700",
    outlineDotClass: "bg-green-700",
  },
  closed: {
    label: "Closed",
    archiveLabel: "Arsip Solusi",
    badgeClass: "bg-purple-700 text-purple-50",
    dotClass: "bg-purple-50",
    outlineClass: "bg-purple-100 border-purple-700 text-purple-700",
    outlineDotClass: "bg-purple-700",
  },
}

export const PRIORITY_META = {
  Critical: {
    label: "Critical",
    labelClass: "text-red-700",
  },
  High: {
    label: "High",
    labelClass: "text-orange-700",
  },
  Medium: {
    label: "Medium",
    labelClass: "text-yellow-700",
  },
  Low: {
    label: "Low",
    labelClass: "text-amber-700",
  },
}

export const DOMAIN_OPTIONS = ["NDM AL", "NDM SL", "Other"]

export const TABLE_NAME_OPTIONS = [
  "default.icdm_icbw_cr",
  "twicloud.ipdk_ichm_combe",
  "etl_core_sgsn_ericsson_kpi_hourly",
  "default.etl_cell_5g_ran_ericsson_kpi_daily",
  "reference.core_control_table",
  "base.oss_core_vas_sms_msc_hh",
  "smy.etl_core_cs_nokia_gcs_dd",
]

export const DOMAIN_TABLE_NAMES = {
  "NDM AL": [
    "default.icdm_icbw_cr",
    "etl_core_sgsn_ericsson_kpi_hourly",
    "default.etl_cell_5g_ran_ericsson_kpi_daily",
    "base.oss_core_vas_sms_msc_hh",
  ],
  "NDM SL": [
    "twicloud.ipdk_ichm_combe",
    "reference.core_control_table",
    "smy.etl_core_cs_nokia_gcs_dd",
  ],
}

export const PIC_OPTIONS = [
  "Bramantyo Adi",
  "Siti Nurhaliza",
  "Rahadian A.",
  "Nabila Putri",
  "Dewi Kartika",
  "Ivan Nurcahyo",
]

export const DOMAIN_PIC_MAP = {
  "NDM AL": ["Bramantyo Adi", "Siti Nurhaliza", "Nabila Putri"],
  "NDM SL": ["Rahadian A.", "Dewi Kartika", "Ivan Nurcahyo"],
}

export const PIC_PHONE_MAP = {
  "Bramantyo Adi": "+628123456701",
  "Siti Nurhaliza": "+628134567802",
  "Rahadian A.": "+628112345603",
  "Nabila Putri": "+628145678904",
  "Dewi Kartika": "+628156789005",
  "Ivan Nurcahyo": "+628167890106",
}

export function picPhone(name) {
  return PIC_PHONE_MAP[name] ?? null
}

export function waLinkFromPhone(phone) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`
}

export const REGION_OPTIONS = [
  "Nationwide",
  "Sumbagut",
  "Sumbagsel",
  "Sumbagteng",
  "Jabotabek",
  "Jabar",
  "Jateng-DIY",
  "Jatim",
  "Kalimantan",
  "Sulawesi",
  "Bali-Nusra",
  "Maluku-Papua",
]

export const DEFAULT_CATEGORY_TREE = [
  {
    name: "NDM",
    children: [
      {
        name: "Data Quality",
        children: [{ name: "Completeness" }, { name: "Validity" }],
      },
      {
        name: "Data Ingestion",
        children: [{ name: "Format Data" }],
      },
      { name: "Keamanan dan akses table" },
    ],
  },
]

function initialsOf(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function emailOf(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".")
  return `${slug}@telkomsel.co.id`
}

function avatarUrlOf(name) {
  if (!name) return null
  return `https://api.dicebear.com/10.x/thumbs/svg?seed=${encodeURIComponent(name)}`
}

export const TICKETS = [
  {
    id: "NDQR20260730001",
    author: "Fengky Pratama",
    createdAt: "2026-07-30T08:20:26",
    title: "issue_dummy",
    description:
      "Terdapat ketidaklengkapan data pada tabel default.icdm_icbw_cr yang menyebabkan validasi harian gagal.",
    category: { application: "NDM", scope: "Data Quality", concern: "Completeness" },
    domain: "NDM AL",
    tableName: "default.icdm_icbw_cr",
    ticketFor: "self",
    issueOwner: "Fengky Pratama",
    pic: ["Bramantyo Adi", "Siti Nurhaliza", "Nabila Putri"],
    priority: "High",
    tags: ["ndm_speed_layer"],
    ipAddress: "10.21.4.12",
    status: STATUS.inProgress,
    sla: "<12h",
    upvotes: 1,
    views: 1,
    replies: [],
    resolution: null,
  },
  {
    id: "NDQR20260731382",
    author: "Ivan Nurcahyo",
    createdAt: "2026-07-31T10:20:02",
    title: "[MADING AKTIF] Kendala Data Incompleteness",
    description:
      "Ditemukan gap row count pada twicloud.ipdk_ichm_combe di window pukul 08:00-15:00. Perlu investigasi engine ingest.",
    category: { application: "NDM", scope: "Data Quality", concern: "Completeness" },
    domain: "NDM SL",
    tableName: "twicloud.ipdk_ichm_combe",
    ticketFor: "other",
    issueOwner: "Bramantyo Adi",
    pic: ["Bramantyo Adi", "Rahadian A.", "Dewi Kartika"],
    priority: "Critical",
    tags: ["twicloud", "incompleteness"],
    ipAddress: "10.21.6.87",
    status: STATUS.inProgress,
    sla: "<12h",
    upvotes: 0,
    views: 450,
    replies: [
      {
        id: "r1",
        author: "Bramantyo Adi",
        createdAt: "2026-07-31T11:05:00",
        text: "Sudah cek di sisi engine, ada delay dari upstream kafka consumer.",
        image: null,
      },
    ],
    resolution: null,
  },
  {
    id: "NDQR20260713092",
    author: "Rahadian A.",
    createdAt: "2026-07-13T09:12:00",
    title: "etl_core_sgsn_ericsson_kpi_hourly Reload & Reprocess",
    description:
      "Data KPI hourly perlu di-reload karena tanggal berhasil tidak konsisten dengan control table.",
    category: { application: "NDM", scope: "Data Ingestion", concern: "Format Data" },
    domain: "NDM AL",
    tableName: "etl_core_sgsn_ericsson_kpi_hourly",
    ticketFor: "self",
    issueOwner: "Rahadian A.",
    pic: ["Rahadian A.", "Siti Nurhaliza", "Ivan Nurcahyo"],
    priority: "Medium",
    tags: ["etl_core_sgsn", "reprocess"],
    ipAddress: "10.22.1.34",
    status: STATUS.closed,
    sla: "<12h",
    upvotes: 3,
    views: 1280,
    replies: [
      {
        id: "r1",
        author: "Rahadian A.",
        createdAt: "2026-07-13T09:20:00",
        text: "Sudah reload ulang tanggal 12-13 Juli.",
        image: null,
      },
      {
        id: "r2",
        author: "Siti Nurhaliza",
        createdAt: "2026-07-13T10:02:00",
        text: "Konfirmasi, row count sudah sesuai dengan control table sekarang.",
        image: null,
      },
    ],
    resolution: {
      rootCause: "Delay pada job reprocess harian yang tidak ter-trigger otomatis.",
      suspectSystem: "ETL Core SGSN Pipeline",
      resolutionNotes: "Reload & reprocess data tanggal 12-13 Juli, jadwal cron diperbaiki.",
    },
  },
  {
    id: "NDQR20260728015",
    author: "Dewi Kartika",
    createdAt: "2026-07-28T14:40:00",
    title: "Validity kpi RAN Ericsson turun drastis",
    description:
      "Nilai validity_kpi pada default.etl_cell_5g_ran_ericsson_kpi_daily turun dari 98% ke 61% sejak kemarin.",
    category: { application: "NDM", scope: "Data Quality", concern: "Validity" },
    domain: "NDM AL",
    tableName: "default.etl_cell_5g_ran_ericsson_kpi_daily",
    ticketFor: "self",
    issueOwner: "Dewi Kartika",
    pic: ["Nabila Putri"],
    priority: "Critical",
    tags: ["ran_ericsson", "validity_kpi"],
    ipAddress: "10.21.9.55",
    status: STATUS.open,
    sla: "<12h",
    upvotes: 5,
    views: 210,
    replies: [],
    resolution: null,
  },
  {
    id: "NDQR20260726007",
    author: "Yoga Pratama",
    createdAt: "2026-07-26T07:00:00",
    title: "Akses table reference.core_control_table ditolak",
    description:
      "Beberapa user group tidak bisa query reference.core_control_table sejak rotasi kredensial minggu lalu.",
    category: { application: "NDM", scope: "Keamanan dan akses table", concern: "Access Control" },
    domain: "NDM SL",
    tableName: "reference.core_control_table",
    ticketFor: "other",
    issueOwner: "Siti Nurhaliza",
    pic: ["Siti Nurhaliza", "Bramantyo Adi", "Nabila Putri"],
    priority: "Low",
    tags: ["access_denied", "core_control_table"],
    ipAddress: "10.23.2.17",
    status: STATUS.open,
    sla: "<12h",
    upvotes: 2,
    views: 88,
    replies: [],
    resolution: null,
  },
  {
    id: "NDQR20260722044",
    author: "Nabila Putri",
    createdAt: "2026-07-22T16:30:00",
    title: "Format tanggal tidak konsisten di base.oss_core_vas_sms_msc_hh",
    description:
      "Kolom date_end memakai format campuran dd/mm/yyyy dan yyyy-mm-dd pada beberapa partisi.",
    category: { application: "NDM", scope: "Data Ingestion", concern: "Format Data" },
    domain: "NDM AL",
    tableName: "base.oss_core_vas_sms_msc_hh",
    ticketFor: "self",
    issueOwner: "Nabila Putri",
    pic: ["Ivan Nurcahyo"],
    priority: "Medium",
    tags: ["oss_core_vas", "format_date"],
    ipAddress: "10.22.7.63",
    status: STATUS.solved,
    sla: "<12h",
    upvotes: 4,
    views: 156,
    replies: [
      {
        id: "r1",
        author: "Nabila Putri",
        createdAt: "2026-07-22T17:00:00",
        text: "Attaching screenshot dari sample partisi yang bermasalah.",
        image: null,
      },
    ],
    resolution: null,
  },
  {
    id: "NDQR20260710066",
    author: "Fengky Pratama",
    createdAt: "2026-07-10T09:45:00",
    title: "Duplicate rows pada smy.etl_core_cs_nokia_gcs_dd",
    description:
      "Ditemukan duplikasi baris pada window tanggal 8-9 Juli, kemungkinan re-ingest ganda.",
    category: { application: "NDM", scope: "Data Quality", concern: "Completeness" },
    domain: "NDM SL",
    tableName: "smy.etl_core_cs_nokia_gcs_dd",
    ticketFor: "self",
    issueOwner: "Fengky Pratama",
    pic: ["Rahadian A.", "Dewi Kartika", "Ivan Nurcahyo"],
    priority: "Low",
    tags: ["core_cs_nokia", "duplicate"],
    ipAddress: "10.21.3.201",
    status: STATUS.closed,
    sla: "<12h",
    upvotes: 1,
    views: 342,
    replies: [
      {
        id: "r1",
        author: "Rahadian A.",
        createdAt: "2026-07-10T10:00:00",
        text: "Dedup job dijalankan manual, row count sudah normal.",
        image: null,
      },
    ],
    resolution: {
      rootCause: "Job re-ingest berjalan dua kali akibat retry otomatis tanpa idempotency check.",
      suspectSystem: "Core CS Nokia Ingest Pipeline",
      resolutionNotes: "Menambahkan idempotency key pada job ingest, dedup manual untuk data lama.",
    },
  },
  {
    id: "NDQR20260705021",
    author: "Dewi Kartika",
    createdAt: "2026-07-05T11:15:00",
    title: "Minor cosmetic mismatch pada validity_kpi dashboard",
    description:
      "Label kolom pada dashboard validity_kpi tidak konsisten dengan penamaan di tabel sumber, tidak berdampak ke data.",
    category: { application: "NDM", scope: "Data Quality", concern: "Validity" },
    domain: "NDM SL",
    tableName: "default.icdm_validity_daily_chk",
    ticketFor: "self",
    issueOwner: "Dewi Kartika",
    pic: ["Nabila Putri", "Ivan Nurcahyo", "Bramantyo Adi"],
    priority: "Low",
    tags: ["validity_kpi", "cosmetic"],
    ipAddress: "10.21.9.77",
    status: STATUS.open,
    sla: "<12h",
    upvotes: 0,
    views: 5,
    replies: [],
    resolution: null,
  },
]

export function ticketAuthorInitials(name) {
  return initialsOf(name)
}

export function ticketAuthorEmail(name) {
  return emailOf(name)
}

export function ticketAuthorAvatarUrl(name) {
  return avatarUrlOf(name)
}

export function getTicketById(id) {
  return TICKETS.find((t) => t.id === id)
}

export function flattenCategoryLeaves(tree) {
  const leaves = []
  const walk = (nodes, path) => {
    for (const node of nodes) {
      const nextPath = [...path, node.name]
      if (node.children && node.children.length > 0) {
        walk(node.children, nextPath)
      } else {
        leaves.push(nextPath.join(" / "))
      }
    }
  }
  walk(tree, [])
  return leaves
}
