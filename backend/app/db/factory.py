from app.db.base import DatabaseManager
from app.db.sqlite_manager import SQLiteManager
from app.db.mysql_manager import MySQLManager
from app.db.postgres_manager import PostgreSQLManager
from app.db.mongodb_manager import MongoDBManager
from app.db.neo4j_manager import Neo4jManager

_instances = {}

def get_db_manager(db_type: str = "sqlite") -> DatabaseManager:
    db_type = db_type.lower()
    
    if db_type not in _instances:
        if db_type == "mysql":
            _instances[db_type] = MySQLManager()
        elif db_type in ["postgresql", "postgres"]:
            _instances[db_type] = PostgreSQLManager()
        elif db_type in ["mongodb", "mongo"]:
            _instances[db_type] = MongoDBManager()
        elif db_type in ["neo4j", "cypher"]:
            _instances[db_type] = Neo4jManager()
        else:
            _instances[db_type] = SQLiteManager()

    manager = _instances[db_type]
    
    # Verify connection attempt
    connected = manager.connect()
    if not connected and db_type != "sqlite":
        print(f"Warning: Connection to {db_type} failed. Falling back to built-in SQLite engine for execution.")
        sqlite_mgr = SQLiteManager()
        sqlite_mgr.connect()
        return sqlite_mgr

    return manager
