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
async def upload_file(
    file: UploadFile = File(...), 
    sheet_name: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_approved") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Your account is pending approval by an admin.")
        
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        content = await file.read()
        processor = DataProcessor()
        
        # If no sheet selected, return the list of sheets
        if not sheet_name:
            sheets = processor.get_sheet_names(content)
            return {"sheets": sheets}
            
        # If sheet selected, process the file
        df = processor.load_excel(content, sheet_name)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The selected sheet is empty or invalid.")

        file_id = str(uuid.uuid4())
        
        # 0. Storage Optimization: Auto-cleanup old files for this user
        old_files_cursor = db.files.find({"user_id": current_user["_id"]})
        old_files = await old_files_cursor.to_list(length=None)
        old_file_ids = [f["_id"] for f in old_files]
        if old_file_ids:
            # Delete physical records
            await db.records.delete_many({"file_id": {"$in": old_file_ids}})
            # Delete file metadata
            await db.files.delete_many({"_id": {"$in": old_file_ids}})
            # Remove from local RAM cache
            for old_id in old_file_ids:
                data_cache.pop(old_id, None)
        
        # 1. Save metadata
        await db.files.insert_one({
            "_id": file_id,
            "filename": file.filename,
            "sheetName": sheet_name,
            "rowCount": len(df),
            "uploadedAt": pd.Timestamp.now(),
            "user_id": current_user["_id"]
        })
        
        # 2. Fast vectorized preparation for MongoDB
        df['file_id'] = file_id
        df = df.replace({pd.NA: None, np.nan: None})
        records = df.to_dict('records')
        
        # Batch insert into MongoDB chunks of 5000 rows
        if records:
            chunk_size = 5000
            for i in range(0, len(records), chunk_size):
                chunk = records[i:i + chunk_size]
                await db.records.insert_many(chunk)
                
        data_cache[file_id] = processor
        preview_data = df.drop(columns=['file_id']).head(5).to_dict('records')
        
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
    
    def clean(vals):
        return [v for v in vals if v and str(v).lower() not in ['null', 'undefined', '']] if vals else None

    filters = {
        "shipper": clean(final_shipper),
        "origins": clean(final_origins),
        "date_range": clean(final_date_range),
        "years": clean(final_years)
    }
    if filters["date_range"] and len(filters["date_range"]) != 2:
        filters["date_range"] = None

    
    from fastapi.responses import StreamingResponse

    # 1. Prepare Filtered Data
    df_filtered = processor._apply_filters(filters)
    
    # 2. Extract analytical data using existing methods - NO LIMITS for Excel export
    kpis = processor.get_kpis(filters)
    charts_data = processor.get_charts_data(filters, shipper_limit=None, origin_limit=None)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Sheet 1: Raw Data
        df_filtered.to_excel(writer, index=False, sheet_name='Filtered Records')
        
        # Sheet 2: KPIs Summary
        pd.DataFrame([kpis]).to_excel(writer, index=False, sheet_name='KPIs Summary')
        
        # Sheet 3: Supplier Dynamics (Trend)
        if "shippersTrend" in charts_data:
            trend_df = pd.DataFrame(charts_data["shippersTrend"])
            trend_df.to_excel(writer, index=False, sheet_name='Supplier Dynamics')
            
        # Sheet 4: Origins Distribution (Pie)
        if "originsDistribution" in charts_data:
            origins_df = pd.DataFrame(charts_data["originsDistribution"])
            origins_df.to_excel(writer, index=False, sheet_name='Origins Distribution')
            
        # Sheet 5: Volume Trend (Bar)
        if "monthlyTrend" in charts_data:
            volume_df = pd.DataFrame(charts_data["monthlyTrend"])
            volume_df.to_excel(writer, index=False, sheet_name='Volume Trend')
            
        # Sheet 6: Top Shippers (By Value)
        top_shippers = pd.DataFrame(charts_data.get("topShippers", []))
        if not top_shippers.empty:
            top_shippers.columns = ['Shipper', 'Total Value (USD)']
            top_shippers.to_excel(writer, index=False, sheet_name='Top Shippers (Value)')
            
        # Sheet 7: Top Shippers (By Shipments)
        top_by_shipments = pd.DataFrame(charts_data.get("shippersByShipments", []))
        if not top_by_shipments.empty:
            top_by_shipments.columns = ['Shipper', 'Shipment Count']
            top_by_shipments.to_excel(writer, index=False, sheet_name='Top Shippers (Count)')

    output.seek(0)
    
    filename = f"analytics_export_{file_id[:8]}.xlsx"
    headers = { 'Content-Disposition': f'attachment; filename="{filename}"' }
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

@app.get("/api/filters/{file_id}")
async def get_filters(
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
    
    return processor.get_filter_options(filters)

if __name__ == "__main__":
    import uvicorn
    # Use environment-defined port for Render.com
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
