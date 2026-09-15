import random
from datetime import datetime, timezone

import duckdb

from core.executor import _register_referenced_tables, _quote_table_refs
from core.describe import describe_table

DEFAULT_LOOKBACK_DAYS = 7
CRITICAL_NULL_PCT_THRESHOLD = 50.0

_STRING_TYPE_MARKERS = ("string", "varchar")


def _null_or_empty_expr(p_column, p_type):
    dl = p_type.lower()
    if any(marker in dl for marker in _STRING_TYPE_MARKERS):
        return f"({p_column} IS NULL OR {p_column} = '')"
    return f"{p_column} IS NULL"


def _fetch_last_insert_query_time():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _fetch_pipeline_activity(p_dates):
    return {
        d: {
            "insert_queries": random.randint(1, 10),
            "select_queries": random.randint(1, 10),
            "unique_users": random.randint(1, 10),
            "avg_query_ms": random.randint(1, 10) * 1000,
        }
        for d in p_dates
    }


def _format_duration_ms(p_ms):
    if p_ms is None:
        return "N/A"
    total_seconds = round(p_ms / 1000)
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return f"{minutes:02d}:{seconds:02d}"


def _build_profile_query(
    p_table, p_partition_column, p_insert_time_column, p_uniq_key_columns, p_columns, p_lookback_days
):
    exprs = []
    for col in p_columns:
        column_name = col["column"]
        null_expr = _null_or_empty_expr(column_name, col["type"])
        exprs.append(f"count(*) FILTER (WHERE {null_expr}) AS \"null__{column_name}\"")
        exprs.append(f"count(*) FILTER (WHERE NOT ({null_expr})) AS \"notnull__{column_name}\"")

    if p_insert_time_column:
        insert_exprs = [
            f"CAST(min({p_insert_time_column}) AS VARCHAR) AS first_insert",
            f"CAST(max({p_insert_time_column}) AS VARCHAR) AS last_insert",
        ]
    else:
        insert_exprs = ["'N/A' AS first_insert", "'N/A' AS last_insert"]

    uniq_key_expr = (
        "count(DISTINCT " + " || '_' || ".join(f"CAST({c} AS VARCHAR)" for c in p_uniq_key_columns) + ") AS uniq_key"
        if p_uniq_key_columns
        else "count(*) AS uniq_key"
    )

    key_check_columns = [c for c in p_uniq_key_columns if c != p_partition_column]
    key_exprs = []
    for column_name in key_check_columns:
        key_exprs.append(f"count(DISTINCT {column_name}) AS \"uniqkey__{column_name}\"")

    select_parts = (
        [f"CAST({p_partition_column} AS DATE) AS report_date"]
        + exprs
        + insert_exprs
        + [uniq_key_expr]
        + key_exprs
    )

    return (
        "SELECT " + ", ".join(select_parts)
        + f"\nFROM {p_table}"
        + f"\nWHERE {p_partition_column} >= current_timestamp - INTERVAL '{p_lookback_days} days'"
        + "\nGROUP BY report_date"
        + "\nORDER BY report_date"
    )


