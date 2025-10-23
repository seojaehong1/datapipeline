# 코드 상세 설명

이 문서는 Data Pipeline Management System의 코드 구조와 동작 방식을 자세히 설명합니다.

## 📁 프로젝트 아키텍처

### 전체 구조
```
Frontend (JavaScript) ←→ Backend (FastAPI) ←→ Database
     ↓                        ↓
  UI/UX Layer          Business Logic Layer
```

## 🔧 백엔드 코드 분석

### 1. app.py - 메인 애플리케이션

```python
# 핵심 기능
- FastAPI 애플리케이션 초기화
- CORS 설정 (크로스 오리진 요청 허용)
- JWT 토큰 기반 인증 시스템
- API 엔드포인트 정의
```

**주요 함수:**
- `verify_token()`: JWT 토큰 검증
- `login()`: 관리자 로그인 처리
- `upload_file()`: CSV 파일 업로드 및 분석
- `preprocess()`: 데이터 전처리 실행
- `export_db()`: 데이터베이스 내보내기

**인증 시스템:**
```python
# 간단한 토큰 기반 인증
ADMIN_TOKEN = "admin123"
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return credentials.credentials
```

### 2. services/analyzer.py - 데이터 분석

```python
def analyze_csv(filepath):
    """
    CSV 파일을 분석하여 다음 정보를 제공:
    - 기본 정보 (행 수, 컬럼 수, 파일 크기)
    - 컬럼별 상세 분석 (데이터 타입, 결측값, 이상치, 통계)
    """
```

**분석 과정:**
1. **파일 읽기**: `pd.read_csv(filepath)`
2. **기본 정보 수집**: 행/컬럼 수, 파일 크기
3. **컬럼별 분석**:
   - 데이터 타입 판단 (숫자형/문자형)
   - 결측값 개수 및 비율
   - 이상치 탐지 (IQR 방법)
   - 통계 정보 (평균, 중앙값, 표준편차 등)

**이상치 탐지 알고리즘:**
```python
# IQR (Interquartile Range) 방법
Q1 = col_data.quantile(0.25)
Q3 = col_data.quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
```

### 3. services/preprocessor.py - 데이터 전처리

```python
def preprocess_data(filepath, preprocessing_config):
    """
    사용자 설정에 따라 데이터 전처리 실행
    """
```

**전처리 옵션:**

**결측값 처리:**
- `mean`: 평균값으로 대체
- `median`: 중앙값으로 대체
- `zero`: 0으로 대체
- `remove`: 해당 행 삭제

**이상치 처리:**
- `cap`: 이상치를 경계값으로 제한
- `remove`: 이상치가 있는 행 삭제

**처리 과정:**
1. 원본 CSV 파일 읽기
2. 사용자 설정에 따라 컬럼별 전처리 적용
3. 남은 NaN 값을 0으로 대체
4. 전처리된 파일 저장 (타임스탬프 포함)
5. 처리 결과 통계 반환

### 4. services/exporter.py - 데이터베이스 내보내기

```python
def export_to_database(filepath, db_config, table_name, if_exists="replace"):
    """
    전처리된 CSV를 다양한 데이터베이스에 저장
    """
```

**지원 데이터베이스:**
- **SQLite**: 파일 기반, 로컬 저장
- **PostgreSQL**: 관계형 데이터베이스
- **MySQL**: 관계형 데이터베이스
- **MongoDB**: NoSQL 문서 데이터베이스

**연결 문자열 생성:**
```python
# SQLite
conn_string = f"sqlite:///{db_path}"

# PostgreSQL
conn_string = f"postgresql://{username}:{password}@{host}:{port}/{database}"

# MySQL
conn_string = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}?charset=utf8mb4"

# MongoDB
conn_string = f"mongodb://{username}:{password}@{host}:{port}/"
```

## 🎨 프론트엔드 코드 분석

### 1. index.html - 메인 구조

**HTML 구조:**
```html
<!-- 로그인 화면 -->
<div id="loginScreen" class="login-container">
    <!-- 로그인 폼 -->
</div>

<!-- 메인 애플리케이션 -->
<div id="mainApp" class="main-app hidden">
    <!-- 헤더 -->
    <!-- 파일 업로드 -->
    <!-- 분석 결과 -->
    <!-- 전처리 설정 -->
    <!-- 결과 -->
    <!-- DB 설정 -->
</div>
```

**주요 특징:**
- 단일 페이지 애플리케이션 (SPA)
- 로그인 화면과 메인 앱 분리
- 카드 기반 레이아웃
- SVG 아이콘 사용

### 2. main.js - 메인 로직

```javascript
// 전역 변수 관리
window.uploadedFilePath = null;
window.analysisData = null;
window.currentProcessedFile = null;
```

