// 로그인 API
async function login(username, password) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    return await response.json();
}

// 파일 업로드 API
async function uploadFileToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    return await response.json();
}

// 전처리 API
async function preprocessData(filepath, config) {
    const response = await fetch(`${API_URL}/api/preprocess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
            filepath: filepath,
            preprocessing_config: config
        })
    });

    return await response.json();
}

// DB 내보내기 API
async function exportToDatabase(filepath, dbConfig, tableName, ifExists) {
    const response = await fetch(`${API_URL}/api/export-to-db`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
            filepath: filepath,
            db_config: dbConfig,
            table_name: tableName,
            if_exists: ifExists
        })
    });

    return await response.json();
}

// 인증 토큰 관리
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function clearAuthToken() {
    localStorage.removeItem('authToken');
}

function isAuthenticated() {
    return getAuthToken() !== null;
}