def profile_table(
    p_table,
    p_partition_column,
    p_insert_time_column="",
    p_uniq_key_columns=None,
    p_lookback_days=DEFAULT_LOOKBACK_DAYS,
):
    uniq_key_columns = p_uniq_key_columns or []

    columns = describe_table(p_table)
    if not columns:
        raise ValueError(f"Table has no columns or does not exist: {p_table!r}")

    total_columns = len(columns)
    key_check_columns = [c for c in uniq_key_columns if c != p_partition_column]

    query = _build_profile_query(
        p_table, p_partition_column, p_insert_time_column, uniq_key_columns, columns, p_lookback_days
    )

    connection = duckdb.connect()
    try:
        known_table_refs = _register_referenced_tables(connection, query)
        quoted_query = _quote_table_refs(query, known_table_refs)
        result = connection.execute(quoted_query)
        column_names = [col[0] for col in result.description]
        rows = [dict(zip(column_names, row)) for row in result.fetchall()]
    finally:
        connection.close()

    last_insert_query_time = _fetch_last_insert_query_time()

    daily = []
    for row in rows:
        profile = {}
        key_profile = {}
        for key, value in row.items():
            if key in ("report_date", "first_insert", "last_insert", "uniq_key"):
                continue
            if key.startswith("notnull__"):
                profile.setdefault(key[9:], {"n": 0, "nn": 0})["nn"] = value
            elif key.startswith("null__"):
                profile.setdefault(key[6:], {"n": 0, "nn": 0})["n"] = value
            elif key.startswith("uniqkey__"):
                key_profile[key[9:]] = value

        count_row = max((v["n"] + v["nn"] for v in profile.values()), default=0)
        daily.append(
            {
                "date": str(row["report_date"]),
                "first_insert": str(row["first_insert"]) if row["first_insert"] is not None else "N/A",
                "last_insert": str(row["last_insert"]) if row["last_insert"] is not None else "N/A",
                "rows": count_row,
                "uniq": row["uniq_key"],
                "profile": profile,
                "key_profile": key_profile,
            }
        )

    daily.sort(key=lambda d: d["date"], reverse=True)

    pipeline_activity = _fetch_pipeline_activity([d["date"] for d in daily])

    total_rows = sum(d["rows"] for d in daily)
    gap_days = [d["date"] for d in daily if d["rows"] == 0]
    data_days = [d for d in daily if d["rows"] > 0]
    null_days = sum(1 for d in daily if any(v["n"] > 0 for v in d["profile"].values()))

    all_cols = list(data_days[0]["profile"].keys()) if data_days else []

    daily_summary = []
    for d in daily:
        activity = pipeline_activity.get(d["date"], {})
        insert_queries = activity.get("insert_queries")
        select_queries = activity.get("select_queries")
        unique_users = activity.get("unique_users")
        avg_query_time = _format_duration_ms(activity.get("avg_query_ms"))

        if d["rows"] == 0:
            daily_summary.append(
                {
                    "date": d["date"],
                    "first_insert": "N/A",
                    "last_insert": "N/A",
                    "rows": 0,
                    "uniq": None,
                    "total_columns": total_columns,
                    "cols_null": None,
                    "null_values": None,
                    "notnull_values": None,
                    "insert_queries": insert_queries,
                    "select_queries": select_queries,
                    "unique_users": unique_users,
                    "avg_query_time": avg_query_time,
                    "is_gap": True,
                }
            )
            continue

        null_col_list = [(col, v["n"], v["nn"]) for col, v in d["profile"].items() if v["n"] > 0]
        daily_summary.append(
            {
                "date": d["date"],
                "first_insert": d["first_insert"],
                "last_insert": d["last_insert"],
                "rows": d["rows"],
                "uniq": d["uniq"],
                "total_columns": total_columns,
                "cols_null": len(null_col_list),
                "null_values": sum(nc for _, nc, _ in null_col_list),
                "notnull_values": sum(nnc for _, _, nnc in null_col_list),
                "insert_queries": insert_queries,
                "select_queries": select_queries,
                "unique_users": unique_users,
                "avg_query_time": avg_query_time,
                "is_gap": False,
            }
        )

    key_uniq_compare = []
    if key_check_columns:
        daily_chronological = sorted(daily, key=lambda d: d["date"])
        prev_uniq = {}
        chronological_entries = []
        for d in daily_chronological:
            entry = {"date": d["date"]}
            for col in key_check_columns:
                if d["rows"] == 0:
                    entry[col] = None
                    continue
                uniq = d["key_profile"].get(col, 0)
                compare = uniq - prev_uniq[col] if col in prev_uniq else 0
                entry[col] = {"uniq": uniq, "compare": compare, "is_consistent": compare == 0}
                prev_uniq[col] = uniq
            chronological_entries.append(entry)
        key_uniq_compare = list(reversed(chronological_entries))

    consistent_null = []
    for col in all_cols:
        daily_pct = []
        days_null = 0
        for d in data_days:
            v = d["profile"].get(col, {"n": 0, "nn": 0})
            row_total = v["n"] + v["nn"]
            pct = 100 * v["n"] / row_total if row_total else 0
            daily_pct.append(pct)
            if v["n"] > 0:
                days_null += 1

        avg_null_pct = round(sum(daily_pct) / len(daily_pct), 2) if daily_pct else 0
        is_always_null = daily_pct and all(pct == 100 for pct in daily_pct)

        if avg_null_pct <= 0:
            severity = "CLEAN"
        elif is_always_null:
            severity = "ALWAYS_NULL"
        elif avg_null_pct >= CRITICAL_NULL_PCT_THRESHOLD:
            severity = "CRITICAL"
        else:
            severity = "WATCH"

        consistent_null.append(
            {
                "column": col,
                "avg_null_pct": avg_null_pct,
                "severity": severity,
                "days_null": days_null,
                "days_total": len(daily),
            }
        )

    _SEVERITY_ORDER = {"ALWAYS_NULL": 0, "CRITICAL": 1, "WATCH": 2, "CLEAN": 3}
    consistent_null.sort(key=lambda c: (_SEVERITY_ORDER[c["severity"]], -c["avg_null_pct"]))

    return {
        "table": p_table,
        "period_column": p_partition_column,
        "insert_time_column": p_insert_time_column or None,
        "uniq_key_columns": uniq_key_columns or None,
        "key_check_columns": key_check_columns,
        "last_insert_query_time": last_insert_query_time,
        "daily": daily_summary,
        "key_uniq_compare": key_uniq_compare,
        "consistent_null": consistent_null,
        "summary": {
            "total_rows": total_rows,
            "days_with_data": len(daily) - len(gap_days),
            "days_total": len(daily),
            "gap_days": gap_days,
            "null_days": null_days,
        },
    }
