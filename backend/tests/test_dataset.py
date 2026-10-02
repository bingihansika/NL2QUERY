import pytest
from app.services.dataset_service import DatasetService

def test_process_valid_csv():
    csv_content = b"name,salary,department\nJohn,50000,IT\nJane,60000,HR"
    meta = DatasetService.process_file(csv_content, "test.csv")
    assert meta["row_count"] == 2
    assert meta["column_count"] == 3
    assert meta["table_name"] == "test"

def test_invalid_file_format():
    with pytest.raises(ValueError):
        DatasetService.process_file(b"some content", "test.pdf")

def test_empty_dataset():
    with pytest.raises(ValueError):
        DatasetService.process_file(b"name,salary\n", "empty.csv")
