import pandas as pd
import numpy as np
from typing import List, Dict, Any
import io

class DataProcessor:
    def __init__(self, df: pd.DataFrame = None):
        self.df = df
        if self.df is not None:
            self._preprocess()

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
                if (("bill" in row_str and "number" in row_str) or "mã vận đơn" in row_str or "consignee" in row_str.lower()):
                    cols_count = len([c for c in row if pd.notnull(c)])
                    if cols_count > max_cols:
                        max_cols = cols_count
                        target_sheet = sheet_name
                        header_row = i
        
        if not target_sheet:
            target_sheet = excel_file.sheet_names[0]
            header_row = 0
            
        self.df = pd.read_excel(excel_file, sheet_name=target_sheet, header=header_row)
        self._preprocess()
        return self.df

    def _preprocess(self):
        if self.df is None: return

        # Clean column names
        self.df.columns = ["".join([c if c.isalnum() else "_" for c in str(col).strip().lower()]) for col in self.df.columns]
        self.df.columns = ["_".join([part for part in str(col).split("_") if part]) for col in self.df.columns]

        standard_map = {
            'bill_number': ['bill_number', 'bill_no', 'số_bill', 'so_bill', 'mã_vận_đơn', 'ma_van_don', 'vận_đơn', 'van_don'],
            'value': ['value', 'giá_trị', 'gia_tri', 'thành_tiền', 'thanh_tien', 'total_amount', 'trị_giá'],
            'quantity': ['quantity', 'số_lượng', 'so_luong'],
            'shipper': ['shipper', 'người_gửi', 'nguoi_gui', 'supplier', 'nhà_cung_cấp'],
            'origins': ['origins', 'origin', 'xuất_xứ', 'xuat_xu', 'nước_xuất_xứ'],
            'ngày_đăng_ký': ['ngày_đăng_ký', 'ngay_dang_ky', 'declaration_date', 'ngày_tờ_khai', 'ngay_to_khai'],
            'the_number_of_cont_cbm': ['số_lượng_cont', 'so_luong_cont', 'số_cont', 'so_cont', 'cont_cbm', 'cont', 'cbm']
        }

        rename_dict = {}
        for target, aliases in standard_map.items():
            if target in self.df.columns: continue
            for col in self.df.columns:
                if col in aliases or any(alias in col for alias in aliases):
                    rename_dict[col] = target
                    break
        
        if rename_dict:
            self.df = self.df.rename(columns=rename_dict)

        numeric_cols = ['value', 'quantity', 'price', 'gross_weight', 'import_tax', 'vat', 'the_number_of_cont_cbm']
        for col in numeric_cols:
            if col in self.df.columns:
                if self.df[col].dtype == object:
                    self.df[col] = self.df[col].astype(str).str.replace(',', '').str.replace('%', '').str.strip()
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)

        for col in ['etd', 'eta', 'declaration_date', 'ngày_đăng_ký', 'ngày_tờ_khai']:
            if col in self.df.columns:
                try:
                    if pd.to_numeric(self.df[col], errors='coerce').notnull().all():
                        self.df[col] = pd.to_datetime(self.df[col], unit='D', origin='1899-12-30', errors='coerce')
                    else:
                        self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                except:
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')

        for col in self.df.columns:
            if self.df[col].dtype == object:
                self.df[col] = self.df[col].fillna("Unknown").astype(str).str.strip()
            elif self.df[col].dtype.name.startswith('datetime'):
                self.df[col] = self.df[col].fillna(pd.NaT)

    def _get_valid_bills(self, df: pd.DataFrame) -> pd.DataFrame:
        if 'bill_number' not in df.columns: return pd.DataFrame()
        return df[(df['bill_number'] != "Unknown") & (df['bill_number'].astype(str).str.strip() != "")]

    def get_total_shipments(self, filters: Dict[str, Any] = None) -> int:
        df_filtered = self._apply_filters(filters)
        valid_bills = self._get_valid_bills(df_filtered)
        return int(valid_bills['bill_number'].nunique()) if not valid_bills.empty else 0

    def get_kpis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        
        total_value = df_filtered['value'].sum() if 'value' in df_filtered.columns else 0
        total_shipments = self.get_total_shipments(filters)
        total_shippers = df_filtered['shipper'].nunique() if 'shipper' in df_filtered.columns else 0
        
        total_containers = 0
        if 'the_number_of_cont_cbm' in df_filtered.columns and 'bill_number' in df_filtered.columns:
            valid_df_cont = self._get_valid_bills(df_filtered)
            if not valid_df_cont.empty:
                total_containers = valid_df_cont.groupby('bill_number')['the_number_of_cont_cbm'].max().sum()
        elif 'the_number_of_cont_cbm' in df_filtered.columns:
            total_containers = df_filtered['the_number_of_cont_cbm'].sum()

        return {
            "totalValue": float(total_value) if pd.notnull(total_value) else 0.0,
            "totalShipments": int(total_shipments),
            "totalShippers": int(total_shippers),
            "totalContainers": float(round(total_containers, 2))
        }

    def get_charts_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        if df_filtered.empty:
            return {"monthlyTrend": [], "topShippers": [], "originsDistribution": []}
            
        years_filter = filters.get('years', []) if filters else []
        is_year_filtered = isinstance(years_filter, list) and len(years_filter) == 1
        date_format = '%Y-%m' if is_year_filtered else '%Y'
        date_col = 'ngày_đăng_ký' if 'ngày_đăng_ký' in df_filtered.columns else 'eta'

        return {
            "isYearly": not is_year_filtered,
            "monthlyTrend": self._prepare_volume_trend(df_filtered, date_col, date_format),
            "originsDistribution": self._prepare_origins_distribution(df_filtered),
            **self._prepare_shipper_insights(df_filtered, date_col, date_format)
        }

    def _prepare_volume_trend(self, df: pd.DataFrame, date_col: str, date_format: str) -> List[Dict[str, Any]]:
        if date_col not in df.columns: return []
        try:
            temp_df = df.copy()
            temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
            temp_df = temp_df.dropna(subset=[date_col])
            valid_df = self._get_valid_bills(temp_df)
            if valid_df.empty: return []
            
            valid_df['time_period'] = valid_df[date_col].dt.strftime(date_format)
            trend = valid_df.groupby('time_period')['bill_number'].nunique().reset_index()
            return [{"month": str(row['time_period']), "value": int(row['bill_number'])} for _, row in trend.iterrows()]
        except: return []

    def _prepare_shipper_insights(self, df: pd.DataFrame, date_col: str, date_format: str) -> Dict[str, Any]:
        if 'shipper' not in df.columns: return {}
        res = {}
        try:
            # Top by Value
            val_agg = df.groupby('shipper')['value'].sum().sort_values(ascending=False).head(10).reset_index()
            res["topShippers"] = [{"shipper": str(r['shipper']), "value": float(r['value'])} for _, r in val_agg.iterrows()]

            # Top by Shipments
            valid_df = self._get_valid_bills(df)
            if not valid_df.empty:
                ship_agg = valid_df.groupby('shipper')['bill_number'].nunique().sort_values(ascending=False).head(10).reset_index()
                ship_agg.columns = ['shipper', 'count']
                res["shippersByShipments"] = [{"shipper": str(r['shipper']), "count": int(r['count'])} for _, r in ship_agg.iterrows()]

                # Dynamics (Line Chart)
                top_5 = ship_agg['shipper'].head(5).tolist()
                if top_5:
                    trend_df = valid_df[valid_df['shipper'].isin(top_5)].copy()
                    trend_df[date_col] = pd.to_datetime(trend_df[date_col], errors='coerce')
                    trend_df['time_period'] = trend_df[date_col].dt.strftime(date_format)
                    st_agg = trend_df.groupby(['time_period', 'shipper'])['bill_number'].nunique().reset_index()
                    pivot = st_agg.pivot(index='time_period', columns='shipper', values='bill_number').fillna(0).reset_index()
                    pivot.rename(columns={'time_period': 'month'}, inplace=True)
                    res["shippersTrend"] = pivot.to_dict('records')
                    res["shippersTrendList"] = top_5
        except: pass
        return res

    def _prepare_origins_distribution(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if 'origins' not in df.columns or 'value' not in df.columns: return []
        try:
            origins = df.groupby('origins')['value'].sum().sort_values(ascending=False).head(5).reset_index()
            return [{"origins": str(r['origins']), "value": float(r['value'])} for _, r in origins.iterrows()]
        except: return []

    def get_table_data(self, filters: Dict[str, Any] = None, limit: int = 2000) -> List[Dict[str, Any]]:
        df_filtered = self._apply_filters(filters)
        return df_filtered.head(limit).replace({np.nan: None}).to_dict('records')

    def get_filter_options(self) -> Dict[str, List[str]]:
        if self.df is None: return {}
        options = {}
        for col in ['shipper', 'origins', 'pod', 'incoterm', 'payment']:
            if col in self.df.columns:
                vals = self.df[self.df[col] != "Unknown"][col].unique()
                options[col] = sorted(list(set([str(v).strip() for v in vals if v])))
        
        date_col = 'ngày_đăng_ký' if 'ngày_đăng_ký' in self.df.columns else 'eta'
        if date_col in self.df.columns:
            years = self.df[date_col].dt.year.dropna().unique().astype(int).tolist()
            options['years'] = sorted([str(y) for y in years], reverse=True)
        return options

    def _apply_filters(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        if self.df is None: return pd.DataFrame()
        df = self.df.copy()
        if not filters: return df

        if filters.get('shipper'): df = df[df['shipper'].isin(filters['shipper'])]
        if filters.get('origins'): df = df[df['origins'].isin(filters['origins'])]

        date_col = 'ngày_đăng_ký' if 'ngày_đăng_ký' in df.columns else 'eta'
        if filters.get('years'):
            years_int = [int(y) for y in filters['years']]
            df = df[df[date_col].dt.year.isin(years_int)]
            
        if filters.get('date_range'):
            start, end = filters['date_range']
            if start: df = df[df[date_col] >= pd.to_datetime(start)]
            if end: df = df[df[date_col] <= pd.to_datetime(end)]

        return df
