// Rules Management catalog — human-readable titles/descriptions and a
// generic, simplified SQL template per rule type, built on the SAME rule
// types and dimension grouping already defined in constants.js. This is a
// lighter, single-table representation (fixed placeholder tokens) meant for
// browsing/authoring rule formulas, distinct from DQ Composer's full
// multi-table generator in buildQuery.js which fills in real table/column
// names directly.

import { DIMENSIONS } from "./constants"

// Fixed contract for every rule formula in Rules Management (standard or
// custom) — same variables, same required output columns, regardless of
// rule type or dimension.
export const AVAILABLE_VARIABLES = ["{table_name}", "{column}", "{period_column}", "{lookback_days}", "{limit}"]
export const REQUIRED_OUTPUT_COLUMNS = [
  "table_name",
  "period",
  "rule_name",
  "column_name",
  "total_rows",
  "rate_pct",
  "status",
]

function template(ruleName, body) {
  return `SELECT
  '{table_name}' AS table_name,
  CAST({period_column} AS DATE) AS period,
  '${ruleName}' AS rule_name,
  '{column}' AS column_name,
  count(*) AS total_rows,
${body}
FROM {table_name}
WHERE {period_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
LIMIT {limit}`
}

const STANDARD_RULES = [
  {
    key: "not_null",
    dimension: "Completeness",
    title: "Not Null Check",
    description: "Flags rows where the selected column is null or empty.",
    template: template(
      "not_null",
      `  round(100 * (count(*) - count(*) FILTER (WHERE {column} IS NULL OR trim(CAST({column} AS VARCHAR)) = '')) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE {column} IS NULL OR trim(CAST({column} AS VARCHAR)) = '') = 0 THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
  {
    key: "count_row",
    dimension: "Completeness",
    title: "Row Count Check",
    description: "Flags periods where no rows were loaded at all.",
    template: template("count_row", `  100.0 AS rate_pct,\n  CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status`),
  },
  {
    key: "missing_key",
    dimension: "Completeness",
    title: "Missing Key Check",
    description: "Flags rows where a required key column has no value.",
    template: template(
      "missing_key",
      `  round(100 * count(DISTINCT {column}) / count(*), 2) AS rate_pct,
  CASE WHEN count(DISTINCT {column}) = 0 THEN 'FAIL' ELSE 'PASS' END AS status`
    ),
  },
  {
    key: "missing_period",
    dimension: "Completeness",
    title: "Missing Period Check",
    description: "Flags periods that are missing entirely from the expected schedule.",
    template: template("missing_period", `  100.0 AS rate_pct,\n  CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status`),
  },
  {
    key: "timeliness",
    dimension: "Timeliness",
    title: "Data Freshness Check",
    description: "Checks if the most recent record falls within the expected lookback window.",
    template: template(
      "timeliness",
      `  100.0 AS rate_pct,
  CASE WHEN max({period_column}) >= current_timestamp - INTERVAL '1 days' THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
  {
    key: "validity_column",
    dimension: "Validity",
    title: "Validity Check",
    description: "Flags rows where the column value is blank or not well-formed.",
    template: template(
      "validity_column",
      `  round(100 * (count(*) - count(*) FILTER (WHERE trim(CAST({column} AS VARCHAR)) = '')) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE trim(CAST({column} AS VARCHAR)) = '') = 0 THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
  {
    key: "consistency_key",
    dimension: "Consistency",
    title: "Key Consistency Check",
    description: "Flags keys present in the latest period but missing from the prior one.",
    template: `WITH curr AS (
  SELECT CAST({period_column} AS DATE) AS period, {column} AS key_value
  FROM {table_name}
  WHERE {period_column} >= current_timestamp - INTERVAL '{lookback_days} days'
  GROUP BY period, key_value
),
prev AS (
  SELECT CAST({period_column} AS DATE) + INTERVAL '1 days' AS period, {column} AS key_value
  FROM {table_name}
  GROUP BY period, key_value
)
SELECT
  '{table_name}' AS table_name,
  curr.period AS period,
  'consistency_key' AS rule_name,
  '{column}' AS column_name,
  count(*) AS total_rows,
  round(100 * count(*) FILTER (WHERE prev.key_value IS NOT NULL) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE prev.key_value IS NULL) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM curr
LEFT JOIN prev ON curr.period = prev.period AND curr.key_value = prev.key_value
GROUP BY curr.period
LIMIT {limit}`,
  },
  {
    key: "consistency_value",
    dimension: "Consistency",
    title: "Value Consistency Check",
    description: "Flags periods where an aggregated metric shifts sharply from the prior period.",
    template: `WITH curr AS (
  SELECT CAST({period_column} AS DATE) AS period, avg({column}) AS agg_value
  FROM {table_name}
  WHERE {period_column} >= current_timestamp - INTERVAL '{lookback_days} days'
  GROUP BY period
),
prev AS (
  SELECT CAST({period_column} AS DATE) + INTERVAL '1 days' AS period, avg({column}) AS agg_value
  FROM {table_name}
  GROUP BY period
)
SELECT
  '{table_name}' AS table_name,
  curr.period AS period,
  'consistency_value' AS rule_name,
  '{column}' AS column_name,
  1 AS total_rows,
  round(100 * abs(curr.agg_value - prev.agg_value) / NULLIF(prev.agg_value, 0), 2) AS rate_pct,
  CASE WHEN prev.agg_value IS NULL OR abs(curr.agg_value - prev.agg_value) / NULLIF(prev.agg_value, 0) <= 0.1 THEN 'PASS' ELSE 'FAIL' END AS status
FROM curr
LEFT JOIN prev ON curr.period = prev.period
LIMIT {limit}`,
  },
  {
    key: "uniqueness_key",
    dimension: "Uniqueness",
    title: "Uniqueness Check",
    description: "Flags duplicate values in a column that should be unique per period.",
    template: template(
      "uniqueness_key",
      `  round(100 * count(DISTINCT {column}) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) = count(DISTINCT {column}) THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
  {
    key: "range_check",
    dimension: "Accuracy",
    title: "Range Check",
    description: "Flags numeric values that fall outside an expected min/max range.",
    template: template(
      "range_check",
      `  round(100 * (count(*) - count(*) FILTER (WHERE {column} < 0 OR {column} > 100)) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE {column} < 0 OR {column} > 100) = 0 THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
  {
    key: "pattern_check",
    dimension: "Accuracy",
    title: "Pattern Check",
    description: "Flags values that don't match an expected regex pattern (e.g. phone number format).",
    template: template(
      "pattern_check",
      `  round(100 * count(*) FILTER (WHERE regexp_matches(CAST({column} AS VARCHAR), '^[A-Za-z0-9]+$')) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE NOT regexp_matches(CAST({column} AS VARCHAR), '^[A-Za-z0-9]+$')) = 0 THEN 'PASS' ELSE 'FAIL' END AS status`
    ),
  },
]

export function getStandardRules() {
  return STANDARD_RULES
}

export function getDimensionKeys() {
  return DIMENSIONS.map((d) => d.key)
}

export function validateRuleFormula(sql) {
  const lower = sql.toLowerCase()
  const missingColumns = REQUIRED_OUTPUT_COLUMNS.filter((col) => !lower.includes(col.toLowerCase()))
  const hasVariable = /\{[a-z_]+\}/i.test(sql)
  const valid = missingColumns.length === 0 && hasVariable
  return { valid, missingColumns, hasVariable }
}
