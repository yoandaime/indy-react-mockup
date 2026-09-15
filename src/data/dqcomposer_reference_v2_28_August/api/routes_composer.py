from fastapi import APIRouter
from pydantic import BaseModel

from core.composer import insert_rule_catalog

router = APIRouter()


class RuleCatalogRequest(BaseModel):
    dimension: str
    rules: str
    column_name: str = ""
    rule_label: str
    description: str = ""
    query_templater: str
    num: str = ""
    denom: str = ""
    rate: str = ""


@router.post("/rule-catalog")
def save_rule_catalog(p_request: RuleCatalogRequest):
    new_id = insert_rule_catalog(
        p_request.dimension,
        p_request.rules,
        p_request.column_name,
        p_request.rule_label,
        p_request.description,
        p_request.query_templater,
        p_request.num,
        p_request.denom,
        p_request.rate,
    )
    return {"id": new_id}
