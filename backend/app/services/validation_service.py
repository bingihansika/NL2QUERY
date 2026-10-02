import re
from typing import Tuple

DANGEROUS_SQL_KEYWORDS = [
    r"\bDROP\b", r"\bDELETE\b", r"\bTRUNCATE\b", r"\bALTER\b", 
    r"\bUPDATE\b", r"\bINSERT\b", r"\bCREATE\b", r"\bGRANT\b", r"\bREVOKE\b"
]

DANGEROUS_MONGO_KEYWORDS = [
    r"\$out\b", r"\$merge\b", r"deleteMany", r"deleteOne", 
    r"updateMany", r"updateOne", r"remove", r"drop"
]

DANGEROUS_CYPHER_KEYWORDS = [
    r"\bCREATE\b", r"\bMERGE\b", r"\bDELETE\b", r"\bSET\b", 
    r"\bREMOVE\b", r"\bDETACH\b"
]

class ValidationService:
    @staticmethod
    def validate_query(query: str, db_type: str) -> Tuple[bool, str]:
        """Validate that the query is safe, syntax-appropriate, and read-only."""
        if not query or not query.strip():
            return False, "Query string is empty."

        db_type_clean = db_type.lower()
        query_upper = query.upper()

        if db_type_clean in ["sqlite", "mysql", "postgresql", "postgres"]:
            # Check for forbidden SQL keywords
            for pattern in DANGEROUS_SQL_KEYWORDS:
                if re.search(pattern, query_upper):
                    kw = pattern.replace(r"\b", "")
                    return False, f"Dangerous operation '{kw}' detected. Only read-only SELECT queries are allowed."
            
            if not query_upper.strip().startswith("SELECT") and not query_upper.strip().startswith("WITH"):
                return False, "Invalid SQL query: Query must begin with SELECT or WITH."

        elif db_type_clean == "mongodb":
            for pattern in DANGEROUS_MONGO_KEYWORDS:
                if re.search(pattern, query, re.IGNORECASE):
                    return False, f"Dangerous MongoDB operation detected matching '{pattern}'. Only read-only find/aggregate are allowed."

        elif db_type_clean == "neo4j":
            for pattern in DANGEROUS_CYPHER_KEYWORDS:
                if re.search(pattern, query_upper):
                    kw = pattern.replace(r"\b", "")
                    return False, f"Dangerous Cypher operation '{kw}' detected. Only read-only MATCH/RETURN queries are allowed."
            
            if "MATCH" not in query_upper or "RETURN" not in query_upper:
                return False, "Invalid Cypher query: Query must contain MATCH and RETURN."

        return True, "Query validated successfully."
