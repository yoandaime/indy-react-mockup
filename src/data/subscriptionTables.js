// Mock data for the Subscription page — table catalogue + which ones start subscribed.

export const APPLICATIONS = ["ALL", "NDM", "IPDM", "ACS AXIOS"]
export const CATEGORIES = ["ALL", "RAN", "FMC", "CORE PS", "TRANSPORT RAN"]

export const SUBSCRIPTION_TABLES = [
  { id: 1, name: "ran_cell_day_5g", app: "NDM", category: "RAN" },
  { id: 2, name: "ran_cell_day_2g", app: "NDM", category: "RAN" },
  { id: 3, name: "ran_sector_carrier_hour", app: "NDM", category: "RAN" },
  { id: 4, name: "ran_neighbor_relation_daily", app: "NDM", category: "RAN" },
  { id: 5, name: "ran_cell_hour_5g", app: "NDM", category: "RAN" },
  { id: 6, name: "ran_cell_hour_2g", app: "NDM", category: "RAN" },
  { id: 7, name: "ran_cell_day_4g", app: "NDM", category: "RAN" },
  { id: 8, name: "ran_cell_hour_4g", app: "NDM", category: "RAN" },
  { id: 9, name: "ran_cell_day_3g", app: "NDM", category: "RAN" },
  { id: 10, name: "ran_cell_hour_3g", app: "NDM", category: "RAN" },
  { id: 11, name: "ran_handover_success_daily", app: "NDM", category: "RAN" },
  { id: 12, name: "ran_handover_success_hourly", app: "NDM", category: "RAN" },
  { id: 13, name: "ran_endc_setup_daily", app: "NDM", category: "RAN" },
  { id: 14, name: "fmc_traffic_daily", app: "NDM", category: "FMC" },
  { id: 15, name: "fmc_session_hour", app: "NDM", category: "FMC" },
  { id: 16, name: "fmc_wifi_offload_daily", app: "NDM", category: "FMC" },
  { id: 17, name: "fmc_wifi_offload_hourly", app: "NDM", category: "FMC" },
  { id: 18, name: "fmc_broadband_usage_daily", app: "NDM", category: "FMC" },
  { id: 19, name: "fmc_iptv_session_hour", app: "NDM", category: "FMC" },
  { id: 20, name: "fmc_ont_status_daily", app: "NDM", category: "FMC" },
  { id: 21, name: "core_ps_bearer_hour", app: "NDM", category: "CORE PS" },
  { id: 22, name: "core_ps_apn_daily", app: "NDM", category: "CORE PS" },
  { id: 23, name: "core_ps_pgw_session_hour", app: "NDM", category: "CORE PS" },
  { id: 24, name: "core_ps_sgw_session_daily", app: "NDM", category: "CORE PS" },
  { id: 25, name: "core_ps_data_usage_hour", app: "NDM", category: "CORE PS" },
  { id: 26, name: "core_ps_data_usage_daily", app: "NDM", category: "CORE PS" },
  { id: 27, name: "core_ps_volte_registration_hour", app: "NDM", category: "CORE PS" },
  { id: 28, name: "transport_ran_fiber_daily", app: "NDM", category: "TRANSPORT RAN" },
  { id: 29, name: "transport_ran_fiber_hourly", app: "NDM", category: "TRANSPORT RAN" },
  { id: 30, name: "transport_ran_microwave_daily", app: "NDM", category: "TRANSPORT RAN" },
  { id: 31, name: "transport_ran_microwave_hourly", app: "NDM", category: "TRANSPORT RAN" },
  { id: 32, name: "transport_ran_capacity_daily", app: "NDM", category: "TRANSPORT RAN" },
  { id: 33, name: "ipdm_ran_cell_perf_daily", app: "IPDM", category: "RAN" },
  { id: 34, name: "ipdm_fmc_usage_hour", app: "IPDM", category: "FMC" },
  { id: 35, name: "ipdm_core_ps_session_daily", app: "IPDM", category: "CORE PS" },
  { id: 36, name: "ipdm_transport_link_daily", app: "IPDM", category: "TRANSPORT RAN" },
  { id: 37, name: "acs_ran_alarm_daily", app: "ACS AXIOS", category: "RAN" },
  { id: 38, name: "acs_fmc_qos_hour", app: "ACS AXIOS", category: "FMC" },
  { id: 39, name: "acs_core_ps_latency_daily", app: "ACS AXIOS", category: "CORE PS" },
  { id: 40, name: "acs_transport_utilization_daily", app: "ACS AXIOS", category: "TRANSPORT RAN" },
]

export const INITIAL_SUBSCRIBED_IDS = [1, 2]

// Dimensions shown in the embed widget preview (see admin extension tabs).
export const DQ_DIMENSIONS = [
  "Completeness",
  "Uniqueness",
  "Validity",
  "Consistency",
  "Timeliness",
]

const GOOD_INSIGHT =
  "This data is reliable and suitable for daily operational decisions."
const BAD_INSIGHT =
  "Relying on this data without thorough verification could lead to critical errors in daily operational decisions."

// Deterministic mock DQ score per table/dimension — stands in for a real metrics API.
export function getTableDimensionMetric(table, dimensionIndex) {
  const score = ((table.id * (dimensionIndex + 3) * 17) % 97) + 3
  const isGood = score >= 50
  return {
    score,
    isGood,
    insight: isGood ? GOOD_INSIGHT : BAD_INSIGHT,
  }
}
