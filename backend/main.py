from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from typing import List, Optional, Dict, Any
import uuid
import pandas as pd
import numpy as np
from processor import DataProcessor

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
# Temporary in-memory storage + disk persistence
data_store: Dict[str, DataProcessor] = {}
UPLOAD_DIR = "/Users/nguyenthanhhao/Desktop/Projects/Dashboard_Import/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_processor(file_id: str) -> Optional[DataProcessor]:
    # Check memory first
    if file_id in data_store:
        return data_store[file_id]
    
    # Check disk
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pkl")
    if os.path.exists(file_path):
        print(f"Loading {file_id} from disk...")
        df = pd.read_pickle(file_path)
        processor = DataProcessor(df)
        data_store[file_id] = processor
        return processor
    
    return None

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        content = await file.read()
        processor = DataProcessor()
        df = processor.load_excel(content)
        
        file_id = str(uuid.uuid4())
        data_store[file_id] = processor
        
        # Save to disk for persistence
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pkl")
        df.to_pickle(file_path)
        
        # Replace NaN with None for JSON compliance
        preview_data = df.head(5).replace({pd.NA: None, np.nan: None}).to_dict('records')
        
        return jsonable_encoder({
            "fileId": file_id,
            "rowCount": len(df),
            "columns": df.columns.tolist(),
            "preview": preview_data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/dashboard/{file_id}")
async def get_dashboard(file_id: str, shipper: Optional[List[str]] = None, origins: Optional[List[str]] = None):
    processor = get_processor(file_id)
    if not processor:
        raise HTTPException(status_code=404, detail="File session not found.")
    
    filters = {
        "shipper": shipper,
        "origins": origins
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
        import traceback
        error_trace = traceback.format_exc()
        with open("/tmp/backend_debug.log", "a") as f:
            f.write(f"\n--- Error at {pd.Timestamp.now()} ---\n")
            f.write(error_trace)
        print(error_trace)
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")

@app.get("/api/export/{file_id}")
async def export_data(file_id: str, shipper: Optional[List[str]] = None, origins: Optional[List[str]] = None):
    processor = get_processor(file_id)
    if not processor:
        raise HTTPException(status_code=404, detail="File session not found.")
    filters = {
        "shipper": shipper,
        "origins": origins
    }
    
    from fastapi.responses import StreamingResponse
    import io

    df_filtered = processor._apply_filters(filters)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_filtered.to_excel(writer, index=False, sheet_name='Filtered Data')
        
        # Also add summary sheet
        kpis = processor.get_kpis(filters)
        summary_df = pd.DataFrame([kpis])
        summary_df.to_excel(writer, index=False, sheet_name='Summary')

    output.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="import_export_{file_id[:8]}.xlsx"'
    }
    
    return StreamingResponse(
        output, 
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers=headers
    )

@app.get("/api/filters/{file_id}")
async def get_filters(file_id: str):
    processor = get_processor(file_id)
    if not processor:
        raise HTTPException(status_code=404, detail="File session not found.")
    
    return processor.get_filter_options()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
