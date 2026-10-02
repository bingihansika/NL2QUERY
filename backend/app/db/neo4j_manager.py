from typing import List, Dict, Any, Tuple
import pandas as pd

try:
    from neo4j import GraphDatabase
except ImportError:
    GraphDatabase = None

from app.db.base import DatabaseManager
from app.config import settings

class Neo4jManager(DatabaseManager):
    def __init__(self):
        self.uri = settings.NEO4J_URI
        self.user = settings.NEO4J_USER
        self.password = settings.NEO4J_PASSWORD
        self.driver = None

    def connect(self) -> bool:
        if not GraphDatabase:
            print("Neo4j driver not installed")
            return False
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            self.driver.verify_connectivity()
            return True
        except Exception as e:
            print(f"Neo4j Connection Warning: {e}")
            return False

    def disconnect(self) -> None:
        if self.driver:
            self.driver.close()
            self.driver = None

    def create_schema(self, table_name: str, df: pd.DataFrame) -> bool:
        return True

    def insert_data(self, table_name: str, df: pd.DataFrame) -> bool:
        try:
            if not self.driver:
                if not self.connect():
                    return False
            label = table_name.capitalize().replace("_", "")
            records = df.to_dict(orient="records")
            
            with self.driver.session() as session:
                # Delete existing nodes with this label
                session.run(f"MATCH (n:{label}) DETACH DELETE n")
                
                # Insert records as nodes
                for rec in records:
                    session.run(f"CREATE (n:{label} $props)", props=rec)
            return True
        except Exception as e:
            print(f"Neo4j Insert Error: {e}")
            return False

    def get_schema(self, table_name: str) -> Dict[str, Any]:
        try:
            if not self.driver:
                self.connect()
            label = table_name.capitalize().replace("_", "")
            columns = []
            with self.driver.session() as session:
                result = session.run(f"MATCH (n:{label}) RETURN n LIMIT 1")
                record = result.single()
                if record:
                    node = record["n"]
                    for k, v in node.items():
                        columns.append({"name": k, "type": type(v).__name__.upper()})
            return {
                "database": "neo4j",
                "table_name": label,
                "columns": columns
            }
        except Exception as e:
            print(f"Neo4j Schema Error: {e}")
            return {"database": "neo4j", "table_name": table_name, "columns": []}

    def execute_query(self, query: str, table_name: str = "") -> Tuple[List[str], List[List[Any]]]:
        if not self.driver:
            if not self.connect():
                raise ConnectionError("Cannot connect to Neo4j instance.")
        
        with self.driver.session() as session:
            result = session.run(query)
            keys = result.keys()
            rows = []
            for record in result:
                row_vals = []
                for k in keys:
                    val = record[k]
                    # Handle Node object returned by Cypher
                    if hasattr(val, "items"):
                        val = dict(val)
                    row_vals.append(val)
                rows.append(row_vals)
            return keys, rows
