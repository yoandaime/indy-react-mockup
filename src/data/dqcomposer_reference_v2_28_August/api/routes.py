from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.describe import describe_table, list_tables
from core.validator import validate_readonly_query
from core.executor import run_analysis_query
from core.rules import (
    build_rule_query,
    RULE_TYPES,
    GRANULARITIES,
    MISSING_PERIOD_GRANULARITIES,
    CONSISTENCY_KEY_MODES,
    CONSISTENCY_VALUE_AGGREGATIONS,
    DEFAULT_PARTITION_COLUMN,
    DEFAULT_GRANULARITY,
    DEFAULT_LOOKBACK_DAYS,
    DEFAULT_LIMIT,
)

router = APIRouter()


class GenerateRequest(BaseModel):
    table: str
    rule_type: str
    column_names: list[str] = []
    partition_column: str = DEFAULT_PARTITION_COLUMN
    granularity: str = DEFAULT_GRANULARITY
    lookback_days: int = DEFAULT_LOOKBACK_DAYS
    limit: int = DEFAULT_LIMIT
    reference: str = ""
    references: list[str] = []
    insert_time_column: str = ""
    key_columns: list[str] = []
    control_table: str = ""
    control_partition_column: str = ""
    control_key_columns: list[str] = []
    mode: str = "summary"
    metric_column: str = ""
    agg_func: str = "sum"
    control_metric_column: str = ""
    control_column_names: list[str] = []
    mins: list[str] = []
    maxs: list[str] = []
    patterns: list[str] = []
    allowed_values: list[list[str]] = []
    validity_patterns: list[str] = []


class RunRequest(BaseModel):
    query: str


@router.get("/rule-types")
def rule_types():
    return RULE_TYPES


@router.get("/granularities")
def granularities():
    return GRANULARITIES


@router.get("/missing-period-granularities")
def missing_period_granularities():
    return MISSING_PERIOD_GRANULARITIES


@router.get("/consistency-key-modes")
def consistency_key_modes():
    return CONSISTENCY_KEY_MODES


@router.get("/consistency-value-aggregations")
def consistency_value_aggregations():
    return CONSISTENCY_VALUE_AGGREGATIONS


@router.get("/tables")
def tables():
    return list_tables()


@router.get("/describe")
def describe(table: str):
    try:
        return describe_table(table)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate")
def generate(p_request: GenerateRequest):
    try:
        query = build_rule_query(
            p_request.table,
            p_request.rule_type,
            p_request.column_names,
            p_request.partition_column,
            p_request.granularity,
            p_request.lookback_days,
            p_request.limit,
            p_request.reference,
            p_request.references,
            p_request.insert_time_column,
            p_request.key_columns,
            p_request.control_table,
            p_request.control_partition_column,
            p_request.control_key_columns,
            p_request.mode,
            p_request.metric_column,
            p_request.agg_func,
            p_request.control_metric_column,
            p_request.control_column_names,
            p_request.mins,
            p_request.maxs,
            p_request.patterns,
            p_request.allowed_values,
            p_request.validity_patterns,
        )
        return {"query": query}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/run")
def run(p_request: RunRequest):
    try:
        validated_query = validate_readonly_query(p_request.query)
        return run_analysis_query(validated_query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
