import json
from typing import List, Dict, Any, Tuple
import pandas as pd

try:
    import pymongo
except ImportError:
    pymongo = None

from app.db.base import DatabaseManager
from app.config import settings

class MongoDBManager(DatabaseManager):
    def __init__(self):
        self.uri = settings.MONGODB_URI
        self.db_name = settings.MONGODB_DATABASE
        self.client = None
        self.db = None

    def connect(self) -> bool:
        if not pymongo:
            print("PyMongo not installed")
            return False
        try:
            self.client = pymongo.MongoClient(self.uri, serverSelectionTimeoutMS=2000)
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            return True
        except Exception as e:
            print(f"MongoDB Connection Warning: {e}")
            return False

    def disconnect(self) -> None:
        if self.client:
            self.client.close()
            self.client = None

    def create_schema(self, table_name: str, df: pd.DataFrame) -> bool:
        return True

    def insert_data(self, table_name: str, df: pd.DataFrame) -> bool:
        try:
            if not self.db:
                if not self.connect():
                    return False
            collection = self.db[table_name]
            collection.delete_many({}) # Clear existing collection for sync
            records = df.to_dict(orient="records")
            if records:
                collection.insert_many(records)
            return True
        except Exception as e:
            print(f"MongoDB Insert Error: {e}")
            return False

    def get_schema(self, table_name: str) -> Dict[str, Any]:
        try:
            if not self.db:
                self.connect()
            collection = self.db[table_name]
            sample_doc = collection.find_one()
            columns = []
            if sample_doc:
                for k, v in sample_doc.items():
                    if k != "_id":
                        dtype = type(v).__name__.upper()
                        columns.append({"name": k, "type": dtype})
            return {
                "database": "mongodb",
                "table_name": table_name,
                "columns": columns
            }
        except Exception as e:
            print(f"MongoDB Schema Error: {e}")
            return {"database": "mongodb", "table_name": table_name, "columns": []}

    def execute_query(self, query: str, table_name: str = "") -> Tuple[List[str], List[List[Any]]]:
        if not self.db:
            if not self.connect():
                raise ConnectionError("Cannot connect to MongoDB instance.")
        
        collection = self.db[table_name]
        query_str = query.strip()
        
        # Parse query string: can be aggregate pipeline JSON array or find query filter JSON object
        results = []
        try:
            parsed = json.loads(query_str)
            if isinstance(parsed, list):
                # Aggregation pipeline
                cursor = collection.aggregate(parsed)
                results = list(cursor)
            elif isinstance(parsed, dict):
                # Find filter query
                cursor = collection.find(parsed)
                results = list(cursor)
        except Exception as e:
            # Fallback text query or empty search
            cursor = collection.find({})
            results = list(cursor)

        if not results:
            return [], []

        # Extract column headers excluding internal _id unless specifically present
        cols = []
        for doc in results:
            for k in doc.keys():
                if k != "_id" and k not in cols:
                    cols.append(k)

        rows = []
        for doc in results:
            row = [doc.get(c, None) for c in cols]
            rows.append(row)

        return cols, rows
