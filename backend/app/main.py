import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload_router, schema_router, query_router, analytics_router
from app.services.dataset_service import DatasetService

app = FastAPI(
    title="NL2Query: AI-Assisted Natural Language Querying",
    description="Academic Project AI Web Application for natural language querying across MySQL, PostgreSQL, MongoDB, Neo4j, and SQLite.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(schema_router, prefix="/api", tags=["Schema"])
app.include_router(query_router, prefix="/api", tags=["Query"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "app": "NL2Query Engine",
        "version": "1.0.0"
    }

@app.on_event("startup")
async def preload_sample_datasets():
    """Auto-load sample datasets on startup if available."""
    sample_dir = os.path.join(os.path.dirname(__file__), "..", "sample_data")
    if os.path.exists(sample_dir):
        for fname in ["placements.csv", "student.csv", "employees.csv"]:
            fpath = os.path.join(sample_dir, fname)
            if os.path.exists(fpath):
                try:
                    with open(fpath, "rb") as f:
                        content = f.read()
                        DatasetService.process_file(content, fname)
                        print(f"Preloaded sample dataset: {fname}")
                except Exception as e:
                    print(f"Sample dataset load warning ({fname}): {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
