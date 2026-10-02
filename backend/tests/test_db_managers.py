import pandas as pd
from app.db.sqlite_manager import SQLiteManager

def test_sqlite_manager_flow():
    mgr = SQLiteManager(":memory:")
    assert mgr.connect() is True
    
    df = pd.DataFrame({
        "employee_id": [1, 2],
        "name": ["Alice", "Bob"],
        "salary": [70000, 80000]
    })
    
    assert mgr.insert_data("test_emp", df) is True
    
    schema = mgr.get_schema("test_emp")
    assert len(schema["columns"]) == 3
    
    cols, rows = mgr.execute_query("SELECT name, salary FROM test_emp ORDER BY salary DESC")
    assert cols == ["name", "salary"]
    assert len(rows) == 2
    assert rows[0][0] == "Bob"
    
    mgr.disconnect()
