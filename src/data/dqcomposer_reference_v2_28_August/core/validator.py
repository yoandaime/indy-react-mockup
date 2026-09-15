import re

_ALLOWED_START = re.compile(r"^\s*(select|with)\b", re.IGNORECASE)

_FORBIDDEN_KEYWORDS = [
    "insert", "update", "delete", "drop", "alter", "truncate", "create",
    "rename", "grant", "revoke", "attach", "detach", "copy", "export",
    "import", "install", "load", "pragma", "set",
]
_FORBIDDEN_PATTERN = re.compile(
    r"\b(" + "|".join(_FORBIDDEN_KEYWORDS) + r")\b", re.IGNORECASE
)


def validate_readonly_query(p_query):
    stripped = p_query.strip().rstrip(";")

    if ";" in stripped:
        raise ValueError("Multiple statements are not allowed")

    if not _ALLOWED_START.match(stripped):
        raise ValueError("Query must start with SELECT or WITH")

    match = _FORBIDDEN_PATTERN.search(stripped)
    if match:
        raise ValueError(f"Forbidden keyword detected: {match.group(1).upper()}")

    return stripped
