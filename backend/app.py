from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import os
from datetime import datetime
import hashlib

# 우리가 만든 모듈들
from models.requests import PreprocessRequest, ExportRequest
from services.analyzer import analyze_csv
from services.preprocessor import preprocess_data
from services.exporter import export_to_database

# 로그인 요청 모델
class LoginRequest(BaseModel):
    username: str
    password: str

# FastAPI 앱 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 인증 설정
security = HTTPBearer()
ADMIN_TOKEN = "admin123"  # 간단한 관리자 토큰

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return credentials.credentials

# 업로드 폴더 설정 (절대 경로로!)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

print(f"✅ 서버 시작 - UPLOAD_DIR: {UPLOAD_DIR}")


@app.get("/")
def read_root():
    return {"message": "Data Pipeline Builder API 서버가 작동 중입니다!"}

@app.post("/api/login")
async def login(request: LoginRequest):
    """관리자 로그인"""
    if request.username == "admin" and request.password == "admin123":
        return {
            "status": "success",
            "token": ADMIN_TOKEN,
            "message": "로그인 성공"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), token: str = Depends(verify_token)):
    """CSV 파일 업로드 + 자동 분석"""
    try:
        # 1. 파일 저장
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # 경로 정규화
        filepath = os.path.normpath(filepath).replace('\\', '/')
        
        print(f"📁 업로드 파일 저장: {filepath}")
        
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 2. 파일 분석
        analysis_result = analyze_csv(filepath)
        
        return {
            "status": "success",
            "filename": filename,
            "filepath": filepath,  # / 로 통일
            "analysis": analysis_result
        }
        
    except Exception as e:
        print(f"❌ 업로드 에러: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/api/preprocess")
async def preprocess(request: PreprocessRequest, token: str = Depends(verify_token)):
    """데이터 전처리"""
    try:
        # 받은 경로를 다시 정규화
        filepath = request.filepath.replace('/', os.sep)  # OS에 맞게 변환
        
        print(f"🔄 전처리 시작: {filepath}")
        result = preprocess_data(filepath, request.preprocessing_config)
        print(f"✅ 전처리 완료: {result.get('processed_file')}")
        return result
    except Exception as e:
        print(f"❌ 전처리 에러: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/api/export-to-db")
async def export_db(request: ExportRequest, token: str = Depends(verify_token)):
    """DB로 내보내기"""
    try:
        # 받은 경로를 다시 정규화
        filepath = request.filepath.replace('/', os.sep)  # OS에 맞게 변환
        
        print(f"💾 DB 내보내기 시작: {filepath}")
        print(f"   DB 타입: {request.db_config.get('db_type')}")
        print(f"   테이블: {request.table_name}")
        
        result = export_to_database(
            filepath,
            request.db_config,
            request.table_name,
            request.if_exists
        )
        
        print(f"✅ DB 저장 완료!")
        return result
    except Exception as e:
        print(f"❌ DB 저장 에러: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)