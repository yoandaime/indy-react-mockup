from config.db_postgres import get_connection


def insert_rule_catalog(
    p_dimension,
    p_rules,
    p_column_name,
    p_rule_label,
    p_description,
    p_query_templater,
    p_num,
    p_denom,
    p_rate,
):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO admin.rule_catalog
                        (dimension, rules, column_name, rule_label, description, query_templater, num, denom, rate, is_active, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        p_dimension,
                        p_rules,
                        p_column_name,
                        p_rule_label,
                        p_description,
                        p_query_templater,
                        p_num,
                        p_denom,
                        p_rate,
                        False,
                        "User",
                    ),
                )
                new_id = cur.fetchone()[0]
        return new_id
    finally:
        conn.close()
