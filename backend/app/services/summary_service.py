from typing import List, Dict, Any

class SummaryService:
    @staticmethod
    def determine_visualization(columns: List[str], rows: List[List[Any]], suggested_type: str = "bar") -> Dict[str, Any]:
        """Automatically analyze result columns & data to format visualization props."""
        if not rows or not columns:
            return {"type": "table", "x_axis": None, "y_axis": None, "title": "No Data"}

        # Identify numeric column for Y-Axis
        numeric_idx = None
        for i, col in enumerate(columns):
            if len(rows) > 0 and isinstance(rows[0][i], (int, float)):
                numeric_idx = i
                break
            elif len(rows) > 0 and isinstance(rows[0][i], str):
                try:
                    float(rows[0][i])
                    numeric_idx = i
                    break
                except ValueError:
                    pass

        if numeric_idx is not None:
            y_col = columns[numeric_idx]
            x_col = next((c for i, c in enumerate(columns) if i != numeric_idx), columns[0])
            chart_type = suggested_type.lower() if suggested_type != "table" else "bar"
            title = f"{y_col.replace('_', ' ').title()} by {x_col.replace('_', ' ').title()}"
            return {
                "type": chart_type,
                "x_axis": x_col,
                "y_axis": y_col,
                "title": title
            }

        return {"type": "table", "x_axis": columns[0], "y_axis": columns[1] if len(columns) > 1 else columns[0], "title": "Data Table"}
