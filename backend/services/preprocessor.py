import pandas as pd
import os
from datetime import datetime

def preprocess_data(filepath, preprocessing_config):
    """
    데이터 전처리 실행
    """
    # 1. CSV 읽기
    df = pd.read_csv(filepath)
    original_row_count = len(df)
    
    # 2. 전처리 적용
    for column, config in preprocessing_config.items():
        if column not in df.columns:
            continue
        
        # 결측값 처리
        if 'missing' in config:
            df = handle_missing_values(df, column, config['missing'])
        
        # 이상치 처리
        if 'outliers' in config:
            df = handle_outliers(df, column, config['outliers'])
    
    # 3. 남은 NaN 값 처리
    df.fillna(0, inplace=True)
    
    # 4. 처리된 파일 저장 (원본 파일과 같은 디렉토리에)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_dir = os.path.dirname(filepath)
    original_filename = os.path.basename(filepath)
    processed_filename = f"processed_{timestamp}_{original_filename}"
    processed_filepath = os.path.join(original_dir, processed_filename)
    
    # 경로 정규화 (Windows \ → /)
    processed_filepath = os.path.normpath(processed_filepath)
    processed_filepath = processed_filepath.replace('\\', '/')  # ← 추가!
    
    df.to_csv(processed_filepath, index=False)
    
    # 5. 결과 통계
    final_row_count = len(df)
    
    return {
        "status": "success",
        "original_rows": original_row_count,
        "processed_rows": final_row_count,
        "rows_removed": original_row_count - final_row_count,
        "processed_file": processed_filepath,  # / 로 통일
        "preview": df.head(10).to_dict('records')
    }


def handle_missing_values(df, column, method):
    """
    결측값 처리
    """
    if not pd.api.types.is_numeric_dtype(df[column]):
        return df
    
    if method == "mean":
        mean_val = df[column].mean()
        if pd.notna(mean_val):
            df[column].fillna(mean_val, inplace=True)
    elif method == "median":
        median_val = df[column].median()
        if pd.notna(median_val):
            df[column].fillna(median_val, inplace=True)
    elif method == "zero":
        df[column].fillna(0, inplace=True)
    elif method == "remove":
        df.dropna(subset=[column], inplace=True)
    
    return df


def handle_outliers(df, column, method):
    """
    이상치 처리
    """
    if not pd.api.types.is_numeric_dtype(df[column]):
        return df
    
    # IQR 방식으로 이상치 탐지
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    if method == "remove":
        df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
    elif method == "cap":
        df[column] = df[column].clip(lower=lower_bound, upper=upper_bound)
    
    return df