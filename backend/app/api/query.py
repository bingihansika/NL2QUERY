from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse, SummaryRequest, SummaryResponse
from app.services.schema_service import SchemaService
from app.services.gemini_service import GeminiService
from app.services.validation_service import ValidationService
from app.services.summary_service import SummaryService
from app.db.factory import get_db_manager

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def process_natural_language_query(req: QueryRequest):
    """
    Main Natural Language Query Workflow:
    1. Schema Retrieval
    2. AI Query Generation (Gemini)
    3. Query Validation
    4. Query Execution
    5. Result Processing & Visualization Config
    6. AI Summary Generation
    """
    try:
        # Step 1: Retrieve Schema
        schema_data = SchemaService.get_formatted_schema(req.database, req.dataset_id)
        schema_text = schema_data["schema_formatted"]
        table_name = schema_data["table_name"]

        # Step 2: AI Query Generation
        ai_result = await GeminiService.generate_query(req.database, schema_text, req.prompt)
        generated_query = ai_result["query"]
        query_type = ai_result["query_type"]
        explanation = ai_result["explanation"]
        suggested_viz = ai_result.get("required_visualization", "bar")

        # Step 3: Query Validation
        is_valid, val_msg = ValidationService.validate_query(generated_query, req.database)
        if not is_valid:
            # Simple retry loop with correction instruction
            correction_prompt = f"{req.prompt} (Note: previous query attempt '{generated_query}' failed validation: {val_msg})"
            ai_result = await GeminiService.generate_query(req.database, schema_text, correction_prompt)
            generated_query = ai_result["query"]
            is_valid, val_msg = ValidationService.validate_query(generated_query, req.database)
            if not is_valid:
                return QueryResponse(
                    success=False,
                    database=req.database,
                    query=generated_query,
                    query_type=query_type,
                    explanation=f"Validation failed: {val_msg}",
                    columns=[],
                    rows=[],
                    total_records=0,
                    visualization={"type": "table", "x_axis": None, "y_axis": None, "title": "Error"},
                    summary=f"Query validation error: {val_msg}",
                    error=val_msg
                )

        # Step 4: Execute Query
        db_mgr = get_db_manager(req.database)
        try:
            columns, rows = db_mgr.execute_query(generated_query, table_name)
        except Exception as exec_err:
            return QueryResponse(
                success=False,
                database=req.database,
                query=generated_query,
                query_type=query_type,
                explanation=f"Execution error: {str(exec_err)}",
                columns=[],
                rows=[],
                total_records=0,
                visualization={"type": "table", "x_axis": None, "y_axis": None, "title": "Execution Error"},
                summary=f"Database execution error: {str(exec_err)}",
                error=str(exec_err)
            )

        # Step 5: Process Visualization
        viz_config = SummaryService.determine_visualization(columns, rows, suggested_viz)

        # Step 6: Generate AI Summary
        summary = await GeminiService.generate_summary(req.prompt, columns, rows)

        return QueryResponse(
            success=True,
            database=req.database,
            query=generated_query,
            query_type=query_type,
            explanation=explanation,
            columns=columns,
            rows=rows,
            total_records=len(rows),
            visualization=viz_config,
            summary=summary,
            error=None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query/generate")
async def generate_query_only(req: QueryRequest):
    schema_data = SchemaService.get_formatted_schema(req.database, req.dataset_id)
    return await GeminiService.generate_query(req.database, schema_data["schema_formatted"], req.prompt)

@router.post("/query/validate")
async def validate_query_only(query: str, database: str):
    is_valid, msg = ValidationService.validate_query(query, database)
    return {"valid": is_valid, "message": msg}

@router.post("/query/execute")
async def execute_query_only(query: str, database: str, table_name: str = ""):
    is_valid, msg = ValidationService.validate_query(query, database)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    db_mgr = get_db_manager(database)
    cols, rows = db_mgr.execute_query(query, table_name)
    return {"columns": cols, "rows": rows, "count": len(rows)}

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary_only(req: SummaryRequest):
    summary = await GeminiService.generate_summary(req.question, req.columns, req.rows)
    return SummaryResponse(summary=summary)
