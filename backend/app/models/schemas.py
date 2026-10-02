from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DatasetMetadata(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    column_count: int
    columns: List[Dict[str, str]]  # list of {"name": "col", "type": "INTEGER/TEXT/REAL"}
    sample_rows: List[Dict[str, Any]]

class UploadResponse(BaseModel):
    success: bool
    message: str
    dataset: DatasetMetadata

class ImportRequest(BaseModel):
    dataset_id: str
    database: str = Field(..., description="sqlite, mysql, postgresql, mongodb, neo4j")

class ImportResponse(BaseModel):
    success: bool
    message: str
    database: str
    table_name: str
    schema_info: Dict[str, Any]

class SchemaResponse(BaseModel):
    database: str
    table_name: str
    columns: List[Dict[str, Any]]
    tables: Optional[List[Dict[str, Any]]] = []
    detected_joins: Optional[List[Dict[str, str]]] = []
    schema_formatted: str

class VisualizationConfig(BaseModel):
    type: str = Field(..., description="bar, line, pie, table")
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    title: Optional[str] = None

class QueryRequest(BaseModel):
    prompt: str
    database: str = Field(default="sqlite")
    dataset_id: Optional[str] = None
    table_name: Optional[str] = None

class QueryResponse(BaseModel):
    success: bool
    database: str
    query: str
    query_type: str
    explanation: Optional[str] = None
    columns: List[str]
    rows: List[List[Any]]
    total_records: int
    visualization: VisualizationConfig
    summary: str
    error: Optional[str] = None

class SummaryRequest(BaseModel):
    question: str
    columns: List[str]
    rows: List[List[Any]]

class SummaryResponse(BaseModel):
    summary: str

class AnalyticsResponse(BaseModel):
    total_rows: int
    total_columns: int
    total_tables: int
    null_values_count: int
    distribution: List[Dict[str, Any]]
    proportion: List[Dict[str, Any]]
    trend: List[Dict[str, Any]]
