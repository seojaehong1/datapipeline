// 분석 결과 표시
function showAnalysis(analysis) {
    const basicInfo = document.getElementById('basicInfo');
    basicInfo.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">총 행 수</span>
                <span class="info-value">${analysis.basic_info.row_count.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">총 컬럼 수</span>
                <span class="info-value">${analysis.basic_info.column_count}</span>
            </div>
            <div class="info-item">
                <span class="info-label">파일 크기</span>
                <span class="info-value">${analysis.basic_info.file_size_mb} MB</span>
            </div>
        </div>
    `;

    const columnAnalysis = document.getElementById('columnAnalysis');
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>컬럼명</th>
                    <th>타입</th>
                    <th>결측값</th>
                    <th>이상치</th>
                    <th>통계</th>
                </tr>
            </thead>
            <tbody>
    `;

    analysis.columns.forEach(col => {
        const nullBadge = col.null_count > 0 
            ? `<span class="badge badge-warning">${col.null_count}개 (${col.null_percentage}%)</span>`
            : '없음';
        
        const outlierBadge = col.outlier_count > 0 
            ? `<span class="badge badge-info">${col.outlier_count}개 (${col.outlier_percentage}%)</span>`
            : '없음';

        let stats = '';
        if (col.data_type === 'numeric') {
            stats = `평균: ${col.stats.mean}, 중앙: ${col.stats.median}`;
        } else {
            stats = `고유값: ${col.stats.unique_count}`;
        }

        tableHTML += `
            <tr>
                <td><strong>${col.column_name}</strong></td>
                <td>${col.data_type}</td>
                <td>${nullBadge}</td>
                <td>${outlierBadge}</td>
                <td>${stats}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    columnAnalysis.innerHTML = tableHTML;

    document.getElementById('analysisSection').classList.remove('hidden');
    showPreprocessControls(analysis.columns);
}

// 전처리 컨트롤 생성
function showPreprocessControls(columns) {
    const controls = document.getElementById('preprocessControls');
    let html = '';

    columns.forEach(col => {
        if (col.null_count > 0 || col.outlier_count > 0) {
            html += `<div class="column-control"><div class="column-name">${col.column_name}</div>`;

            if (col.null_count > 0 && col.data_type === 'numeric') {
                html += `
                    <label>결측값 처리:</label>
                    <select id="missing_${col.column_name}">
                        <option value="">처리 안 함</option>
                        <option value="mean">평균값</option>
                        <option value="median" selected>중앙값</option>
                        <option value="zero">0</option>
                        <option value="remove">행 삭제</option>
                    </select>
                `;
            }

            if (col.outlier_count > 0 && col.data_type === 'numeric') {
                html += `
                    <label>이상치 처리:</label>
                    <select id="outlier_${col.column_name}">
                        <option value="">처리 안 함</option>
                        <option value="cap" selected>제한(Cap)</option>
                        <option value="remove">제거</option>
                    </select>
                `;
            }

            html += '</div>';
        }
    });

    controls.innerHTML = html;
    document.getElementById('preprocessSection').classList.remove('hidden');
}

// 결과 표시
function showResult(data) {
    const result = document.getElementById('result');
    result.innerHTML = `
        <div class="success-message">
            <h3>전처리 완료</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">원본 행 수</span>
                    <span class="info-value">${data.original_rows.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">처리 후 행 수</span>
                    <span class="info-value">${data.processed_rows.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">제거된 행</span>
                    <span class="info-value">${data.rows_removed.toLocaleString()}</span>
                </div>
            </div>
            <p class="file-info"><strong>처리된 파일:</strong> ${data.processed_file}</p>
        </div>

        <div class="preview-section">
            <h3>데이터 미리보기 (처음 10개 행)</h3>
            <div class="table-container">
                ${generatePreviewTable(data.preview)}
            </div>
        </div>
        
        <div class="db-action-section">
            <h3>데이터베이스에 저장하기</h3>
            <button onclick="showDbOptions('${data.processed_file}')" class="btn-primary">DB에 저장</button>
        </div>
    `;

    document.getElementById('resultSection').classList.remove('hidden');
}

// 미리보기 테이블 생성
function generatePreviewTable(preview) {
    if (preview.length === 0) return '<p>데이터가 없습니다.</p>';

    const columns = Object.keys(preview[0]);
    let html = '<table><thead><tr>';
    
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    preview.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            html += `<td>${row[col]}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

// DB 옵션 표시/숨김
function showDbOptions(filepath) {
    window.currentProcessedFile = filepath;
    document.getElementById('dbSection').classList.remove('hidden');
    document.getElementById('dbSection').scrollIntoView({ behavior: 'smooth' });
}

function hideDbOptions() {
    document.getElementById('dbSection').classList.add('hidden');
}

// DB 폼 업데이트
function updateDbForm() {
    const dbType = document.getElementById('dbType').value;
    const sqliteForm = document.getElementById('sqliteForm');
    const remoteDbForm = document.getElementById('remoteDbForm');
    const portInput = document.getElementById('dbPort');

    if (dbType === 'sqlite') {
        sqliteForm.classList.remove('hidden');
        remoteDbForm.classList.add('hidden');
    } else {
        sqliteForm.classList.add('hidden');
        remoteDbForm.classList.remove('hidden');
        
        if (dbType === 'postgresql') {
            portInput.value = 5432;
        } else if (dbType === 'mysql') {
            portInput.value = 3308;
        } else if (dbType === 'mongodb') {
            portInput.value = 27017;
            document.getElementById('dbUsername').value = 'admin';
        }
    }
}

// 로딩 표시
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}