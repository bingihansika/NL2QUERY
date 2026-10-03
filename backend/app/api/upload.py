from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.models.schemas import UploadResponse, ImportResponse, ImportRequest
from app.services.dataset_service import DatasetService

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload CSV or Excel dataset file."""
    try:
        content = await file.read()
        dataset_meta = DatasetService.process_file(content, file.filename)
        return UploadResponse(
            success=True,
            message=f"Dataset '{file.filename}' processed successfully with {dataset_meta['row_count']} rows.",
            dataset=dataset_meta
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/dataset/import", response_model=ImportResponse)
async def import_dataset(req: ImportRequest):
    """Import dataset into target database."""
    try:
        table_name, schema_info = DatasetService.import_to_db(req.dataset_id, req.database)
        return ImportResponse(
            success=True,
            message=f"Dataset imported into {req.database.upper()} table/collection '{table_name}'.",
            database=req.database,
            table_name=table_name,
            schema_info=schema_info
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import error: {str(e)}")

@router.post("/dataset/clear")
async def clear_datasets():
    """Clear all session datasets."""
    DatasetService.clear_all()
    return {"success": True, "message": "All session datasets cleared."}