**주요 함수:**

**인증 관련:**
- `handleLogin()`: 로그인 처리
- `handleLogout()`: 로그아웃 처리
- `showLoginScreen()`: 로그인 화면 표시
- `showMainApp()`: 메인 앱 표시

**파일 처리:**
- `handleFileUpload()`: 파일 업로드 처리
- `handlePreprocess()`: 전처리 실행
- `exportToDb()`: 데이터베이스 내보내기

**이벤트 관리:**
```javascript
function initializeEventListeners() {
    // 로그인 폼 이벤트
    // 파일 업로드 이벤트 (드래그 앤 드롭)
    // 전처리 버튼 이벤트
}
```

### 3. api.js - API 통신

```javascript
// API 호출 함수들
async function login(username, password)
async function uploadFileToServer(file)
async function preprocessData(filepath, config)
async function exportToDatabase(filepath, dbConfig, tableName, ifExists)

// 인증 토큰 관리
function getAuthToken()
function setAuthToken(token)
function clearAuthToken()
function isAuthenticated()
```

**API 호출 패턴:**
```javascript
const response = await fetch(`${API_URL}/api/endpoint`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
});
```

### 4. ui.js - UI 관리

**주요 함수:**
- `showAnalysis()`: 분석 결과 표시
- `showPreprocessControls()`: 전처리 설정 UI 생성
- `showResult()`: 전처리 결과 표시
- `generatePreviewTable()`: 데이터 미리보기 테이블 생성

**동적 UI 생성:**
```javascript
// 전처리 컨트롤 동적 생성
function showPreprocessControls(columns) {
    columns.forEach(col => {
        if (col.null_count > 0 || col.outlier_count > 0) {
            // 결측값 처리 옵션 생성
            // 이상치 처리 옵션 생성
        }
    });
}
```

### 5. style.css - 스타일링

**디자인 시스템:**
- **색상**: 회색/파란색 계열 (기업용)
- **폰트**: Inter (모던 타이포그래피)
- **레이아웃**: 카드 기반, 그리드 시스템
- **반응형**: 모바일 지원

**주요 CSS 클래스:**
```css
.login-container     /* 로그인 화면 */
.main-app           /* 메인 애플리케이션 */
.card               /* 카드 컴포넌트 */
.btn-primary        /* 주요 버튼 */
.btn-secondary      /* 보조 버튼 */
.info-grid          /* 정보 그리드 */
.upload-area        /* 파일 업로드 영역 */
```

## 🔄 데이터 플로우

### 1. 로그인 과정
```
사용자 입력 → API 호출 → 토큰 저장 → 메인 앱 표시
```

### 2. 파일 처리 과정
```
파일 업로드 → 서버 저장 → 자동 분석 → 결과 표시 → 전처리 설정 → 전처리 실행 → DB 저장
```

### 3. API 통신 흐름
```
Frontend → FastAPI → Service Layer → Database
   ↓           ↓           ↓
Response ← JSON ← Processed Data ← Raw Data
```

## 🛡️ 보안 구현

### 1. 인증 시스템
- JWT 토큰 기반 인증
- 모든 API 엔드포인트 보호
- 로컬 스토리지 토큰 관리

### 2. CORS 설정
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 파일 업로드 보안
- 파일 타입 제한 (.csv만 허용)
- 파일 크기 제한 (100MB)
- 안전한 파일 저장 경로

## 📊 성능 최적화

### 1. 프론트엔드
- 이벤트 위임 사용
- DOM 조작 최소화
- 비동기 처리

### 2. 백엔드
- Pandas 벡터화 연산
- 메모리 효율적인 데이터 처리
- 데이터베이스 연결 풀링

## 🐛 에러 처리

### 1. 프론트엔드
```javascript
try {
    const response = await apiCall();
    if (response.status === 'success') {
        // 성공 처리
    } else {
        showError(response.message);
    }
} catch (error) {
    showError('네트워크 오류가 발생했습니다.');
}
```

### 2. 백엔드
```python
try:
    result = process_data()
    return {"status": "success", "data": result}
except Exception as e:
    return {"status": "error", "message": str(e)}
```

## 🔧 확장 가능성

### 1. 새로운 데이터베이스 지원
- `services/exporter.py`에 새로운 함수 추가
- 연결 문자열 및 처리 로직 구현

### 2. 새로운 전처리 옵션
- `services/preprocessor.py`에 새로운 처리 함수 추가
- 프론트엔드 UI에 옵션 추가

### 3. 새로운 분석 기능
- `services/analyzer.py`에 새로운 분석 로직 추가
- 결과 표시 UI 업데이트

이 코드는 모듈화되어 있어 각 부분을 독립적으로 수정하고 확장할 수 있습니다.

