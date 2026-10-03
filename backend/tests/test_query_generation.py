import pytest
from app.services.gemini_service import GeminiService
from app.services.dataset_service import DatasetService

def test_top_companies_by_highest_salary_package():
    schema_text = """
Database Type: MYSQL
Table/Collection/Label Name: placements
Columns/Fields:
- placement_id (INTEGER) [PRIMARY KEY]
- student_id (INTEGER) [PRIMARY KEY]
- company_name (TEXT)
- job_role (TEXT)
- salary_package (REAL)
- placement_date (TEXT)
- offer_status (TEXT)
"""
    result = GeminiService._heuristic_fallback_query("mysql", schema_text, "Show top 5 companies by highest salary package")
    assert "COUNT(*)" not in result["query"]
    assert "MAX(" in result["query"] or "ORDER BY" in result["query"]
    assert "salary_package" in result["query"]
    assert "company_name" in result["query"]

def test_gender_female_filter_query():
    schema_text = """
Database Type: MYSQL
Table/Collection/Label Name: student
Columns/Fields:
- student_id (INTEGER) [PRIMARY KEY]
- first_name (TEXT)
- last_name (TEXT)
- gender (TEXT)
- department (TEXT)
"""
    result = GeminiService._heuristic_fallback_query("mysql", schema_text, "give all students whose gender is female")
    assert "WHERE gender = 'Female'" in result["query"]

def test_distinct_department_query():
    schema_text = """
Database Type: MYSQL
Table/Collection/Label Name: student
Columns/Fields:
- student_id (INTEGER) [PRIMARY KEY]
- department (TEXT)
"""
    result = GeminiService._heuristic_fallback_query("mysql", schema_text, "select distinct department")
    assert "SELECT DISTINCT department" in result["query"]
