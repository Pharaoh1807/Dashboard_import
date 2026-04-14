from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from typing import List, Optional, Dict, Any
import uuid
import pandas as pd
import numpy as np
import os
import io
import motor.motor_asyncio
import certifi
from dotenv import load_dotenv
from processor import DataProcessor
from routers import auth, admin
from auth import get_current_user
from database import db

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# In-memory cache for performance (optional on free tier, help speed up subsequent requests)
data_cache: Dict[str, DataProcessor] = {}

async def get_processor(file_id: str, current_user: dict) -> Optional[DataProcessor]:
    # Check if file exists in our metadata
    file_meta = await db.files.find_one({"_id": file_id})
    if not file_meta:
        return None
        
    # Authorization check
    if not current_user.get("is_approved") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Your account is pending approval by an admin.")

    if file_meta.get("user_id") != current_user["_id"] and current_user.get("role") != "admin":
        return None
        
    # Check cache first
    if file_id in data_cache:
        return data_cache[file_id]
        
    # Fetch from MongoDB
    try:
            
        # Fetch all records for this file
        cursor = db.records.find({"file_id": file_id})
        records = await cursor.to_list(length=1000000) # Support up to 1M rows
        
        if not records:
            return None
            
        df = pd.DataFrame(records)
        # Remove MongoDB specific _id and our file_id link from the internal DF used for calculations
        if '_id' in df.columns: del df['_id']
        if 'file_id' in df.columns: del df['file_id']
        
        processor = DataProcessor(df)
        data_cache[file_id] = processor
        return processor
    except Exception as e:
        print(f"Error loading from MongoDB: {e}")
        return None

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_approved") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Your account is pending approval by an admin.")
        
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        content = await file.read()
        processor = DataProcessor()
        df = processor.load_excel(content)
        
        file_id = str(uuid.uuid4())
        
        # 1. Save metadata
        await db.files.insert_one({
            "_id": file_id,
            "filename": file.filename,
            "rowCount": len(df),
            "uploadedAt": pd.Timestamp.now(),
            "user_id": current_user["_id"]
        })
        
        # 2. Save records to MongoDB
        # Convert df to records and add file_id reference
        records = df.to_dict('records')
        for r in records:
            r['file_id'] = file_id
            # Clean up NaN for MongoDB (it doesn't like them)
            for k, v in r.items():
                if pd.isna(v): r[k] = None
        
        # Batch insert for efficiency
        if records:
            await db.records.insert_many(records)
        
        # Cache the processor
        data_cache[file_id] = processor
        
        # Replace NaN with None for JSON response
        preview_data = df.head(5).replace({pd.NA: None, np.nan: None}).to_dict('records')
        
        return jsonable_encoder({
            "fileId": file_id,
            "rowCount": len(df),
            "columns": df.columns.tolist(),
            "preview": preview_data
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/dashboard/{file_id}")
async def get_dashboard(
    file_id: str, 
    shipper: Optional[List[str]] = Query(None, alias="shipper[]"),
    origins: Optional[List[str]] = Query(None, alias="origins[]"),
    shipper_raw: Optional[List[str]] = Query(None, alias="shipper"),
    origins_raw: Optional[List[str]] = Query(None, alias="origins"),
    date_range: Optional[List[str]] = Query(None, alias="dateRange[]"),
    date_range_raw: Optional[List[str]] = Query(None, alias="dateRange"),
    years: Optional[List[str]] = Query(None, alias="years[]"),
    years_raw: Optional[List[str]] = Query(None, alias="years"),
    current_user: dict = Depends(get_current_user)
):
    processor = await get_processor(file_id, current_user)
    if not processor:
        raise HTTPException(status_code=404, detail="File session-data not found in Database.")
    
    # Merge parameters
    final_shipper = (shipper or []) + (shipper_raw or [])
    final_origins = (origins or []) + (origins_raw or [])
    final_date_range = (date_range or []) + (date_range_raw or [])
    final_years = (years or []) + (years_raw or [])
    
    filters = {
        "shipper": final_shipper if final_shipper else None,
        "origins": final_origins if final_origins else None,
        "date_range": final_date_range if len(final_date_range) == 2 else None,
        "years": final_years if final_years else None
    }
    
    try:
        kpis = processor.get_kpis(filters)
        charts = processor.get_charts_data(filters)
        table = processor.get_table_data(filters)
        
        return jsonable_encoder({
            "kpis": kpis,
            "charts": charts,
            "table": table
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")

@app.get("/api/export/{file_id}")
async def export_data(
    file_id: str, 
    shipper: Optional[List[str]] = Query(None, alias="shipper[]"),
    origins: Optional[List[str]] = Query(None, alias="origins[]"),
    shipper_raw: Optional[List[str]] = Query(None, alias="shipper"),
    origins_raw: Optional[List[str]] = Query(None, alias="origins"),
    date_range: Optional[List[str]] = Query(None, alias="dateRange[]"),
    date_range_raw: Optional[List[str]] = Query(None, alias="dateRange"),
    years: Optional[List[str]] = Query(None, alias="years[]"),
    years_raw: Optional[List[str]] = Query(None, alias="years"),
    current_user: dict = Depends(get_current_user)
):
    processor = await get_processor(file_id, current_user)
    if not processor:
        raise HTTPException(status_code=404, detail="File session not found.")
        
    final_shipper = (shipper or []) + (shipper_raw or [])
    final_origins = (origins or []) + (origins_raw or [])
    final_date_range = (date_range or []) + (date_range_raw or [])
    final_years = (years or []) + (years_raw or [])
    
    filters = {
        "shipper": final_shipper if final_shipper else None,
        "origins": final_origins if final_origins else None,
        "date_range": final_date_range if len(final_date_range) == 2 else None,
        "years": final_years if final_years else None
    }
    
    from fastapi.responses import StreamingResponse

    df_filtered = processor._apply_filters(filters)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_filtered.to_excel(writer, index=False, sheet_name='Filtered Data')
        
        kpis = processor.get_kpis(filters)
        summary_df = pd.DataFrame([kpis])
        summary_df.to_excel(writer, index=False, sheet_name='Summary')

    output.seek(0)
    
    headers = { 'Content-Disposition': f'attachment; filename="import_export_{file_id[:8]}.xlsx"' }
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

@app.get("/api/filters/{file_id}")
async def get_filters(file_id: str, current_user: dict = Depends(get_current_user)):
    processor = await get_processor(file_id, current_user)
    if not processor:
        raise HTTPException(status_code=404, detail="File session not found.")
    return processor.get_filter_options()

if __name__ == "__main__":
    import uvicorn
    # Use environment-defined port for Render.com
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
