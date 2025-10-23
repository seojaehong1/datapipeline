# Data Pipeline Management System

CSV 데이터 파일의 자동 분석, 전처리, 데이터베이스 저장을 위한 웹 기반 관리 시스템입니다.

## 🚀 주요 기능

- **관리자 인증 시스템**: JWT 토큰 기반 로그인
- **CSV 파일 업로드**: 드래그 앤 드롭 지원
- **자동 데이터 분석**: 결측값, 이상치, 통계 정보 자동 분석
- **데이터 전처리**: 결측값 및 이상치 처리 옵션 제공
- **다중 데이터베이스 지원**: SQLite, PostgreSQL, MySQL, MongoDB
- **실무용 UI**: 전문적이고 깔끔한 관리자 인터페이스

## 🏗️ 프로젝트 구조

```
data-pipeline-builder/
├── backend/                 # FastAPI 백엔드
│   ├── app.py              # 메인 애플리케이션
│   ├── models/             # 데이터 모델
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── requests.py
│   ├── services/           # 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── analyzer.py     # 데이터 분석
│   │   ├── preprocessor.py # 데이터 전처리
│   │   └── exporter.py     # DB 내보내기
│   ├── utils/              # 유틸리티
│   │   ├── __init__.py
│   │   └── db_connection.py
│   ├── uploads/            # 업로드된 파일 저장소
│   ├── requirements.txt    # Python 의존성
│   └── docker-compose.yml  # Docker 설정
├── frontend/               # React 프론트엔드
│   ├── index.html         # 메인 HTML
│   ├── css/
│   │   └── style.css      # 스타일시트
│   └── js/                # JavaScript 모듈
│       ├── config.js      # 설정
│       ├── api.js         # API 통신
│       ├── main.js        # 메인 로직
│       └── ui.js          # UI 관리
└── README.md
```

## 🛠️ 기술 스택

### Backend
- **FastAPI**: 고성능 웹 프레임워크
- **Pandas**: 데이터 분석 및 처리
- **SQLAlchemy**: ORM 및 데이터베이스 연결
- **Pydantic**: 데이터 검증
- **Uvicorn**: ASGI 서버

### Frontend
- **Vanilla JavaScript**: 순수 JavaScript
- **CSS3**: 모던 스타일링
- **Inter Font**: 타이포그래피

### Database
- **SQLite**: 파일 기반 데이터베이스
- **PostgreSQL**: 관계형 데이터베이스
- **MySQL**: 관계형 데이터베이스
- **MongoDB**: NoSQL 데이터베이스

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd data-pipeline-builder
```

### 2. 백엔드 설정
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. 프론트엔드 실행
```bash
cd frontend
python -m http.server 3000
```

### 4. 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000

## 🔐 로그인 정보

- **사용자명**: `admin`
- **비밀번호**: `admin123`

## 📋 사용 방법

### 1. 로그인
- 관리자 계정으로 로그인

### 2. 파일 업로드
- CSV 파일을 드래그 앤 드롭하거나 클릭하여 선택
- 자동으로 데이터 분석 실행

### 3. 데이터 분석 확인
- 파일 기본 정보 (행 수, 컬럼 수, 파일 크기)
- 컬럼별 상세 분석 (데이터 타입, 결측값, 이상치, 통계)

### 4. 전처리 설정
- 결측값 처리 방법 선택 (평균값, 중앙값, 0, 행 삭제)
- 이상치 처리 방법 선택 (제한, 제거)

### 5. 전처리 실행
- 설정한 옵션에 따라 데이터 전처리 실행
- 결과 미리보기 확인

### 6. 데이터베이스 저장
- 지원 데이터베이스 선택
- 연결 정보 입력
- 테이블명 설정
- 데이터 저장

## 🔧 API 엔드포인트

### 인증
- `POST /api/login` - 관리자 로그인

### 데이터 처리
- `POST /api/upload` - CSV 파일 업로드 및 분석
- `POST /api/preprocess` - 데이터 전처리
- `POST /api/export-to-db` - 데이터베이스 내보내기

## 📊 지원 데이터 형식

- **입력**: CSV 파일 (최대 100MB)
- **출력**: 전처리된 CSV, 데이터베이스 테이블

## 🎨 UI 특징

- **실무용 디자인**: 기업용 색상 스키마
- **반응형 레이아웃**: 모바일 지원
- **직관적 인터페이스**: 단계별 가이드
- **실시간 피드백**: 로딩 상태 및 에러 처리

## 🔒 보안

- JWT 토큰 기반 인증
- 모든 API 엔드포인트 보호
- 로컬 스토리지 토큰 관리

## 📝 라이선스

이 프로젝트는 개인 사용을 위한 것입니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈를 통해 알려주세요.

## 📞 지원

문제가 발생하면 개발자에게 문의하세요.

