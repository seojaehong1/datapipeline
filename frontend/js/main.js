// 전역 변수
window.uploadedFilePath = null;
window.analysisData = null;
window.currentProcessedFile = null;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 인증 상태 확인
    if (isAuthenticated()) {
        showMainApp();
    } else {
        showLoginScreen();
    }
    
    initializeEventListeners();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 로그인 폼
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 파일 업로드 이벤트
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
        });
    }

    // 전처리 버튼
    const preprocessBtn = document.getElementById('preprocessBtn');
    if (preprocessBtn) {
        preprocessBtn.addEventListener('click', handlePreprocess);
    }
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        console.log('로그인 시도:', username);
        const response = await login(username, password);
        console.log('로그인 응답:', response);
        
        if (response.status === 'success') {
            setAuthToken(response.token);
            showMainApp();
        } else {
            showLoginError(response.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 에러:', error);
        showLoginError('로그인 중 오류가 발생했습니다: ' + error.message);
    }
}

// 로그아웃 처리
function handleLogout() {
    clearAuthToken();
    showLoginScreen();
}

// 로그인 화면 표시
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

// 메인 앱 표시
function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// 로그인 에러 표시
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// 파일 업로드 처리
async function handleFileUpload(file) {
    showLoading();
    
    try {
        const data = await uploadFileToServer(file);
        
        if (data.status === 'success') {
            window.uploadedFilePath = data.filepath;
            window.analysisData = data.analysis;
            console.log('업로드된 파일 경로:', window.uploadedFilePath);
            showAnalysis(data.analysis);
        } else {
            alert('업로드 실패: ' + data.message);
        }
    } catch (error) {
        alert('에러 발생: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 전처리 실행
async function handlePreprocess() {
    console.log('=== 전처리 시작 ===');
    console.log('uploadedFilePath:', window.uploadedFilePath);
    
    if (!window.uploadedFilePath) {
        alert('파일 경로가 없습니다. 파일을 다시 업로드해주세요.');
        return;
    }

    showLoading();

    // 설정 수집
    const config = {};
    window.analysisData.columns.forEach(col => {
        const colConfig = {};
        
        const missingSelect = document.getElementById(`missing_${col.column_name}`);
        if (missingSelect && missingSelect.value) {
            colConfig.missing = missingSelect.value;
        }

        const outlierSelect = document.getElementById(`outlier_${col.column_name}`);
        if (outlierSelect && outlierSelect.value) {
            colConfig.outliers = outlierSelect.value;
        }

        if (Object.keys(colConfig).length > 0) {
            config[col.column_name] = colConfig;
        }
    });

    console.log('수집된 설정:', config);

    try {
        const data = await preprocessData(window.uploadedFilePath, config);
        console.log('전처리 응답:', data);
        
        if (data.status === 'success') {
            showResult(data);
        } else {
            alert('전처리 실패: ' + data.message);
        }
    } catch (error) {
        console.error('에러:', error);
        alert('에러 발생: ' + error.message);
    } finally {
        hideLoading();
    }
}

// DB로 내보내기
async function exportToDb() {
    showLoading();

    const dbType = document.getElementById('dbType').value;
    const tableName = document.getElementById('tableName').value;
    const ifExists = document.getElementById('ifExists').value;

    let dbConfig = { db_type: dbType };

    if (dbType === 'sqlite') {
        dbConfig.database = document.getElementById('sqliteDb').value;
    } else {
        dbConfig.host = document.getElementById('dbHost').value;
        dbConfig.port = parseInt(document.getElementById('dbPort').value);
        dbConfig.username = document.getElementById('dbUsername').value;
        dbConfig.password = document.getElementById('dbPassword').value;
        dbConfig.database = document.getElementById('dbDatabase').value;
    }

    console.log('DB 저장 요청:', { filepath: window.currentProcessedFile, db_config: dbConfig, table_name: tableName, if_exists: ifExists });

    try {
        const data = await exportToDatabase(window.currentProcessedFile, dbConfig, tableName, ifExists);
        console.log('DB 저장 응답:', data);

        if (data.status === 'success') {
            let message = `✅ 성공!\n\n`;
            message += `DB 타입: ${data.db_type}\n`;
            message += `테이블: ${data.table_name}\n`;
            message += `저장된 행: ${data.rows_exported}개\n`;
            
            if (data.db_file) {
                message += `\nSQLite 파일: ${data.db_file}`;
            }
            
            alert(message);
            hideDbOptions();
        } else {
            alert('저장 실패: ' + data.message);
        }
    } catch (error) {
        console.error('에러:', error);
        alert('에러 발생: ' + error.message);
    } finally {
        hideLoading();
    }
}