import pandas as pd
import numpy as np
from typing import List, Dict, Any
import io

class DataProcessor:
    def __init__(self, df: pd.DataFrame = None):
        self.df = df

    def load_excel(self, file_content: bytes) -> pd.DataFrame:
        excel_file = pd.ExcelFile(io.BytesIO(file_content))
        print(f"Excel sheets found: {excel_file.sheet_names}")
        
        target_sheet = None
        header_row = 0
        max_cols = -1
        
        for sheet_name in excel_file.sheet_names:
            temp_df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None, nrows=20)
            for i, row in temp_df.iterrows():
                row_str = " ".join([str(cell) for cell in row]).lower()
                # Look for distinctive raw data columns
                if (("bill" in row_str and "number" in row_str) or "mã vận đơn" in row_str or "consignee" in row_str.lower()):
                    cols_count = len([c for c in row if pd.notnull(c)])
                    if cols_count > max_cols:
                        max_cols = cols_count
                        target_sheet = sheet_name
                        header_row = i
        
        if not target_sheet:
            target_sheet = excel_file.sheet_names[0]
            header_row = 0
            
        print(f"Selected sheet '{target_sheet}' at row {header_row} with {max_cols} columns")
        
        print(f"Header found on sheet '{target_sheet}' at row {header_row}")
        
        # Re-read with the correct sheet and header
        self.df = pd.read_excel(excel_file, sheet_name=target_sheet, header=header_row)
        self._preprocess()
        return self.df

    def _preprocess(self):
        if self.df is None:
            return

        # Clean column names
        self.df.columns = [
            "".join([c if c.isalnum() else "_" for c in str(col).strip().lower()])
            for col in self.df.columns
        ]
        # Replace multiple underscores with single one and strip
        self.df.columns = [
            "_".join([part for part in str(col).split("_") if part])
            for col in self.df.columns
        ]

        # Handle numeric values
        numeric_cols = ['value', 'quantity', 'price', 'gross_weight', 'import_tax', 'vat', 'the_number_of_cont_cbm']
        for col in numeric_cols:
            if col in self.df.columns:
                if self.df[col].dtype == object:
                    self.df[col] = self.df[col].astype(str).str.replace(',', '').str.replace('%', '').str.strip()
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)

        # Handle dates
        for col in ['etd', 'eta']:
            if col in self.df.columns:
                # Excel serial dates
                try:
                    if pd.to_numeric(self.df[col], errors='coerce').notnull().all():
                        self.df[col] = pd.to_datetime(self.df[col], unit='D', origin='1899-12-30', errors='coerce')
                    else:
                        self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                except:
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')

        # Handle object columns safely
        for col in self.df.columns:
            if self.df[col].dtype == object:
                self.df[col] = self.df[col].fillna("Unknown")
            elif self.df[col].dtype.name.startswith('datetime'):
                self.df[col] = self.df[col].fillna(pd.NaT)
        
        print(f"Processed columns: {self.df.columns.tolist()}")
        print(f"Column types: {self.df.dtypes.to_dict()}")
        print(f"Data preview:\n{self.df.head(3)}")

    def get_total_shipments(self, filters: Dict[str, Any] = None) -> int:
        df_filtered = self._apply_filters(filters)
        print(f"Available columns for shipments: {df_filtered.columns.tolist()}")
        # The column was normalized to lowercase 'bill_number' in _preprocess
        if 'bill_number' in df_filtered.columns:
            # Filter out "Unknown" or empty strings
            valid_bills = df_filtered[
                (df_filtered['bill_number'] != "Unknown") & 
                (df_filtered['bill_number'].astype(str).str.strip() != "")
            ]['bill_number']
            count = int(valid_bills.nunique())
            print(f"Unique bill numbers found: {valid_bills}")
            return count
        print("Column 'bill_number' not found in DataFrame!")
        return 0

    def get_kpis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        
        total_value = df_filtered['value'].sum() if 'value' in df_filtered.columns else 0
        total_shipments = self.get_total_shipments(filters)
        total_shippers = df_filtered['shipper'].nunique() if 'shipper' in df_filtered.columns else 0
        total_weight = df_filtered['gross_weight'].sum() if 'gross_weight' in df_filtered.columns else 0

        return {
            "totalValue": float(total_value) if pd.notnull(total_value) else 0.0,
            "totalShipments": int(total_shipments) if pd.notnull(total_shipments) else 0,
            "totalShippers": int(total_shippers) if pd.notnull(total_shippers) else 0,
            "totalWeight": float(total_weight) if pd.notnull(total_weight) else 0.0
        }

    def get_charts_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        
        charts = {
            "monthlyTrend": [],
            "topShippers": [],
            "originsDistribution": []
        }
        
        if df_filtered.empty:
            return charts
            
        if 'eta' in df_filtered.columns and 'value' in df_filtered.columns:
            try:
                # Ensure eta is datetime for the chart
                temp_df = df_filtered.copy()
                temp_df['eta'] = pd.to_datetime(temp_df['eta'], errors='coerce')
                temp_df = temp_df.dropna(subset=['eta'])
                
                if not temp_df.empty:
                    temp_df['month'] = temp_df['eta'].dt.strftime('%Y-%m')
                    trend = temp_df.groupby('month')['value'].sum().reset_index()
                    # Convert to standard types for JSON
                    charts["monthlyTrend"] = [
                        {
                            "month": str(row['month']), 
                            "value": float(row['value']) if pd.notnull(row['value']) else 0.0
                        }
                        for _, row in trend.iterrows()
                    ]
            except Exception as e:
                print(f"Error processing monthly trend: {e}")

        if 'shipper' in df_filtered.columns and 'value' in df_filtered.columns:
            try:
                top_shippers = df_filtered.groupby('shipper')['value'].sum().sort_values(ascending=False).head(5).reset_index()
                charts["topShippers"] = [
                    {
                        "shipper": str(row['shipper']), 
                        "value": float(row['value']) if pd.notnull(row['value']) else 0.0
                    }
                    for _, row in top_shippers.iterrows()
                ]
            except Exception as e:
                print(f"Error processing top shippers: {e}")
            
        if 'origins' in df_filtered.columns and 'value' in df_filtered.columns:
            try:
                origins = df_filtered.groupby('origins')['value'].sum().sort_values(ascending=False).head(5).reset_index()
                charts["originsDistribution"] = [
                    {
                        "origins": str(row['origins']), 
                        "value": float(row['value']) if pd.notnull(row['value']) else 0.0
                    }
                    for _, row in origins.iterrows()
                ]
            except Exception as e:
                print(f"Error processing origins: {e}")
            
        return charts

    

    def get_table_data(self, filters: Dict[str, Any] = None, limit: int = 2000) -> List[Dict[str, Any]]:
        df_filtered = self._apply_filters(filters)
        # Convert NaN to None for JSON compliance
        return df_filtered.head(limit).replace({np.nan: None}).to_dict('records')

    def get_filter_options(self) -> Dict[str, List[str]]:
        if self.df is None:
            return {}
        
        options = {}
        cols_to_filter = ['shipper', 'origins', 'pod', 'incoterm', 'payment']
        for col in cols_to_filter:
            if col in self.df.columns:
                # Filter out "Unknown"
                vals = self.df[self.df[col] != "Unknown"][col].unique().tolist()
                options[col] = sorted([str(v) for v in vals])
        
        return options

    def _apply_filters(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        if self.df is None:
            return pd.DataFrame()
        
        df_filtered = self.df.copy()
        if not filters:
            return df_filtered

        if 'shipper' in filters and filters['shipper']:
            df_filtered = df_filtered[df_filtered['shipper'].isin(filters['shipper'])]
        
        if 'origins' in filters and filters['origins']:
            df_filtered = df_filtered[df_filtered['origins'].isin(filters['origins'])]

        if 'date_range' in filters and filters['date_range']:
            start_date, end_date = filters['date_range']
            if start_date:
                df_filtered = df_filtered[df_filtered['eta'] >= pd.to_datetime(start_date)]
            if end_date:
                df_filtered = df_filtered[df_filtered['eta'] <= pd.to_datetime(end_date)]

        return df_filtered
