from typing import List, Dict, Any

class SummaryService:
    @staticmethod
    def determine_visualization(columns: List[str], rows: List[List[Any]], suggested_type: str = "bar") -> Dict[str, Any]:
        """Automatically analyze result columns & data to format visualization props."""
        if not rows or not columns:
            return {"type": "table", "x_axis": None, "y_axis": None, "title": "No Data"}

        if len(columns) == 1:
            return {"type": "table", "x_axis": columns[0], "y_axis": None, "title": f"List of {columns[0]}"}

        x_col = columns[0]
        y_col = columns[1]

        # Check if second column is numeric
        is_numeric = False
        try:
            if len(rows) > 0 and isinstance(rows[0][1], (int, float)):
                is_numeric = True
        except Exception:
            is_numeric = False

        chart_type = suggested_type.lower()
        if not is_numeric:
            chart_type = "table"

        # Check for time-based x-axis
        if is_numeric and any(kw in x_col.lower() for kw in ["date", "time", "year", "month", "day"]):
            chart_type = "line"

        title = f"{y_col.replace('_', ' ').title()} by {x_col.replace('_', ' ').title()}"

        return {
            "type": chart_type,
            "x_axis": x_col,
            "y_axis": y_col,
            "title": title
        }
