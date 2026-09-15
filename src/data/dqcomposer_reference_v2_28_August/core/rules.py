DEFAULT_PARTITION_COLUMN = "start_timestamp"
DEFAULT_LOOKBACK_DAYS = 100
DEFAULT_LIMIT = 100
DEFAULT_GRANULARITY = "daily"
MAX_NOT_NULL_COLUMNS = 5
MAX_MISSING_KEY_COLUMNS = 5

RULE_TYPES = [
    "not_null",
    "count_row",
    "missing_key",
    "missing_period",
    "timeliness",
    "validity_column",
    "consistency_key",
    "consistency_value",
    "uniqueness_key",
    "range_check",
    "pattern_check",
    "allowed_values",
]
CONSISTENCY_KEY_MODES = ["summary", "detail"]
CONSISTENCY_VALUE_AGGREGATIONS = ["sum", "max", "min", "avg", "count"]

GRANULARITY_EXPR = {
    "five_minutely": "time_bucket(INTERVAL '5 minutes', {partition_column})",
    "quarter_hourly": "time_bucket(INTERVAL '15 minutes', {partition_column})",
    "hourly": "date_trunc('hour', {partition_column})",
    "daily": "CAST({partition_column} AS DATE)",
    "weekly": "date_trunc('week', {partition_column})",
    "monthly": "date_trunc('month', {partition_column})",
}
GRANULARITIES = list(GRANULARITY_EXPR.keys())

EXPECTED_PERIODS_PER_DAY = {
    "five_minutely": 288,
    "quarter_hourly": 96,
    "hourly": 24,
}
MISSING_PERIOD_GRANULARITIES = list(EXPECTED_PERIODS_PER_DAY.keys())

_NOT_NULL_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'not_null' AS rule_name,
  '{column_name}' AS column_name,
  count(*) FILTER (WHERE {column_name} IS NULL OR trim(CAST({column_name} AS VARCHAR)) = '') AS null_count,
  count(*) AS total_rows,
  round(100 * (count(*) - count(*) FILTER (WHERE {column_name} IS NULL OR trim(CAST({column_name} AS VARCHAR)) = '')) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE {column_name} IS NULL OR trim(CAST({column_name} AS VARCHAR)) = '') = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_COUNT_ROW_TEMPLATE = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'count_row' AS rule_name,
  count(*) AS count_row,
  {denum} AS reference,
  round(100 * count(*) / {rate_denom}, 2) AS rate,
  {status_expr} AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_MISSING_KEY_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'missing_key' AS rule_name,
  '{column_name}' AS column_name,
  count(DISTINCT {column_name}) AS key_count,
  {reference} AS reference,
  {status_expr} AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_MISSING_PERIOD_TEMPLATE = """SELECT
  '{table}' AS table_name,
  CAST({partition_column} AS DATE) AS period,
  'missing_period' AS rule_name,
  count(DISTINCT {granularity_expr}) AS count_period,
  {expected} - count(DISTINCT {granularity_expr}) AS missing_period,
  round(100 * count(DISTINCT {granularity_expr}) / {expected}, 2) AS rate,
  CASE WHEN count(DISTINCT {granularity_expr}) = {expected} THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_TIMELINESS_TEMPLATE = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'timeliness' AS rule_name,
  min({insert_time_column}) AS first_insert,
  max({insert_time_column}) AS last_insert,
  NULL AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_VALIDITY_COLUMN_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'validity_column' AS rule_name,
  '{column_name}' AS column_name,
  count(*) - count(*) FILTER (WHERE {invalid_condition}) AS key_count,
  count(*) AS total_row,
  count(*) FILTER (WHERE {invalid_condition}) AS delta,
  round(100 * (count(*) - count(*) FILTER (WHERE {invalid_condition})) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE {invalid_condition}) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_ALLOWED_VALUES_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'allowed_values' AS rule_name,
  '{column_name}' AS column_name,
  count(*) FILTER (WHERE CAST({column_name} AS VARCHAR) NOT IN ({values_list})) AS invalid_count,
  count(*) AS total_rows,
  round(100 * (count(*) - count(*) FILTER (WHERE CAST({column_name} AS VARCHAR) NOT IN ({values_list}))) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE CAST({column_name} AS VARCHAR) NOT IN ({values_list})) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_RANGE_CHECK_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'range_check' AS rule_name,
  '{column_name}' AS column_name,
  count(*) FILTER (WHERE {range_condition}) AS out_of_range_count,
  count(*) AS total_rows,
  round(100 * (count(*) - count(*) FILTER (WHERE {range_condition})) / count(*), 2) AS rate_pct,
  CASE WHEN count(*) FILTER (WHERE {range_condition}) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_PATTERN_CHECK_BLOCK = """SELECT
  '{table}' AS table_name,
  {partition_expr} AS period,
  'pattern_check' AS rule_name,
  '{column_name}' AS column_name,
  count(*) FILTER (WHERE regexp_matches(CAST({column_name} AS VARCHAR), '{pattern}')) AS match_pattern,
  count(*) AS total_row,
  count(*) FILTER (WHERE NOT regexp_matches(CAST({column_name} AS VARCHAR), '{pattern}')) AS delta,
  round(100 * count(*) FILTER (WHERE regexp_matches(CAST({column_name} AS VARCHAR), '{pattern}')) / count(*), 2) AS rate,
  CASE WHEN count(*) FILTER (WHERE NOT regexp_matches(CAST({column_name} AS VARCHAR), '{pattern}')) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM {table}
