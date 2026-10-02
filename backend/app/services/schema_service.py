from typing import Dict, Any, List
from app.db.factory import get_db_manager
from app.services.dataset_service import DATASET_STORE

class SchemaService:
    @staticmethod
    def get_formatted_schema(db_type: str, dataset_id: str = None) -> Dict[str, Any]:
        """Retrieve schema info across all uploaded tables or specified dataset and detect joins."""
        tables_schema = []
        all_tables_cols = {}

        # Collect schemas for all active datasets
        datasets_to_process = []
        if dataset_id and dataset_id in DATASET_STORE:
            datasets_to_process = [DATASET_STORE[dataset_id]]
        else:
            datasets_to_process = list(DATASET_STORE.values())

        db_mgr = get_db_manager(db_type)

        schema_text_parts = []
        active_table_name = ""

        for ds in datasets_to_process:
            table_name = ds["table_name"]
            active_table_name = table_name
            schema_info = db_mgr.get_schema(table_name)

            formatted_cols = []
            for idx, c in enumerate(columns):
                c_name = c.get("name", "")
                is_pk = c.get("primary_key", False)
                if not is_pk and (c_name.endswith("_id") or c_name == "id" or (idx == 0 and ("id" in c_name or "code" in c_name))):
                    is_pk = True
                formatted_cols.append({
                    "name": c_name,
                    "type": c.get("type", "TEXT"),
                    "primary_key": is_pk
                })

            all_tables_cols[table_name] = formatted_cols

            col_descriptions = [f"- {c['name']} ({c['type']})" + (" [PRIMARY KEY]" if c['primary_key'] else "") for c in formatted_cols]
            schema_text_parts.append(
                f"Database Type: {db_type.upper()}\n"
                f"Table/Collection/Label Name: {table_name}\n"
                f"Columns/Fields:\n" + "\n".join(col_descriptions)
            )

            tables_schema.append({
                "table_name": table_name,
                "columns": formatted_cols,
                "row_count": ds.get("row_count", 0)
            })

        # Detect potential Joins across loaded datasets (matching DETECTED JOINS section in screenshot)
        detected_joins = SchemaService._detect_joins(all_tables_cols)

        formatted_string = "\n\n".join(schema_text_parts)
        if detected_joins:
            join_str = "\n".join([f"- Join on '{j['column']}': {j['table1']} <-> {j['table2']}" for j in detected_joins])
            formatted_string += f"\n\nDetected Relationships / Potential Joins:\n{join_str}"

        return {
            "database": db_type,
            "table_name": active_table_name,
            "columns": tables_schema[0]["columns"] if tables_schema else [],
            "tables": tables_schema,
            "detected_joins": detected_joins,
            "schema_formatted": formatted_string
        }

    @staticmethod
    def _detect_joins(all_tables_cols: Dict[str, List[Dict[str, str]]]) -> List[Dict[str, str]]:
        joins = []
        tables = list(all_tables_cols.keys())
        for i in range(len(tables)):
            for j in range(i + 1, len(tables)):
                t1, t2 = tables[i], tables[j]
                cols1 = {c["name"] for c in all_tables_cols[t1]}
                cols2 = {c["name"] for c in all_tables_cols[t2]}
                common = cols1.intersection(cols2)
                for col in common:
                    if col.endswith("_id") or col in ["id", "code", "department", "company_name"]:
                        joins.append({
                            "table1": t1,
                            "table2": t2,
                            "column": col
                        })
        return joins
