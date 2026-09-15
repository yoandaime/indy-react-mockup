import os
import re

import duckdb

from config.db import get_source_dir, resolve_csv_path

_FILENAME_PATTERN = re.compile(r"^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.csv$")
_PERIOD_TYPE_MARKERS = ("DATE", "TIMESTAMP", "TIME")


def list_tables():
    source_dir = get_source_dir()
    tables = []
    for filename in sorted(os.listdir(source_dir)):
        match = _FILENAME_PATTERN.match(filename)
        if match:
            tables.append({"schema": match.group(1), "table": match.group(2)})
    return tables


def describe_table(p_table):
    if "." not in p_table:
        raise ValueError(f"Invalid table identifier: {p_table!r} (expected schema.table)")

    schema, table = p_table.split(".", 1)
    csv_path = resolve_csv_path(schema, table)

    if not os.path.isfile(csv_path):
        raise ValueError(f"Table not found: {p_table!r}")

    escaped_path = csv_path.replace("'", "''")
    connection = duckdb.connect()
    try:
        result = connection.execute(
            f"DESCRIBE SELECT * FROM read_csv_auto('{escaped_path}')"
        )
        rows = result.fetchall()
    finally:
        connection.close()

    return [
        {
            "column": row[0],
            "type": row[1],
            "is_period": any(marker in row[1].upper() for marker in _PERIOD_TYPE_MARKERS),
        }
        for row in rows
    ]
