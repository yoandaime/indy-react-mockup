import os
import re
from datetime import date, datetime

import duckdb

from config.db import resolve_csv_path

_TABLE_REF_PATTERN = re.compile(r"(?<!['\"])\b([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\b(?!['\"])")


def _format_value(p_value):
    if isinstance(p_value, datetime):
        return p_value.strftime("%Y-%m-%d %H:%M")
    if isinstance(p_value, date):
        return p_value.strftime("%Y-%m-%d")
    return p_value


def _register_referenced_tables(p_connection, p_query):
    known_table_refs = set()
    for table_ref in set(_TABLE_REF_PATTERN.findall(p_query)):
        schema, table = table_ref.split(".", 1)
        csv_path = resolve_csv_path(schema, table)
        if not os.path.isfile(csv_path):
            continue
        escaped_path = csv_path.replace("'", "''")
        p_connection.execute(
            f'CREATE OR REPLACE VIEW "{table_ref}" AS SELECT * FROM read_csv_auto(\'{escaped_path}\')'
        )
        known_table_refs.add(table_ref)
    return known_table_refs


def _quote_table_refs(p_query, p_known_table_refs):
    def _replace(match):
        table_ref = match.group(1)
        if table_ref in p_known_table_refs:
            return f'"{table_ref}"'
        return table_ref

    return _TABLE_REF_PATTERN.sub(_replace, p_query)


def run_analysis_query(p_query):
    connection = duckdb.connect()
    try:
        known_table_refs = _register_referenced_tables(connection, p_query)
        quoted_query = _quote_table_refs(p_query, known_table_refs)
        result = connection.execute(quoted_query)
        columns = [col[0] for col in result.description]
        rows = result.fetchall()
        return [
            {col: _format_value(value) for col, value in zip(columns, row)}
            for row in rows
        ]
    finally:
        connection.close()
