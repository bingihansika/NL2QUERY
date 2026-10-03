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

# No startup preloading: DATASET_STORE starts empty so schemas & joins depend strictly on user uploads

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
