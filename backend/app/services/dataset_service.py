import os
import uuid
import re
import pandas as pd
from typing import Dict, Any, Tuple
from app.db.factory import get_db_manager

# In-memory session dataset storage
DATASET_STORE: Dict[str, Dict[str, Any]] = {}

class DatasetService:
    @staticmethod
    def process_file(file_content: bytes, filename: str) -> Dict[str, Any]:
        """Validate, read, clean, and store dataset file."""
        if not filename:
            raise ValueError("Invalid file name")

        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".csv", ".xlsx", ".xls"]:
            raise ValueError(f"Unsupported file format '{ext}'. Please upload CSV or Excel (.xlsx/.xls).")

        try:
            if ext == ".csv":
                df = pd.read_csv(pd.io.common.BytesIO(file_content))
            else:
                df = pd.read_excel(pd.io.common.BytesIO(file_content))
        except Exception as e:
            raise ValueError(f"Failed to parse dataset file: {str(e)}")

        if df.empty:
            raise ValueError("The uploaded dataset is empty.")

        # Clean column names
        cleaned_columns = []
        for col in df.columns:
            clean_col = str(col).strip().lower()
            clean_col = re.sub(r"[^\w\s]", "", clean_col)
            clean_col = re.sub(r"\s+", "_", clean_col)
            if not clean_col or clean_col[0].isdigit():
                clean_col = f"col_{clean_col}"
            cleaned_columns.append(clean_col)
        df.columns = cleaned_columns

        # Handle missing values safely
        df = df.fillna(value=None)
        df = df.where(pd.notnull(df), None)

        # Detect data types
        col_types = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            if "int" in dtype:
                sql_type = "INTEGER"
            elif "float" in dtype:
                sql_type = "REAL"
            elif "datetime" in dtype:
                sql_type = "TIMESTAMP"
            else:
                sql_type = "TEXT"
            col_types.append({"name": col, "type": sql_type})

        dataset_id = str(uuid.uuid4())[:8]
        table_name = os.path.splitext(filename)[0].strip().lower()
        table_name = re.sub(r"[^\w]", "_", table_name)
        if not table_name:
            table_name = f"dataset_{dataset_id}"

        # Store in memory
        DATASET_STORE[dataset_id] = {
            "dataset_id": dataset_id,
            "filename": filename,
            "table_name": table_name,
            "df": df,
            "columns": col_types,
            "row_count": len(df),
            "column_count": len(df.columns)
        }

        # Automatically store in SQLite built-in db for instant local execution
        sqlite_mgr = get_db_manager("sqlite")
        sqlite_mgr.insert_data(table_name, df)

        sample_rows = df.head(10).to_dict(orient="records")

        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "table_name": table_name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": col_types,
            "sample_rows": sample_rows
        }

    @staticmethod
    def get_dataset(dataset_id: str) -> Dict[str, Any]:
        if dataset_id not in DATASET_STORE:
            # Fallback to the most recent dataset if dataset_id missing
            if DATASET_STORE:
                return list(DATASET_STORE.values())[-1]
            raise KeyError(f"Dataset with ID '{dataset_id}' not found.")
        return DATASET_STORE[dataset_id]

    @staticmethod
    def import_to_db(dataset_id: str, db_type: str) -> Tuple[str, Dict[str, Any]]:
        dataset = DatasetService.get_dataset(dataset_id)
        table_name = dataset["table_name"]
        df = dataset["df"]

        db_mgr = get_db_manager(db_type)
        db_mgr.insert_data(table_name, df)
        schema_info = db_mgr.get_schema(table_name)

        return table_name, schema_info
