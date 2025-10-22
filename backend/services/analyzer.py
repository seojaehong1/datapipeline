import pandas as pd
import os

def analyze_csv(filepath):
    """
    CSV 파일 자동 분석 함수
    """
    # CSV 파일 읽기
    df = pd.read_csv(filepath)
    
    # 기본 정보
    basic_info = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "file_size_mb": round(os.path.getsize(filepath) / (1024 * 1024), 2)
    }
    
    # 각 컬럼 분석
    columns_analysis = []
    
    for col in df.columns:
        col_data = df[col]
        
        # 데이터 타입 판단
        if pd.api.types.is_numeric_dtype(col_data):
            dtype = "numeric"
            stats = {
                "mean": round(float(col_data.mean()), 2) if not col_data.isna().all() else None,
                "median": round(float(col_data.median()), 2) if not col_data.isna().all() else None,
                "min": round(float(col_data.min()), 2) if not col_data.isna().all() else None,
                "max": round(float(col_data.max()), 2) if not col_data.isna().all() else None,
                "std": round(float(col_data.std()), 2) if not col_data.isna().all() else None,
            }
        else:
            dtype = "string"
            stats = {
                "unique_count": int(col_data.nunique()),
                "most_common": str(col_data.mode()[0]) if len(col_data.mode()) > 0 else None
            }
        
        # 결측값 체크
        null_count = int(col_data.isna().sum())
        null_percentage = round((null_count / len(col_data)) * 100, 2)
        
        # 이상치 체크 (숫자형만)
        outlier_count = 0
        outlier_percentage = 0.0
        if dtype == "numeric" and not col_data.isna().all():
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
            outlier_count = int(len(outliers))
            outlier_percentage = round((outlier_count / len(col_data)) * 100, 2)
        
        columns_analysis.append({
            "column_name": col,
            "data_type": dtype,
            "null_count": null_count,
            "null_percentage": null_percentage,
            "outlier_count": outlier_count,
            "outlier_percentage": outlier_percentage,
            "stats": stats
        })
    
    return {
        "basic_info": basic_info,
        "columns": columns_analysis
    }