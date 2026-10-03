import pytest
from app.services.dataset_service import DatasetService
from app.services.schema_service import SchemaService

def test_schema_retrieval_after_upload():
    csv_content = b"student_id,name,cgpa,branch\n101,Alice,8.5,CSE\n102,Bob,9.0,ECE"
    meta = DatasetService.process_file(csv_content, "students.csv")
    ds_id = meta["dataset_id"]
    
    schema_res = SchemaService.get_formatted_schema("sqlite", ds_id)
    assert schema_res["database"] == "sqlite"
    assert schema_res["table_name"] == "students"
    assert len(schema_res["columns"]) == 4
    
    col_names = [c["name"] for c in schema_res["columns"]]
    assert "student_id" in col_names
    assert "cgpa" in col_names
    
    # student_id should be auto-detected as Primary Key
    sid_col = next(c for c in schema_res["columns"] if c["name"] == "student_id")
    assert sid_col["primary_key"] is True
