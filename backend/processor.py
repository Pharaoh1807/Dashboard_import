import pandas as pd
import numpy as np
from typing import List, Dict, Any
import io
import unicodedata

def remove_accents(input_str):
    if not input_str: return input_str
    # Explicitly handle Vietnamese 'đ' and 'Đ' which are not caught by NFKD normalization
    input_str = str(input_str).replace("đ", "d").replace("Đ", "D")
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

class DataProcessor:
    def __init__(self, df: pd.DataFrame = None):
        self.df = df
        self._last_filters_key = None
        self._cached_filtered_df = None
        if self.df is not None:
            self._preprocess()

    def get_sheet_names(self, file_content: bytes) -> List[str]:
        excel_file = pd.ExcelFile(io.BytesIO(file_content), engine='calamine')
        return excel_file.sheet_names

    def load_excel(self, file_content: bytes, sheet_name: str) -> pd.DataFrame:
        """
        Loads a specific sheet from Excel file.
        Assumes row 0 is header and row 1+ is data.
        """
        self.df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet_name, header=0, engine='calamine')
        self._preprocess()
        return self.df

    def _preprocess(self):
        if self.df is None: return

        # Clean column names: remove accents, spaces, and handle casing
        new_cols = []
        for col in self.df.columns:
            clean_col = remove_accents(str(col)).strip().lower()
            clean_col = "".join([c if c.isalnum() else "_" for c in clean_col])
            clean_col = "_".join([part for part in clean_col.split("_") if part])
            new_cols.append(clean_col)
        self.df.columns = new_cols

        standard_map = {
            'bill_number': ['bill_number', 'bill_no', 'so_bill', 'so_van_don', 'ma_van_don', 'van_don'],
            'value': ['value', 'tri_gia_khai_bao_usd', 'gia_tri', 'thanh_tien', 'total_amount', 'tri_gia'],
            'quantity': ['quantity', 'luong', 'so_luong'],
            'shipper': ['shipper', 'nguoi_xuat_khau', 'nguoi_gui', 'supplier', 'nha_cung_cap'],
            'origins': ['origins', 'origin', 'xuat_xu', 'nuoc_xuat_xu'],
            'ngay_dang_ky': ['ngay_dang_ky', 'declaration_date', 'ngay_to_khai'],
            'the_number_of_cont_cbm': ['so_luong_cont', 'so_cont', 'cont_cbm', 'cont', 'cbm', 'sl'],
            'import_tax_vnd': ['import_tax_vnd', 'thue_nhap_khau', 'tien_thue_nhap_khau', 'thue_nk_vnd'],
            'vat_vnd': ['vat_tax_vnd', 'thue_vat', 'tien_thue_gtgt', 'thue_gtgt', 'vat_vnd']
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

        # Drop unnecessary columns aggressively to save RAM and Processing Time
        desired_columns = {
            'bill_number', 'value', 'quantity', 'shipper', 'origins', 
            'ngay_dang_ky', 'the_number_of_cont_cbm',
            'payment', 'customs_dp', 'declaration_number', 
            'description', 'ngay_to_khai', 'price', 
            'gross_weight', 'import_tax_vnd', 'vat_vnd'
        }
        cols_to_keep = [col for col in self.df.columns if col in desired_columns]
        if cols_to_keep:
            self.df = self.df[cols_to_keep]

        numeric_cols_set = {'value', 'quantity', 'price', 'gross_weight', 'import_tax_vnd', 'vat_vnd', 'the_number_of_cont_cbm'}
        date_cols_set = {'etd', 'eta', 'declaration_date', 'ngay_dang_ky', 'ngay_to_khai'}
        standard_cols_set = {'bill_number', 'shipper', 'origins'}

        for col in self.df.columns:
            # 1. String normalization
            if self.df[col].dtype == object:
                self.df[col] = self.df[col].fillna("Unknown").astype(str).str.strip()

            # 2. Numeric parsing
            if col in numeric_cols_set:
                if self.df[col].dtype == object:
                    self.df[col] = self.df[col].str.replace(',', '').str.replace('%', '').str.strip()
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)
                
            # 3. Date parsing
            elif col in date_cols_set:
                if not pd.api.types.is_datetime64_any_dtype(self.df[col]):
                    numeric_dates = pd.to_numeric(self.df[col], errors='coerce')
                    if numeric_dates.notna().all() and len(numeric_dates) > 0:
                        self.df[col] = pd.to_datetime(numeric_dates, unit='D', origin='1899-12-30', errors='coerce').fillna(pd.NaT)
                    else:
                        self.df[col] = pd.to_datetime(self.df[col], errors='coerce').fillna(pd.NaT)
            else:
                # Ensure other non-specified datetime columns are fully complete
                if pd.api.types.is_datetime64_any_dtype(self.df[col]):
                    self.df[col] = self.df[col].fillna(pd.NaT)

            # 4. Uppercase Standard Columns (Bill, Shipper, Origins)
            if col in standard_cols_set:
                self.df[col] = self.df[col].astype(str).str.strip().str.upper()

    def _get_valid_bills(self, df: pd.DataFrame) -> pd.DataFrame:
        if 'bill_number' not in df.columns: return pd.DataFrame()
        valid = df['bill_number'].astype(str).str.strip().str.upper()
        return df[(valid != "UNKNOWN") & (valid != "")]

    def get_total_shipments(self, filters: Dict[str, Any] = None) -> int:
        df_filtered = self._apply_filters(filters)
        valid_bills = self._get_valid_bills(df_filtered)
        return int(valid_bills['bill_number'].nunique()) if not valid_bills.empty else 0

    def get_kpis(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        
        total_value = df_filtered['value'].sum() if 'value' in df_filtered.columns else 0
        total_shippers = df_filtered['shipper'].nunique() if 'shipper' in df_filtered.columns else 0
        total_import_tax = df_filtered['import_tax_vnd'].sum() if 'import_tax_vnd' in df_filtered.columns else 0
        total_vat = df_filtered['vat_vnd'].sum() if 'vat_vnd' in df_filtered.columns else 0
        
        total_shipments = 0
        total_containers = 0
        
        if 'bill_number' in df_filtered.columns:
            valid_bills = self._get_valid_bills(df_filtered)
            if not valid_bills.empty:
                total_shipments = int(valid_bills['bill_number'].nunique())
                if 'the_number_of_cont_cbm' in valid_bills.columns:
                    total_containers = valid_bills.drop_duplicates(subset=['bill_number'])['the_number_of_cont_cbm'].sum()
        elif 'the_number_of_cont_cbm' in df_filtered.columns:
            total_containers = df_filtered['the_number_of_cont_cbm'].sum()

        return {
            "totalValue": float(total_value) if pd.notnull(total_value) else 0.0,
            "totalShipments": total_shipments,
            "totalShippers": int(total_shippers),
            "totalContainers": float(round(total_containers, 2)),
            "totalImportTax": float(total_import_tax) if pd.notnull(total_import_tax) else 0.0,
            "totalVat": float(total_vat) if pd.notnull(total_vat) else 0.0
        }

    def get_charts_data(self, filters: Dict[str, Any] = None, shipper_limit: int = 10, origin_limit: int = 5) -> Dict[str, Any]:
        df_filtered = self._apply_filters(filters)
        if df_filtered.empty:
            return {"monthlyTrend": [], "topShippers": [], "originsDistribution": []}
            
        years_filter = filters.get('years', []) if filters else []
        is_year_filtered = isinstance(years_filter, list) and len(years_filter) == 1
        date_format = '%Y-%m' if is_year_filtered else '%Y'
        date_col = 'ngay_dang_ky' if 'ngay_dang_ky' in df_filtered.columns else 'eta'

        return {
            "isYearly": not is_year_filtered,
            "monthlyTrend": self._prepare_volume_trend(df_filtered, date_col, date_format),
            "originsDistribution": self._prepare_origins_distribution(df_filtered, limit=origin_limit),
            **self._prepare_shipper_insights(df_filtered, date_col, date_format, limit=shipper_limit)
        }

    def _prepare_volume_trend(self, df: pd.DataFrame, date_col: str, date_format: str) -> List[Dict[str, Any]]:
        if date_col not in df.columns: return []
        try:
            valid_df = self._get_valid_bills(df.dropna(subset=[date_col]))
            if valid_df.empty: return []
            
            # Use assigned copy to prevent SettingWithCopyWarning, only on the filtered subset
            trend_df = valid_df.copy()
            trend_df['time_period'] = trend_df[date_col].dt.strftime(date_format)
            trend = trend_df.groupby('time_period')['bill_number'].nunique().reset_index()
            return [{"month": str(row['time_period']), "value": int(row['bill_number'])} for _, row in trend.iterrows()]
        except: return []

    def _prepare_shipper_insights(self, df: pd.DataFrame, date_col: str, date_format: str, limit: int = 10) -> Dict[str, Any]:
        if 'shipper' not in df.columns: return {}
        res = {}
        try:
            # Top by Value
            val_query = df.groupby('shipper')['value'].sum().sort_values(ascending=False)
            if limit: val_query = val_query.head(limit)
            val_agg = val_query.reset_index()
            res["topShippers"] = [{"shipper": str(r['shipper']), "value": float(r['value'])} for _, r in val_agg.iterrows()]

            # Top by Shipments
            valid_df = self._get_valid_bills(df)
            if not valid_df.empty:
                ship_query = valid_df.groupby('shipper')['bill_number'].nunique().sort_values(ascending=False)
                if limit: ship_query = ship_query.head(limit)
                ship_agg = ship_query.reset_index()
                ship_agg.columns = ['shipper', 'count']
                res["shippersByShipments"] = [{"shipper": str(r['shipper']), "count": int(r['count'])} for _, r in ship_agg.iterrows()]

                # Dynamics (Line Chart) - Always limit to 5 for the line chart to keep it readable, but let's make it configurable
                top_5 = ship_agg['shipper'].head(5).tolist()
                if top_5:
                    trend_df = valid_df[valid_df['shipper'].isin(top_5)].copy()
                    trend_df['time_period'] = trend_df[date_col].dt.strftime(date_format)
                    st_agg = trend_df.groupby(['time_period', 'shipper'])['bill_number'].nunique().reset_index()
                    pivot = st_agg.pivot(index='time_period', columns='shipper', values='bill_number').fillna(0).reset_index()
                    pivot.rename(columns={'time_period': 'month'}, inplace=True)
                    res["shippersTrend"] = pivot.to_dict('records')
                    res["shippersTrendList"] = top_5
        except: pass
        return res

    def _prepare_origins_distribution(self, df: pd.DataFrame, limit: int = 5) -> List[Dict[str, Any]]:
        if 'origins' not in df.columns or 'value' not in df.columns: return []
        try:
            origins_query = df.groupby('origins')['value'].sum().sort_values(ascending=False)
            if limit: origins_query = origins_query.head(limit)
            origins = origins_query.reset_index()
            return [{"origins": str(r['origins']), "value": float(r['value'])} for _, r in origins.iterrows()]
        except: return []

    def get_table_data(self, filters: Dict[str, Any] = None, limit: int = 2000) -> List[Dict[str, Any]]:
        df_filtered = self._apply_filters(filters)
        return df_filtered.head(limit).replace({np.nan: None}).to_dict('records')

    def get_filter_options(self, filters: Dict[str, Any] = None) -> Dict[str, List[str]]:
        if self.df is None: return {}
        options = {}
        for col in ['shipper', 'origins', 'pod', 'incoterm', 'payment']:
            if col in self.df.columns:
                temp_filters = {k: v for k, v in (filters or {}).items() if k != col}
                temp_df = self._apply_filters(temp_filters)
                vals = temp_df[temp_df[col] != "UNKNOWN"][col].unique()
                options[col] = sorted(list(set([str(v).strip() for v in vals if v])))
        
        date_col = 'ngay_dang_ky' if 'ngay_dang_ky' in self.df.columns else 'eta'
        if date_col in self.df.columns:
            temp_filters = {k: v for k, v in (filters or {}).items() if k != 'years'}
            temp_df = self._apply_filters(temp_filters)
            years = temp_df[date_col].dt.year.dropna().unique().astype(int).tolist()
            options['years'] = sorted([str(y) for y in years], reverse=True)
        return options

    def _apply_filters(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        if self.df is None: return pd.DataFrame()
        if not filters: return self.df

        import json
        try:
            filters_key = json.dumps(filters, sort_keys=True)
            if self._last_filters_key == filters_key and self._cached_filtered_df is not None:
                return self._cached_filtered_df
        except Exception:
            filters_key = None

        df = self.df
        if filters.get('shipper'): df = df[df['shipper'].isin(filters['shipper'])]
        if filters.get('origins'): df = df[df['origins'].isin(filters['origins'])]

        date_col = 'ngay_dang_ky' if 'ngay_dang_ky' in df.columns else 'eta'
        if filters.get('years'):
            years_int = [int(y) for y in filters['years']]
            df = df[df[date_col].dt.year.isin(years_int)]
            
        if filters.get('date_range'):
            start, end = filters['date_range']
            if start: df = df[df[date_col] >= pd.to_datetime(start)]
            if end: df = df[df[date_col] <= pd.to_datetime(end)]

        if filters_key:
            self._last_filters_key = filters_key
            self._cached_filtered_df = df

        return df
