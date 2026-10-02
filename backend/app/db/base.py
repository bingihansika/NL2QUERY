from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
import pandas as pd

class DatabaseManager(ABC):

    @abstractmethod
    def connect(self) -> bool:
        """Establish database connection"""
        pass

    @abstractmethod
    def disconnect(self) -> None:
        """Close database connection"""
        pass

    @abstractmethod
    def create_schema(self, table_name: str, df: pd.DataFrame) -> bool:
        """Create table/collection/node schema from pandas DataFrame"""
        pass

    @abstractmethod
    def insert_data(self, table_name: str, df: pd.DataFrame) -> bool:
        """Insert dataframe records into the database"""
        pass

    @abstractmethod
    def get_schema(self, table_name: str) -> Dict[str, Any]:
        """Retrieve schema dictionary for table/collection/node label"""
        pass

    @abstractmethod
    def execute_query(self, query: str, table_name: str = "") -> Tuple[List[str], List[List[Any]]]:
        """Execute query string and return (column_names, rows)"""
        pass
