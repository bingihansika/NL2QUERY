from typing import List, Dict, Any, Tuple
import pandas as pd
from sqlalchemy import create_engine, inspect, text
from app.db.base import DatabaseManager
from app.config import settings

class PostgreSQLManager(DatabaseManager):
    def __init__(self):
        self.host = settings.POSTGRES_HOST
        self.port = settings.POSTGRES_PORT
        self.user = settings.POSTGRES_USER
        self.password = settings.POSTGRES_PASSWORD
        self.database = settings.POSTGRES_DATABASE
        self.engine = None

    def connect(self) -> bool:
        try:
            connection_url = f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
            self.engine = create_engine(connection_url)
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            print(f"PostgreSQL Connection Warning: {e}")
            return False

    def disconnect(self) -> None:
        if self.engine:
            self.engine.dispose()
            self.engine = None

    def create_schema(self, table_name: str, df: pd.DataFrame) -> bool:
        return True

    def insert_data(self, table_name: str, df: pd.DataFrame) -> bool:
        try:
            if not self.engine:
                if not self.connect():
                    return False
            df.to_sql(table_name, self.engine, if_exists="replace", index=False)
            return True
        except Exception as e:
            print(f"PostgreSQL Insert Error: {e}")
            return False

    def get_schema(self, table_name: str) -> Dict[str, Any]:
        try:
            if not self.engine:
                self.connect()
            inspector = inspect(self.engine)
            columns_raw = inspector.get_columns(table_name)
            columns = []
            for col in columns_raw:
                columns.append({
                    "name": col["name"],
                    "type": str(col["type"]).upper(),
                    "primary_key": col.get("primary_key", False)
                })
            return {
                "database": "postgresql",
                "table_name": table_name,
                "columns": columns
            }
        except Exception as e:
            print(f"PostgreSQL Schema Error: {e}")
            return {"database": "postgresql", "table_name": table_name, "columns": []}

    def execute_query(self, query: str, table_name: str = "") -> Tuple[List[str], List[List[Any]]]:
        if not self.engine:
            self.connect()
        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            columns = list(result.keys())
            rows = [list(row) for row in result.fetchall()]
            return columns, rows
