from app.services.validation_service import ValidationService

def test_valid_select_query():
    valid, msg = ValidationService.validate_query("SELECT * FROM employees WHERE salary > 50000", "sqlite")
    assert valid is True

def test_dangerous_drop_query():
    valid, msg = ValidationService.validate_query("DROP TABLE employees", "sqlite")
    assert valid is False
    assert "DROP" in msg

def test_dangerous_delete_query():
    valid, msg = ValidationService.validate_query("DELETE FROM employees WHERE id=1", "postgresql")
    assert valid is False

def test_valid_cypher_query():
    valid, msg = ValidationService.validate_query("MATCH (n:Employees) RETURN n", "neo4j")
    assert valid is True

def test_dangerous_cypher_create():
    valid, msg = ValidationService.validate_query("CREATE (n:Employees {name: 'Test'})", "neo4j")
    assert valid is False
