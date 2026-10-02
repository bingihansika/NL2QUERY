from fastapi import APIRouter
from app.models.schemas import AnalyticsResponse
from app.services.dataset_service import DATASET_STORE

router = APIRouter()

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics_metrics(dataset_id: str = None):
    """Generate analytics dashboard metrics matching screenshot UI."""
    if not DATASET_STORE:
        return AnalyticsResponse(
            total_rows=0,
            total_columns=0,
            total_tables=0,
            null_values_count=0,
            distribution=[],
            proportion=[],
            trend=[]
        )

    ds_list = list(DATASET_STORE.values())
    target_ds = DATASET_STORE.get(dataset_id) if dataset_id else ds_list[0]
    df = target_ds["df"]

    total_rows = len(df)
    total_columns = len(df.columns)
    total_tables = len(DATASET_STORE)
    null_values_count = int(df.isnull().sum().sum())

    # Find categorical column for distribution & proportion
    cat_cols = [col for col in df.columns if df[col].dtype == 'object' or 'name' in col or 'dept' in col or 'company' in col]
    num_cols = [col for col in df.columns if df[col].dtype in ['int64', 'float64']]

    main_cat = cat_cols[0] if cat_cols else (df.columns[0] if len(df.columns) > 0 else "")

    distribution = []
    proportion = []
    trend = []

    if main_cat and main_cat in df.columns:
        counts = df[main_cat].value_counts().head(8).to_dict()
        total_sample = sum(counts.values()) or 1
        
        for name, count in counts.items():
            distribution.append({"category": str(name), "value": int(count)})
            percentage = round((count / total_sample) * 100)
            proportion.append({"name": str(name), "value": int(count), "percentage": f"{percentage}%"})

    if num_cols and main_cat:
        num_col = num_cols[0]
        grouped = df.groupby(main_cat)[num_col].mean().head(8).to_dict()
        for k, v in grouped.items():
            trend.append({"category": str(k), "value": round(float(v), 2)})

    return AnalyticsResponse(
        total_rows=total_rows,
        total_columns=total_columns,
        total_tables=total_tables,
        null_values_count=null_values_count,
        distribution=distribution,
        proportion=proportion,
        trend=trend
    )
