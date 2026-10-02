import sqlite3
from typing import List, Dict, Any, Tuple
import pandas as pd
import os
from app.db.base import DatabaseManager

class SQLiteManager(DatabaseManager):
    def __init__(self, db_path: str = "nl2query_local.db"):
        self.db_path = db_path
        self.conn = None

    def connect(self) -> bool:
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            return True
        except Exception as e:
            print(f"SQLite Connection Error: {e}")
            return False

    def disconnect(self) -> None:
        if self.conn:
            self.conn.close()
            self.conn = None

    def create_schema(self, table_name: str, df: pd.DataFrame) -> bool:
        # SQLite handles table creation automatically in df.to_sql
        return True

    def insert_data(self, table_name: str, df: pd.DataFrame) -> bool:
        try:
            if not self.conn:
                self.connect()
            df.to_sql(table_name, self.conn, if_exists="replace", index=False)
            return True
        except Exception as e:
            print(f"SQLite Insert Data Error: {e}")
            return False

    def get_schema(self, table_name: str) -> Dict[str, Any]:
        if not self.conn:
            self.connect()
        try:
            cursor = self.conn.cursor()
            cursor.execute(f"PRAGMA table_info('{table_name}')")
            columns_info = cursor.fetchall()
            
            columns = []
            for col in columns_info:
                # col format: (cid, name, type, notnull, dflt_value, pk)
                columns.append({
                    "name": col[1],
                    "type": col[2].upper() or "TEXT",
                    "primary_key": bool(col[5])
                })
            
            return {
                "database": "sqlite",
                "table_name": table_name,
                "columns": columns
            }
        except Exception as e:
            print(f"SQLite Get Schema Error: {e}")
            return {"database": "sqlite", "table_name": table_name, "columns": []}

    def execute_query(self, query: str, table_name: str = "") -> Tuple[List[str], List[List[Any]]]:
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute(query)
        
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            formatted_rows = [list(row) for row in rows]
            return columns, formatted_rows
        return [], []
