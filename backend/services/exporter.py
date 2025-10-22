import pandas as pd
import os
from sqlalchemy import create_engine
from pymongo import MongoClient

# 절대 경로로 설정
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")

def export_to_database(filepath, db_config, table_name, if_exists="replace"):
    """
    전처리된 CSV를 DB로 내보내기
    """
    # 1. CSV 읽기
    df = pd.read_csv(filepath)
    
    # 2. DB 타입 확인
    db_type = db_config.get('db_type', 'sqlite')
    
    # MongoDB는 별도 처리
    if db_type == 'mongodb':
        return export_to_mongodb(df, db_config, table_name, if_exists)
    
    # SQL 계열 DB 처리
    return export_to_sql(df, db_config, table_name, if_exists, db_type)


def export_to_sql(df, db_config, table_name, if_exists, db_type):
    """SQL 계열 DB로 내보내기"""
    
    if db_type == 'sqlite':
        db_name = db_config.get('database', 'data.db')
        db_path = os.path.join(UPLOAD_DIR, db_name)
        conn_string = f"sqlite:///{db_path}"
        db_file_path = db_path
        
    elif db_type == 'postgresql':
        conn_string = (
            f"postgresql://{db_config['username']}:{db_config['password']}"
            f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
        )
        db_file_path = None
        
    elif db_type == 'mysql':
        conn_string = (
            f"mysql+pymysql://{db_config['username']}:{db_config['password']}"
            f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            f"?charset=utf8mb4&use_unicode=1"  # ← 수정!
    )
        db_file_path = None
        
    else:
        raise ValueError(f"지원하지 않는 DB 타입: {db_type}")
    
    # SQLAlchemy 엔진 생성
    engine = create_engine(conn_string)
    
    # 데이터 내보내기
    df.to_sql(
        name=table_name,
        con=engine,
        if_exists=if_exists,
        index=False
    )
    
    return {
        "status": "success",
        "message": f"테이블 '{table_name}'에 {len(df)}개 행이 저장되었습니다!",
        "db_type": db_type,
        "table_name": table_name,
        "rows_exported": len(df),
        "columns": list(df.columns),
        "db_file": db_file_path
    }


def export_to_mongodb(df, db_config, collection_name, if_exists):
    """MongoDB로 내보내기"""
    
    # MongoDB 연결
    host = db_config.get('host', 'localhost')
    port = db_config.get('port', 27017)
    username = db_config.get('username', 'admin')
    password = db_config.get('password', 'password')
    database = db_config.get('database', 'test_db')
    
    # 연결 문자열 생성
    if username and password:
        conn_string = f"mongodb://{username}:{password}@{host}:{port}/"
    else:
        conn_string = f"mongodb://{host}:{port}/"
    
    # MongoDB 클라이언트 생성
    client = MongoClient(conn_string)
    db = client[database]
    collection = db[collection_name]
    
    # 기존 데이터 처리
    if if_exists == "replace":
        collection.drop()
    elif if_exists == "fail" and collection.count_documents({}) > 0:
        raise ValueError(f"Collection '{collection_name}' already exists")
    
    # DataFrame을 딕셔너리 리스트로 변환
    records = df.to_dict('records')
    
    # MongoDB에 삽입
    if records:
        collection.insert_many(records)
    
    return {
        "status": "success",
        "message": f"Collection '{collection_name}'에 {len(records)}개 문서가 저장되었습니다!",
        "db_type": "mongodb",
        "collection_name": collection_name,
        "rows_exported": len(records),
        "columns": list(df.columns),
        "db_file": None
    }