WHERE {partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
GROUP BY period
ORDER BY period DESC{limit_clause}"""

_CONSISTENCY_KEY_CTE = """WITH
  main_keys AS (
    SELECT {main_period_expr} AS period, {main_key_column} AS key_value
    FROM {table}
    WHERE {main_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
    GROUP BY period, key_value
  ),
  control_keys AS (
    SELECT {control_period_expr} AS period, {control_key_column} AS key_value
    FROM {control_table}
    WHERE {control_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
    GROUP BY period, key_value
  )
"""

_CONSISTENCY_KEY_SUMMARY_TEMPLATE = (
    _CONSISTENCY_KEY_CTE
    + """SELECT
  '{table}' AS table_name,
  '{control_table}' AS control_table,
  m.period AS period,
  count(*) AS key_count,
  count(*) FILTER (WHERE c.key_value IS NULL) AS missing_count,
  round(100 * (count(*) - count(*) FILTER (WHERE c.key_value IS NULL)) / count(*), 2) AS rate,
  CASE WHEN count(*) FILTER (WHERE c.key_value IS NULL) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM main_keys m
LEFT JOIN control_keys c ON m.period = c.period AND m.key_value = c.key_value
GROUP BY m.period
ORDER BY m.period DESC{limit_clause}"""
)

_CONSISTENCY_KEY_DETAIL_TEMPLATE = (
    _CONSISTENCY_KEY_CTE
    + """SELECT
  m.period AS period,
  m.key_value AS key_value
FROM main_keys m
LEFT JOIN control_keys c ON m.period = c.period AND m.key_value = c.key_value
WHERE c.key_value IS NULL
ORDER BY m.period DESC, m.key_value{limit_clause}"""
)

_CONSISTENCY_VALUE_TEMPLATE = """WITH
  main_agg AS (
    SELECT {main_period_expr} AS period, {agg_func}({main_metric_column}) AS value_a
    FROM {table}
    WHERE {main_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
    GROUP BY period
  ),
  control_agg AS (
    SELECT {control_period_expr} AS period, {agg_func}({control_metric_column}) AS value_b
    FROM {control_table}
    WHERE {control_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
    GROUP BY period
  )
SELECT
  '{table}' AS table_name,
  '{control_table}' AS control_table,
  m.period AS period,
  '{main_metric_column}' AS column_name,
  round(m.value_a, 2) AS agg_main,
  round(c.value_b, 2) AS agg_control,
  round(m.value_a - c.value_b, 2) AS delta,
  CASE WHEN c.value_b = 0 OR m.value_a = 0 THEN NULL ELSE round(abs(m.value_a - c.value_b) / c.value_b * 100, 2) END AS delta_pct,
  CASE
    WHEN c.value_b = 0 OR m.value_a = 0 THEN 'FAIL'
    WHEN abs(m.value_a - c.value_b) / c.value_b * 100 <= 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM main_agg m
LEFT JOIN control_agg c ON m.period = c.period
ORDER BY m.period DESC{limit_clause}"""

_COUNT_DISTINCT_KEY_TEMPLATE = """WITH
  main_keys AS (
    SELECT {main_period_expr} AS period, {main_key_expr} AS key_value
    FROM {table}
    WHERE {main_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
  ),
  main_agg AS (
    SELECT period, count(*) AS total_rows, count(DISTINCT key_value) AS distinct_count
    FROM main_keys
    GROUP BY period
  ),
  control_keys AS (
    SELECT {control_period_expr} AS period, {control_key_expr} AS key_value
    FROM {control_table}
    WHERE {control_partition_column} >= current_timestamp - INTERVAL '{lookback_days} days'
    GROUP BY period, key_value
  ),
  missing_agg AS (
    SELECT mk.period AS period, count(DISTINCT CASE WHEN c.key_value IS NULL THEN mk.key_value ELSE NULL END) AS missing_count
    FROM main_keys mk
    LEFT JOIN control_keys c ON mk.period = c.period AND mk.key_value = c.key_value
    GROUP BY mk.period
  )
SELECT
  '{table}' AS table_name,
  '{control_table}' AS control_table,
  m.period AS period,
  m.total_rows AS total_rows,
  m.distinct_count AS distinct_count,
  m.total_rows - m.distinct_count AS duplicate_count,
  a.missing_count AS missing_count,
  round(100 * m.distinct_count / m.total_rows, 2) AS rate,
  CASE WHEN m.total_rows = m.distinct_count AND a.missing_count = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM main_agg m
LEFT JOIN missing_agg a ON m.period = a.period
ORDER BY m.period DESC{limit_clause}"""


def _resolve_partition_expr(p_partition_column, p_granularity):
    expr_template = GRANULARITY_EXPR.get(p_granularity)
    if expr_template is None:
        raise ValueError(f"Unsupported granularity: {p_granularity!r}")
    return expr_template.format(partition_column=p_partition_column)


def _resolve_limit_clause(p_limit):
    if int(p_limit) == 0:
        return ""
    return f"\nLIMIT {p_limit}"


def _build_not_null_query(
    p_table, p_column_names, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for not_null")
    if len(p_column_names) > MAX_NOT_NULL_COLUMNS:
        raise ValueError(f"Maximum {MAX_NOT_NULL_COLUMNS} columns allowed for not_null")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = [
        _NOT_NULL_BLOCK.format(
            table=p_table,
            column_name=column_name,
            partition_expr=partition_expr,
            partition_column=p_partition_column,
            lookback_days=p_lookback_days,
            limit_clause=limit_clause,
        )
        for column_name in p_column_names
    ]

    return "\nUNION ALL\n".join(blocks)


def _build_count_row_query(
    p_table, p_partition_column, p_granularity, p_lookback_days, p_limit, p_reference
):
    reference = str(p_reference).strip()
    if reference:
        if not reference.lstrip("-").isdigit():
            raise ValueError(f"Reference must be a number: {p_reference!r}")
        status_expr = (
            f"CASE WHEN count(*) BETWEEN {reference} * 0.98 AND {reference} * 1.05 THEN 'PASS' ELSE 'FAIL' END"
        )
        denum = reference
        rate_denom = reference
    else:
        status_expr = "'PASS'"
        denum = "NULL"
        rate_denom = "NULL"

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    return _COUNT_ROW_TEMPLATE.format(
        table=p_table,
        partition_expr=partition_expr,
        partition_column=p_partition_column,
        lookback_days=p_lookback_days,
        limit_clause=limit_clause,
        status_expr=status_expr,
        denum=denum,
        rate_denom=rate_denom,
    )


def _build_missing_key_query(
    p_table, p_column_names, p_references, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for missing_key")
    if len(p_column_names) > MAX_MISSING_KEY_COLUMNS:
        raise ValueError(f"Maximum {MAX_MISSING_KEY_COLUMNS} columns allowed for missing_key")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = []
    for i, column_name in enumerate(p_column_names):
        ref = str(p_references[i]).strip() if i < len(p_references) else ""
        if ref:
            if not ref.lstrip("-").isdigit():
                raise ValueError(f"Reference must be a number: {ref!r}")
            status_expr = f"CASE WHEN count(DISTINCT {column_name}) = {ref} THEN 'PASS' ELSE 'FAIL' END"
            reference = ref
        else:
            status_expr = "'PASS'"
            reference = "NULL"

        blocks.append(
            _MISSING_KEY_BLOCK.format(
                table=p_table,
                column_name=column_name,
                partition_expr=partition_expr,
                partition_column=p_partition_column,
                lookback_days=p_lookback_days,
                limit_clause=limit_clause,
                reference=reference,
                status_expr=status_expr,
            )
        )

    return "\nUNION ALL\n".join(blocks)


def _build_missing_period_query(
    p_table, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    expected = EXPECTED_PERIODS_PER_DAY.get(p_granularity)
    if expected is None:
        raise ValueError(
            f"Unsupported granularity for missing_period: {p_granularity!r} "
            f"(allowed: {MISSING_PERIOD_GRANULARITIES})"
        )

    granularity_expr = GRANULARITY_EXPR[p_granularity].format(partition_column=p_partition_column)
    limit_clause = _resolve_limit_clause(p_limit)

    return _MISSING_PERIOD_TEMPLATE.format(
        table=p_table,
        partition_column=p_partition_column,
        granularity_expr=granularity_expr,
        expected=expected,
        lookback_days=p_lookback_days,
        limit_clause=limit_clause,
    )


def _build_timeliness_query(
    p_table, p_partition_column, p_insert_time_column, p_granularity, p_lookback_days, p_limit
):
    if not p_insert_time_column:
        raise ValueError("Insert time column is required for timeliness")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    return _TIMELINESS_TEMPLATE.format(
        table=p_table,
        partition_expr=partition_expr,
        partition_column=p_partition_column,
        insert_time_column=p_insert_time_column,
        lookback_days=p_lookback_days,
        limit_clause=limit_clause,
    )


def _build_validity_column_query(
    p_table, p_column_names, p_patterns, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for validity_column")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = []
    for i, column_name in enumerate(p_column_names):
        pattern = str(p_patterns[i]).strip() if p_patterns and i < len(p_patterns) else ""
        empty_condition = f"trim(CAST({column_name} AS VARCHAR)) = ''"
        if pattern:
            escaped_pattern = pattern.replace("'", "''")
            invalid_condition = (
                f"({empty_condition} OR NOT regexp_matches(CAST({column_name} AS VARCHAR), '{escaped_pattern}'))"
            )
        else:
            invalid_condition = empty_condition

        blocks.append(
            _VALIDITY_COLUMN_BLOCK.format(
                table=p_table,
                column_name=column_name,
                partition_expr=partition_expr,
                partition_column=p_partition_column,
                lookback_days=p_lookback_days,
                limit_clause=limit_clause,
                invalid_condition=invalid_condition,
            )
        )

    return "\nUNION ALL\n".join(blocks)


def _build_range_check_query(
    p_table, p_column_names, p_mins, p_maxs, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for range_check")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = []
    for i, column_name in enumerate(p_column_names):
        p_min = str(p_mins[i]).strip() if i < len(p_mins) else ""
        p_max = str(p_maxs[i]).strip() if i < len(p_maxs) else ""
        if not p_min and not p_max:
            raise ValueError(f"At least one of min/max is required for column: {column_name!r}")

        conditions = []
        if p_min:
            conditions.append(f"{column_name} < {p_min}")
        if p_max:
            conditions.append(f"{column_name} > {p_max}")
        range_condition = " OR ".join(conditions)

        blocks.append(
            _RANGE_CHECK_BLOCK.format(
                table=p_table,
                column_name=column_name,
                partition_expr=partition_expr,
                partition_column=p_partition_column,
                lookback_days=p_lookback_days,
                limit_clause=limit_clause,
                range_condition=range_condition,
            )
        )

    return "\nUNION ALL\n".join(blocks)


def _build_pattern_check_query(
    p_table, p_column_names, p_patterns, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for pattern_check")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = []
    for i, column_name in enumerate(p_column_names):
        pattern = str(p_patterns[i]).strip() if i < len(p_patterns) else ""
        if not pattern:
            raise ValueError(f"Pattern is required for column: {column_name!r}")

        blocks.append(
            _PATTERN_CHECK_BLOCK.format(
                table=p_table,
                column_name=column_name,
                partition_expr=partition_expr,
                partition_column=p_partition_column,
                lookback_days=p_lookback_days,
                limit_clause=limit_clause,
                pattern=pattern.replace("'", "''"),
            )
        )

    return "\nUNION ALL\n".join(blocks)


def _build_allowed_values_query(
    p_table, p_column_names, p_values_lists, p_partition_column, p_granularity, p_lookback_days, p_limit
):
    if not p_column_names:
        raise ValueError("At least one column is required for allowed_values")

    partition_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    blocks = []
    for i, column_name in enumerate(p_column_names):
        values = p_values_lists[i] if i < len(p_values_lists) else []
        if not values:
            raise ValueError(f"At least one allowed value is required for column: {column_name!r}")

        escaped_values = [v.replace("'", "''") for v in values]
        values_list = ", ".join(f"'{v}'" for v in escaped_values)

        blocks.append(
            _ALLOWED_VALUES_BLOCK.format(
                table=p_table,
                column_name=column_name,
                partition_expr=partition_expr,
                partition_column=p_partition_column,
                lookback_days=p_lookback_days,
                limit_clause=limit_clause,
                values_list=values_list,
            )
        )

    return "\nUNION ALL\n".join(blocks)


def _build_consistency_key_query(
    p_table,
    p_partition_column,
    p_key_columns,
    p_control_table,
    p_control_partition_column,
    p_control_key_columns,
    p_mode,
    p_granularity,
    p_lookback_days,
    p_limit,
):
    if not p_control_table:
        raise ValueError("Control table is required for consistency_key")
    if not p_key_columns or not p_control_key_columns:
        raise ValueError("Key column (both tables) is required for consistency_key")
    if len(p_key_columns) != len(p_control_key_columns):
        raise ValueError("Key columns and control key columns must have the same length")
    if p_mode not in CONSISTENCY_KEY_MODES:
        raise ValueError(f"Unsupported mode: {p_mode!r} (allowed: {CONSISTENCY_KEY_MODES})")

    main_period_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    control_period_expr = _resolve_partition_expr(p_control_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    template = (
        _CONSISTENCY_KEY_SUMMARY_TEMPLATE if p_mode == "summary" else _CONSISTENCY_KEY_DETAIL_TEMPLATE
    )

    blocks = [
        template.format(
            table=p_table,
            main_period_expr=main_period_expr,
            main_key_column=key_column,
            main_partition_column=p_partition_column,
            control_table=p_control_table,
            control_period_expr=control_period_expr,
            control_key_column=p_control_key_columns[i],
            control_partition_column=p_control_partition_column,
            lookback_days=p_lookback_days,
            limit_clause=limit_clause,
        )
        for i, key_column in enumerate(p_key_columns)
    ]

    return "\nUNION ALL\n".join(blocks)


def _build_consistency_value_query(
    p_table,
    p_partition_column,
    p_metric_column,
    p_agg_func,
    p_control_table,
    p_control_partition_column,
    p_control_metric_column,
    p_granularity,
    p_lookback_days,
    p_limit,
):
    if not p_control_table:
        raise ValueError("Control table is required for consistency_value")
    if not p_metric_column or not p_control_metric_column:
        raise ValueError("Metric column (both tables) is required for consistency_value")
    if p_agg_func not in CONSISTENCY_VALUE_AGGREGATIONS:
        raise ValueError(
            f"Unsupported aggregation: {p_agg_func!r} (allowed: {CONSISTENCY_VALUE_AGGREGATIONS})"
        )

    main_period_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    control_period_expr = _resolve_partition_expr(p_control_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)
    agg_func = "COUNT" if p_agg_func == "count" else p_agg_func

    return _CONSISTENCY_VALUE_TEMPLATE.format(
        table=p_table,
        main_period_expr=main_period_expr,
        main_metric_column=p_metric_column,
        main_partition_column=p_partition_column,
        control_table=p_control_table,
        control_period_expr=control_period_expr,
        control_metric_column=p_control_metric_column,
        control_partition_column=p_control_partition_column,
        agg_func=agg_func,
        lookback_days=p_lookback_days,
        limit_clause=limit_clause,
    )


def _build_uniqueness_key_query(
    p_table,
    p_column_names,
    p_partition_column,
    p_control_table,
    p_control_column_names,
    p_control_partition_column,
    p_granularity,
    p_lookback_days,
    p_limit,
):
    if not p_column_names:
        raise ValueError("At least one column is required for uniqueness_key")
    if not p_control_table:
        raise ValueError("Control table is required for uniqueness_key")
    if not p_control_column_names:
        raise ValueError("Key column (control table) is required for uniqueness_key")

    main_period_expr = _resolve_partition_expr(p_partition_column, p_granularity)
    control_period_expr = _resolve_partition_expr(p_control_partition_column, p_granularity)
    limit_clause = _resolve_limit_clause(p_limit)

    main_key_args = ", '_', ".join(f"CAST({c} AS VARCHAR)" for c in p_column_names)
    main_key_expr = f"concat({main_key_args})"
    control_key_args = ", '_', ".join(f"CAST({c} AS VARCHAR)" for c in p_control_column_names)
    control_key_expr = f"concat({control_key_args})"

    return _COUNT_DISTINCT_KEY_TEMPLATE.format(
        table=p_table,
        main_period_expr=main_period_expr,
        main_key_expr=main_key_expr,
        main_partition_column=p_partition_column,
        control_table=p_control_table,
        control_period_expr=control_period_expr,
        control_key_expr=control_key_expr,
        control_partition_column=p_control_partition_column,
        lookback_days=p_lookback_days,
        limit_clause=limit_clause,
    )


def build_rule_query(
    p_table,
    p_rule_type,
    p_column_names=None,
    p_partition_column=DEFAULT_PARTITION_COLUMN,
    p_granularity=DEFAULT_GRANULARITY,
    p_lookback_days=DEFAULT_LOOKBACK_DAYS,
    p_limit=DEFAULT_LIMIT,
    p_reference="",
    p_references=None,
    p_insert_time_column="",
    p_key_columns=None,
    p_control_table="",
    p_control_partition_column="",
    p_control_key_columns=None,
    p_mode="summary",
    p_metric_column="",
    p_agg_func="sum",
    p_control_metric_column="",
    p_control_column_names=None,
    p_mins=None,
    p_maxs=None,
    p_patterns=None,
    p_allowed_values_lists=None,
    p_validity_patterns=None,
):
    if p_rule_type == "not_null":
        return _build_not_null_query(
            p_table,
            p_column_names or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "count_row":
        return _build_count_row_query(
            p_table, p_partition_column, p_granularity, p_lookback_days, p_limit, p_reference
        )

    if p_rule_type == "missing_key":
        return _build_missing_key_query(
            p_table,
            p_column_names or [],
            p_references or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "missing_period":
        return _build_missing_period_query(
            p_table, p_partition_column, p_granularity, p_lookback_days, p_limit
        )

    if p_rule_type == "timeliness":
        return _build_timeliness_query(
            p_table,
            p_partition_column,
            p_insert_time_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "validity_column":
        return _build_validity_column_query(
            p_table,
            p_column_names or [],
            p_validity_patterns or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "consistency_key":
        return _build_consistency_key_query(
            p_table,
            p_partition_column,
            p_key_columns or [],
            p_control_table,
            p_control_partition_column,
            p_control_key_columns or [],
            p_mode,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "consistency_value":
        return _build_consistency_value_query(
            p_table,
            p_partition_column,
            p_metric_column,
            p_agg_func,
            p_control_table,
            p_control_partition_column,
            p_control_metric_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "uniqueness_key":
        return _build_uniqueness_key_query(
            p_table,
            p_column_names or [],
            p_partition_column,
            p_control_table,
            p_control_column_names or [],
            p_control_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "range_check":
        return _build_range_check_query(
            p_table,
            p_column_names or [],
            p_mins or [],
            p_maxs or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "pattern_check":
        return _build_pattern_check_query(
            p_table,
            p_column_names or [],
            p_patterns or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    if p_rule_type == "allowed_values":
        return _build_allowed_values_query(
            p_table,
            p_column_names or [],
            p_allowed_values_lists or [],
            p_partition_column,
            p_granularity,
            p_lookback_days,
            p_limit,
        )

    raise ValueError(f"Unsupported rule_type: {p_rule_type!r}")
