from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.profiling import profile_table, DEFAULT_LOOKBACK_DAYS as PROFILE_DEFAULT_LOOKBACK_DAYS
from core.rules import DEFAULT_GRANULARITY, DEFAULT_LOOKBACK_DAYS, DEFAULT_LIMIT

router = APIRouter()


class ProfileRequest(BaseModel):
    table: str
    partition_column: str
    insert_time_column: str = ""
    uniq_key_columns: list[str] = []
    lookback_days: int = PROFILE_DEFAULT_LOOKBACK_DAYS


@router.get("/defaults")
def defaults():
    return {
        "lookback_days": DEFAULT_LOOKBACK_DAYS,
        "limit": DEFAULT_LIMIT,
        "granularity": DEFAULT_GRANULARITY,
    }


@router.post("/profile")
def profile(p_request: ProfileRequest):
    try:
        return profile_table(
            p_request.table,
            p_request.partition_column,
            p_request.insert_time_column,
            p_request.uniq_key_columns,
            p_request.lookback_days,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
