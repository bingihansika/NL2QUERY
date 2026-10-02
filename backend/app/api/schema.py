from fastapi import APIRouter, Query
from app.models.schemas import SchemaResponse
from app.services.schema_service import SchemaService

router = APIRouter()

@router.get("/schema", response_model=SchemaResponse)
async def get_schema(database: str = Query(default="sqlite"), dataset_id: str = Query(default=None)):
    """Retrieve schema for the active dataset and selected database."""
    try:
        schema_data = SchemaService.get_formatted_schema(database, dataset_id)
        return SchemaResponse(
            database=schema_data["database"],
            table_name=schema_data["table_name"],
            columns=schema_data["columns"],
            tables=schema_data.get("tables", []),
            detected_joins=schema_data.get("detected_joins", []),
            schema_formatted=schema_data["schema_formatted"]
        )
    except Exception as e:
        return SchemaResponse(
            database=database,
            table_name="",
            columns=[],
            tables=[],
            detected_joins=[],
            schema_formatted=f"Schema retrieval error: {str(e)}"
        )
