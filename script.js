// API 기본 설정
const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
    users: `${API_BASE_URL}/api/users`,
    todos: `${API_BASE_URL}/api/todos`,
    activities: `${API_BASE_URL}/api/activities`,
    memos: `${API_BASE_URL}/api/memo`
};

// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let todos = {};
let timeRecords = {}; // 시간별 기록 저장
let noteContent = '';
let viewMode = 'calendar'; // 'calendar', 'month', 'year'
let yearRangeStart = Math.floor(currentDate.getFullYear() / 12) * 12;
let currentUser = null;
let idChecked = false;
let isLoading = false;

// DOM 요소
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const popupOverlay = document.getElementById('popupOverlay');
const popupTitle = document.getElementById('popupTitle');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const noteSection = document.getElementById('noteSection');
const calendarSection = document.getElementById('calendarSection');
const closeNoteBtn = document.getElementById('closeNoteBtn');
const openNoteBtn = document.getElementById('openNoteBtn');
const noteTextarea = document.getElementById('noteTextarea');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const previewTooltip = document.getElementById('previewTooltip');
const popupContainer = document.querySelector('.popup-container');
const calendarView = document.getElementById('calendarView');
const monthPickerView = document.getElementById('monthPickerView');
const yearPickerView = document.getElementById('yearPickerView');
const monthGrid = document.getElementById('monthGrid');
const yearGrid = document.getElementById('yearGrid');
const yearRangeLabel = document.getElementById('yearRangeLabel');
const prevYearRangeBtn = document.getElementById('prevYearRange');
const nextYearRangeBtn = document.getElementById('nextYearRange');
const searchBtn = document.getElementById('searchBtn');
const searchPopupOverlay = document.getElementById('searchPopupOverlay');
const searchPopupCloseBtn = document.getElementById('searchPopupCloseBtn');
const searchInput = document.getElementById('searchInput');
const searchExecuteBtn = document.getElementById('searchExecuteBtn');
const searchResults = document.getElementById('searchResults');

// 인증 관련 요소
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginBox = document.getElementById('loginBox');
const signupBox = document.getElementById('signupBox');
const loginId = document.getElementById('loginId');
const loginPassword = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const signupId = document.getElementById('signupId');
const signupPassword = document.getElementById('signupPassword');
const signupPasswordConfirm = document.getElementById('signupPasswordConfirm');
const signupEmail = document.getElementById('signupEmail');
const signupNickname = document.getElementById('signupNickname');
const signupButton = document.getElementById('signupButton');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const forgotPasswordBox = document.getElementById('forgotPasswordBox');
const showForgotPassword = document.getElementById('showForgotPassword');
const backToLogin = document.getElementById('backToLogin');
const forgotId = document.getElementById('forgotId');
const forgotEmail = document.getElementById('forgotEmail');
const verifyButton = document.getElementById('verifyButton');
const verifyStep = document.getElementById('verifyStep');
const changePasswordStep = document.getElementById('changePasswordStep');
const newPassword = document.getElementById('newPassword');
const newPasswordConfirm = document.getElementById('newPasswordConfirm');
const changePasswordButton = document.getElementById('changePasswordButton');
const forgotSubtitle = document.getElementById('forgotSubtitle');
let verifiedUserId = null;
const idCheckButton = document.getElementById('idCheckButton');
const idCheckMessage = document.getElementById('idCheckMessage');
const userNicknameDisplay = document.getElementById('userNickname');
const logoutBtn = document.getElementById('logoutBtn');
const timeRecordList = document.getElementById('timeRecordList');

// LIST 추가 관련 요소
const addListBtn = document.getElementById('addListBtn');
const listAddDialog = document.getElementById('listAddDialog');
const listAddCloseBtn = document.getElementById('listAddCloseBtn');
const listAddCancelBtn = document.getElementById('listAddCancelBtn');
const listAddTextarea = document.getElementById('listAddTextarea');
const listAddSubmitBtn = document.getElementById('listAddSubmitBtn');

// 초기화
function init() {
    checkLoginStatus();
    setupAuthEventListeners();
    setupEventListeners();
}

// 로그인 상태 확인
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadUserData();
        showApp();
    } else {
        showAuth();
    }
}

// 사용자 데이터 로드
async function loadUserData() {
    try {
        // 백엔드에서 할일 데이터 로드
        await loadTodosFromAPI();
        
        // 메모 데이터 로드
        await loadMemoFromAPI();
        
        noteTextarea.value = noteContent;
        userNicknameDisplay.textContent = currentUser.nickname;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// 백엔드에서 메모 로드
async function loadMemoFromAPI() {
    try {
        const response = await fetch(`${API_ENDPOINTS.memos}`);
        const result = await response.json();
        
        if (result.success) {
            noteContent = result.data.content || '';
        }
    } catch (error) {
        console.error('메모 로드 실패:', error);
        noteContent = '';
    }
}

// 백엔드에서 할일 로드
async function loadTodosFromAPI() {
    try {
        const response = await fetch(`${API_ENDPOINTS.todos}`);
        const result = await response.json();
        
        if (result.success) {
            // 날짜별로 그룹화
            todos = {};
            result.data.forEach(todo => {
                const date = todo.date;
                
                if (!todos[date]) {
                    todos[date] = [];
                }
                
                todos[date].push({
                    id: todo._id,
                    text: todo.task,
                    completed: todo.completed,
                    createdAt: todo.createdAt
                });
            });
        }
    } catch (error) {
        console.error('할일 로드 실패:', error);
        todos = {};
    }
}

// 메모 저장 (백엔드)
async function saveMemo() {
    if (!currentUser) return false;
    
    try {
        const response = await fetch(`${API_ENDPOINTS.memos}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: noteContent })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return true;
        } else {
            alert('메모 저장에 실패했습니다.');
            return false;
        }
    } catch (error) {
        console.error('메모 저장 실패:', error);
        alert('서버와 연결할 수 없습니다.');
        return false;
    }
}

// 시간별 기록 저장 (백엔드)
async function saveTimeRecords(date) {
    if (!currentUser || !date) return;
    
    try {
        // 해당 날짜의 모든 시간 데이터 수집
        const hourData = {};
        for (let hour = 9; hour <= 22; hour++) {
            const timeKey = `${hour}:00`;
            const recordKey = `${date}_${timeKey}`;
            const hourField = `hour_${String(hour).padStart(2, '0')}_${String(hour + 1).padStart(2, '0')}`;
            hourData[hourField] = timeRecords[recordKey] || '';
        }
        
        await fetch(`${API_ENDPOINTS.activities}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: date,
                ...hourData
            })
        });
    } catch (error) {
        console.error('시간별 기록 저장 실패:', error);
    }
}

// 인증 화면 표시
function showAuth() {
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
}

// 앱 화면 표시
function showApp() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'flex';
    renderCalendar();
}

// 인증 이벤트 리스너 설정
function setupAuthEventListeners() {
    // 로그인/회원가입 화면 전환
    showSignup.addEventListener('click', () => {
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
        forgotPasswordBox.style.display = 'none';
        idChecked = false;
        idCheckMessage.textContent = '';
        signupId.value = '';
        signupPassword.value = '';
        signupPasswordConfirm.value = '';
        signupEmail.value = '';
        signupNickname.value = '';
    });
    
    showLogin.addEventListener('click', () => {
        signupBox.style.display = 'none';
        forgotPasswordBox.style.display = 'none';
        loginBox.style.display = 'block';
        loginId.value = '';
        loginPassword.value = '';
    });
    
    // 비밀번호 찾기 화면
    showForgotPassword.addEventListener('click', () => {
        loginBox.style.display = 'none';
        signupBox.style.display = 'none';
        forgotPasswordBox.style.display = 'block';
        resetPasswordChangeForm();
    });
    
    backToLogin.addEventListener('click', () => {
        forgotPasswordBox.style.display = 'none';
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
        loginId.value = '';
        loginPassword.value = '';
        resetPasswordChangeForm();
    });
    
    // ID 중복 확인
    idCheckButton.addEventListener('click', checkIdDuplicate);
    
    // ID 입력 시 중복확인 초기화
    signupId.addEventListener('input', () => {
        idChecked = false;
        idCheckMessage.textContent = '';
    });
    
    // 로그인
    loginButton.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // 회원가입
    signupButton.addEventListener('click', handleSignup);
    signupNickname.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    
    // 본인 확인
    verifyButton.addEventListener('click', handleVerifyUser);
    forgotEmail.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleVerifyUser();
    });
    
    // 비밀번호 변경
    changePasswordButton.addEventListener('click', handleChangePassword);
    newPasswordConfirm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChangePassword();
    });
    
    // 로그아웃
    logoutBtn.addEventListener('click', handleLogout);
}

// ID 중복 확인
async function checkIdDuplicate() {
    const id = signupId.value.trim();
    
    if (!id) {
        alert('아이디를 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.users}/check-userid/${id}`);
        const result = await response.json();
        
        if (result.available) {
            idCheckMessage.textContent = '사용 가능한 아이디입니다.';
            idCheckMessage.className = 'id-check-message success';
            idChecked = true;
        } else {
            idCheckMessage.textContent = '이미 사용 중인 아이디입니다.';
            idCheckMessage.className = 'id-check-message error';
            idChecked = false;
        }
    } catch (error) {
        console.error('ID 중복 확인 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 로그인 처리
async function handleLogin() {
    const userId = loginId.value.trim();
    const password = loginPassword.value;
    
    if (!userId || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.users}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 로그인 성공
            currentUser = {
                id: result.data.userId,
                userId: result.data.userId,
                email: result.data.email,
                nickname: result.data.nickname
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            await loadUserData();
            showApp();
        } else {
            alert(result.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 회원가입 처리
async function handleSignup() {
    const userId = signupId.value.trim();
    const password = signupPassword.value;
    const passwordConfirm = signupPasswordConfirm.value;
    const email = signupEmail.value.trim();
    const nickname = signupNickname.value.trim();
    
    if (!userId || !password || !passwordConfirm || !email || !nickname) {
        alert('모든 항목을 입력해주세요.');
        return;
    }
    
    if (!idChecked) {
        alert('아이디 중복확인을 해주세요.');
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.users}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password, email, nickname })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('회원가입이 완료되었습니다!');
            
            // 로그인 화면으로 전환
            signupBox.style.display = 'none';
            forgotPasswordBox.style.display = 'none';
            loginBox.style.display = 'block';
            loginId.value = userId;
            loginPassword.value = '';
        } else {
            alert(result.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 비밀번호 변경 폼 초기화
function resetPasswordChangeForm() {
    verifyStep.style.display = 'block';
    changePasswordStep.style.display = 'none';
    forgotId.value = '';
    forgotEmail.value = '';
    newPassword.value = '';
    newPasswordConfirm.value = '';
    verifiedUserId = null;
    forgotSubtitle.textContent = '가입하신 아이디와 이메일을 입력하세요';
}

// 본인 확인 처리
async function handleVerifyUser() {
    const userId = forgotId.value.trim();
    const email = forgotEmail.value.trim();
    
    if (!userId || !email) {
        alert('아이디와 이메일을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.users}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, email })
        });
        
        const result = await response.json();
        
        if (result.success && result.verified) {
            // 본인 확인 성공
            verifiedUserId = userId;
            verifyStep.style.display = 'none';
            changePasswordStep.style.display = 'block';
            forgotSubtitle.textContent = '새로운 비밀번호를 입력하세요';
        } else {
            alert(result.message || '일치하는 사용자 정보가 없습니다.');
        }
    } catch (error) {
        console.error('본인 확인 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 비밀번호 변경 처리
async function handleChangePassword() {
    if (!verifiedUserId) {
        alert('본인 확인을 먼저 진행해주세요.');
        return;
    }
    
    const password = newPassword.value;
    const passwordConfirm = newPasswordConfirm.value;
    const email = forgotEmail.value.trim();
    
    if (!password || !passwordConfirm) {
        alert('새 비밀번호를 입력해주세요.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.users}/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: verifiedUserId,
                email: email,
                newPassword: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('비밀번호가 성공적으로 변경되었습니다!');
            
            // 로그인 화면으로 전환
            forgotPasswordBox.style.display = 'none';
            loginBox.style.display = 'block';
            loginId.value = verifiedUserId;
            loginPassword.value = '';
            resetPasswordChangeForm();
        } else {
            alert(result.message || '비밀번호 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 백엔드에서 시간별 기록 로드
async function loadTimeRecordsFromAPI(date) {
    try {
        const response = await fetch(`${API_ENDPOINTS.activities}/${date}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            // 백엔드 데이터를 timeRecords 형식으로 변환
            for (let hour = 9; hour <= 22; hour++) {
                const timeKey = `${hour}:00`;
                const recordKey = `${date}_${timeKey}`;
                const hourField = `hour_${String(hour).padStart(2, '0')}_${String(hour + 1).padStart(2, '0')}`;
                timeRecords[recordKey] = result.data[hourField] || '';
            }
        }
    } catch (error) {
        console.error('시간별 기록 로드 실패:', error);
    }
}

// 시간별 기록 렌더링
async function renderTimeRecordList() {
    if (!selectedDate) return;
    
    // 백엔드에서 데이터 로드
    await loadTimeRecordsFromAPI(selectedDate);
    
    const timeSlots = [];
    // 오전 9시부터 오후 10시까지 (9:00 ~ 22:00)
    for (let hour = 9; hour <= 22; hour++) {
        const startHour = String(hour).padStart(2, '0');
        const endHour = String(hour + 1).padStart(2, '0');
        const timeKey = `${hour}:00`;
        const label = `${startHour}:00~${endHour}:00`;
        timeSlots.push({ timeKey, label, hour });
    }
    
    timeRecordList.innerHTML = '';
    
    timeSlots.forEach(slot => {
        const recordKey = `${selectedDate}_${slot.timeKey}`;
        const savedRecord = timeRecords[recordKey] || '';
        
        const timeItem = document.createElement('div');
        timeItem.className = 'time-record-item';
        if (savedRecord) {
            timeItem.classList.add('has-content');
        }
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = slot.label;
        
        const timeInput = document.createElement('input');
        timeInput.type = 'text';
        timeInput.className = 'time-input';
        timeInput.placeholder = '한 일을 기록하세요...';
        timeInput.value = savedRecord;
        
        timeInput.addEventListener('input', () => {
            const value = timeInput.value.trim();
            if (value) {
                timeRecords[recordKey] = value;
                timeItem.classList.add('has-content');
            } else {
                timeRecords[recordKey] = '';
                timeItem.classList.remove('has-content');
            }
            // 디바운스를 위해 타이머 사용
            clearTimeout(timeInput.saveTimer);
            timeInput.saveTimer = setTimeout(() => {
                saveTimeRecords(selectedDate);
            }, 1000);
        });
        
        timeItem.appendChild(timeLabel);
        timeItem.appendChild(timeInput);
        timeRecordList.appendChild(timeItem);
    });
}

// 로그아웃 처리
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        todos = {};
        timeRecords = {};
        noteContent = '';
        showAuth();
        // 입력 필드 초기화
        loginId.value = '';
        loginPassword.value = '';
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        if (viewMode === 'calendar') {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        if (viewMode === 'calendar') {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        }
    });
    
    currentMonthElement.addEventListener('click', () => {
        if (viewMode === 'calendar') {
            showMonthPicker();
        } else if (viewMode === 'month') {
            showYearPicker();
        }
    });
    
    prevYearRangeBtn.addEventListener('click', () => {
        yearRangeStart -= 12;
        renderYearPicker();
    });
    
    nextYearRangeBtn.addEventListener('click', () => {
        yearRangeStart += 12;
        renderYearPicker();
    });
    
    searchBtn.addEventListener('click', openSearchPopup);
    searchPopupCloseBtn.addEventListener('click', closeSearchPopup);
    searchPopupOverlay.addEventListener('click', (e) => {
        if (e.target === searchPopupOverlay) {
            closeSearchPopup();
        }
    });
    
    searchExecuteBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    popupCloseBtn.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // LIST 추가 이벤트
    addListBtn.addEventListener('click', openListAddDialog);
    listAddCloseBtn.addEventListener('click', closeListAddDialog);
    listAddCancelBtn.addEventListener('click', closeListAddDialog);
    listAddSubmitBtn.addEventListener('click', submitListAdd);
    listAddDialog.addEventListener('click', (e) => {
        if (e.target === listAddDialog) {
            closeListAddDialog();
        }
    });

    closeNoteBtn.addEventListener('click', closeNote);
    openNoteBtn.addEventListener('click', openNote);
    
    // 메모장 저장 버튼
    saveNoteBtn.addEventListener('click', async () => {
        noteContent = noteTextarea.value;
        const success = await saveMemo();
        if (success) {
            // 저장 완료 표시
            saveNoteBtn.textContent = '저장됨';
            saveNoteBtn.classList.add('saved');
            setTimeout(() => {
                saveNoteBtn.textContent = '저장';
                saveNoteBtn.classList.remove('saved');
            }, 2000);
        }
    });

    noteTextarea.addEventListener('input', () => {
        noteContent = noteTextarea.value;
        // 입력 시 저장 버튼 활성화 표시
        saveNoteBtn.textContent = '저장';
        saveNoteBtn.classList.remove('saved');
    });

    // 팝업 드래그 기능
    setupPopupDrag();
}

// 팝업 드래그 기능 설정
function setupPopupDrag() {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const popupHeader = document.querySelector('.popup-header');

    popupHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.closest('.popup-close-btn')) {
            return;
        }

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, popupContainer);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

// 월 선택 뷰 표시
function showMonthPicker() {
    viewMode = 'month';
    calendarView.style.display = 'none';
    monthPickerView.style.display = 'block';
    yearPickerView.style.display = 'none';
    
    const year = currentDate.getFullYear();
    currentMonthElement.textContent = `${year}년`;
    
    renderMonthPicker();
}

// 연도 선택 뷰 표시
function showYearPicker() {
    viewMode = 'year';
    calendarView.style.display = 'none';
    monthPickerView.style.display = 'none';
    yearPickerView.style.display = 'block';
    
    yearRangeStart = Math.floor(currentDate.getFullYear() / 12) * 12;
    currentMonthElement.textContent = '연도 선택';
    
    renderYearPicker();
}

// 달력 뷰로 돌아가기
function showCalendar() {
    viewMode = 'calendar';
    calendarView.style.display = 'flex';
    monthPickerView.style.display = 'none';
    yearPickerView.style.display = 'none';
    
    renderCalendar();
}

// 월 선택 렌더링
function renderMonthPicker() {
    const year = currentDate.getFullYear();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    monthGrid.innerHTML = '';
    
    months.forEach((monthName, index) => {
        const monthItem = document.createElement('div');
        monthItem.className = 'month-item';
        monthItem.textContent = monthName;
        
        if (index === currentDate.getMonth() && year === currentYear) {
            monthItem.classList.add('current-month');
        }
        
        monthItem.addEventListener('click', () => {
            currentDate.setMonth(index);
            showCalendar();
        });
        
        monthGrid.appendChild(monthItem);
    });
}

// 연도 선택 렌더링
function renderYearPicker() {
    const currentYear = new Date().getFullYear();
    const endYear = yearRangeStart + 11;
    
    yearRangeLabel.textContent = `${yearRangeStart} - ${endYear}`;
    yearGrid.innerHTML = '';
    
    for (let year = yearRangeStart; year <= endYear; year++) {
        const yearItem = document.createElement('div');
        yearItem.className = 'year-item';
        yearItem.textContent = `${year}년`;
        
        if (year === currentDate.getFullYear()) {
            yearItem.classList.add('current-year');
        }
        
        yearItem.addEventListener('click', () => {
            currentDate.setFullYear(year);
            showMonthPicker();
        });
        
        yearGrid.appendChild(yearItem);
    }
}

// 달력 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthElement.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    calendarGrid.innerHTML = '';
    
    // 이전 달의 날짜들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayElement = createDayElement(
            prevLastDate - i,
            year,
            month - 1,
            true
        );
        calendarGrid.appendChild(dayElement);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= lastDate; day++) {
        const dayElement = createDayElement(day, year, month, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // 다음 달의 날짜들
    const remainingDays = 42 - (firstDayOfWeek + lastDate);
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = createDayElement(day, year, month + 1, true);
        calendarGrid.appendChild(dayElement);
    }
}

// 날짜 요소 생성
function createDayElement(day, year, month, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    const dateString = formatDate(year, month, day);
    const today = new Date();
    
    if (year === today.getFullYear() && 
        month === today.getMonth() && 
        day === today.getDate()) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // 할일 표시
    const dayTodos = document.createElement('div');
    dayTodos.className = 'day-todos';
    
    if (todos[dateString] && todos[dateString].length > 0) {
        const count = todos[dateString].length;
        const completed = todos[dateString].filter(t => t.completed).length;
        const indicator = document.createElement('div');
        indicator.className = 'todo-indicator';
        indicator.textContent = `할일 ${completed}/${count}`;
        dayTodos.appendChild(indicator);
        
        // 모든 할일이 완료되었는지 확인
        if (count > 0 && completed === count) {
            dayElement.classList.add('all-completed');
        }
    }
    
    dayElement.appendChild(dayTodos);
    
    // 클릭 이벤트
    dayElement.addEventListener('click', () => {
        openPopup(dateString);
    });
    
    // 마우스 오버 이벤트 (미리보기)
    dayElement.addEventListener('mouseenter', (e) => {
        showPreview(e, dateString);
    });
    
    dayElement.addEventListener('mouseleave', () => {
        hidePreview();
    });
    
    return dayElement;
}

// 날짜 포맷
function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// 팝업 열기
function openPopup(dateString) {
    selectedDate = dateString;
    const [year, month, day] = dateString.split('-');
    popupTitle.textContent = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    
    // 팝업 위치 초기화
    popupContainer.style.transform = 'translate(0px, 0px)';
    
    renderTodoList();
    renderTimeRecordList();
    popupOverlay.classList.add('active');
    todoInput.focus();
}

// 팝업 닫기
function closePopup() {
    popupOverlay.classList.remove('active');
    selectedDate = null;
    todoInput.value = '';
    // 팝업 위치 초기화
    popupContainer.style.transform = 'translate(0px, 0px)';
}

// 할일 목록 렌더링
function renderTodoList() {
    if (!selectedDate) return;
    
    const dateTodos = todos[selectedDate] || [];
    todoList.innerHTML = '';
    
    if (dateTodos.length === 0) {
        todoList.innerHTML = '<div class="no-todos-message">할일이 없습니다</div>';
        return;
    }
    
    dateTodos.forEach((todo, index) => {
        const todoItem = createTodoElement(todo, index);
        todoList.appendChild(todoItem);
    });
}

// 할일 요소 생성
function createTodoElement(todo, index) {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    if (todo.completed) {
        todoItem.classList.add('completed');
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
        toggleTodo(index);
    });
    
    const todoText = document.createElement('input');
    todoText.type = 'text';
    todoText.className = 'todo-text';
    todoText.value = todo.text;
    todoText.addEventListener('focus', () => {
        todoText.classList.add('editing');
    });
    todoText.addEventListener('blur', () => {
        todoText.classList.remove('editing');
        updateTodoText(index, todoText.value);
    });
    todoText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            todoText.blur();
        }
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-todo-btn';
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => {
        deleteTodo(index);
    });
    
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(deleteBtn);
    
    return todoItem;
}

// 할일 추가
async function addTodo() {
    const text = todoInput.value.trim();
    if (!text || !selectedDate) return;
    
    try {
        const response = await fetch(API_ENDPOINTS.todos, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: selectedDate,
                task: text,
                completed: false
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 로컬 데이터 업데이트
            if (!todos[selectedDate]) {
                todos[selectedDate] = [];
            }
            
            todos[selectedDate].push({
                id: result.data._id,
                text: result.data.task,
                completed: result.data.completed,
                createdAt: result.data.createdAt
            });
            
            todoInput.value = '';
            renderTodoList();
            renderCalendar();
        } else {
            alert('할일 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 추가 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// LIST 추가 다이얼로그 열기
function openListAddDialog() {
    if (!selectedDate) {
        alert('날짜를 먼저 선택해주세요.');
        return;
    }
    listAddTextarea.value = '';
    listAddDialog.classList.add('active');
    listAddTextarea.focus();
}

// LIST 추가 다이얼로그 닫기
function closeListAddDialog() {
    listAddDialog.classList.remove('active');
    listAddTextarea.value = '';
}

// LIST 일괄 추가
async function submitListAdd() {
    if (!selectedDate) return;
    
    const text = listAddTextarea.value.trim();
    if (!text) {
        alert('추가할 할일을 입력해주세요.');
        return;
    }
    
    // 줄바꿈으로 분리하여 각각 할일로 추가
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
        alert('추가할 할일을 입력해주세요.');
        return;
    }
    
    try {
        // 각 라인을 백엔드에 추가
        const promises = lines.map(line => 
            fetch(API_ENDPOINTS.todos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedDate,
                    task: line,
                    completed: false
                })
            })
        );
        
        const responses = await Promise.all(promises);
        const results = await Promise.all(responses.map(r => r.json()));
        
        // 로컬 데이터 업데이트
        if (!todos[selectedDate]) {
            todos[selectedDate] = [];
        }
        
        results.forEach(result => {
            if (result.success) {
                todos[selectedDate].push({
                    id: result.data._id,
                    text: result.data.task,
                    completed: result.data.completed,
                    createdAt: result.data.createdAt
                });
            }
        });
        
        renderTodoList();
        renderCalendar();
        closeListAddDialog();
        
        alert(`${lines.length}개의 할일이 추가되었습니다!`);
    } catch (error) {
        console.error('할일 일괄 추가 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 할일 토글
async function toggleTodo(index) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    const todo = todos[selectedDate][index];
    
    try {
        const response = await fetch(`${API_ENDPOINTS.todos}/${todo.id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            todos[selectedDate][index].completed = result.data.completed;
            renderTodoList();
            renderCalendar();
        } else {
            alert('상태 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 토글 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 할일 텍스트 업데이트
async function updateTodoText(index, newText) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    const text = newText.trim();
    if (!text) {
        deleteTodo(index);
        return;
    }
    
    const todo = todos[selectedDate][index];
    
    try {
        const response = await fetch(`${API_ENDPOINTS.todos}/${todo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: text,
                completed: todo.completed
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            todos[selectedDate][index].text = result.data.task;
            renderCalendar();
        } else {
            alert('할일 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 수정 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 할일 삭제
async function deleteTodo(index) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    const todo = todos[selectedDate][index];
    
    try {
        const response = await fetch(`${API_ENDPOINTS.todos}/${todo.id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            todos[selectedDate].splice(index, 1);
            
            if (todos[selectedDate].length === 0) {
                delete todos[selectedDate];
            }
            
            renderTodoList();
            renderCalendar();
        } else {
            alert('할일 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('할일 삭제 실패:', error);
        alert('서버와 연결할 수 없습니다.');
    }
}

// 할일 저장 (백엔드 API 사용으로 더 이상 필요 없음)
function saveTodos() {
    // 백엔드 API로 자동 저장됨
}

// 미리보기 표시
function showPreview(event, dateString) {
    const dateTodos = todos[dateString];
    
    if (!dateTodos || dateTodos.length === 0) {
        return;
    }
    
    let html = '<div class="preview-title">할일 목록</div>';
    
    dateTodos.slice(0, 5).forEach(todo => {
        const status = todo.completed ? '✓' : '○';
        html += `<div class="preview-todo-item">${status} ${todo.text}</div>`;
    });
    
    if (dateTodos.length > 5) {
        html += `<div class="preview-todo-item">+${dateTodos.length - 5}개 더...</div>`;
    }
    
    previewTooltip.innerHTML = html;
    previewTooltip.classList.add('active');
    
    updateTooltipPosition(event);
}

// 툴팁 위치 업데이트
function updateTooltipPosition(event) {
    const x = event.clientX;
    const y = event.clientY;
    const tooltipWidth = 250;
    const tooltipHeight = previewTooltip.offsetHeight;
    
    let left = x + 15;
    let top = y + 15;
    
    // 화면 밖으로 나가지 않도록 조정
    if (left + tooltipWidth > window.innerWidth) {
        left = x - tooltipWidth - 15;
    }
    
    if (top + tooltipHeight > window.innerHeight) {
        top = y - tooltipHeight - 15;
    }
    
    previewTooltip.style.left = left + 'px';
    previewTooltip.style.top = top + 'px';
}

// 미리보기 숨기기
function hidePreview() {
    previewTooltip.classList.remove('active');
}

// 노트 닫기
function closeNote() {
    noteSection.classList.add('hidden');
    calendarSection.classList.add('full-width');
    openNoteBtn.style.display = 'block';
}

// 노트 열기
function openNote() {
    noteSection.classList.remove('hidden');
    calendarSection.classList.remove('full-width');
    openNoteBtn.style.display = 'none';
}

// 검색 팝업 열기
function openSearchPopup() {
    searchPopupOverlay.classList.add('active');
    searchInput.focus();
    searchInput.value = '';
    searchResults.innerHTML = '<div class="no-search-message">검색어를 입력하고 검색 버튼을 눌러주세요</div>';
}

// 검색 팝업 닫기
function closeSearchPopup() {
    searchPopupOverlay.classList.remove('active');
    searchInput.value = '';
}

// 검색 수행
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        searchResults.innerHTML = '<div class="no-search-message">검색어를 입력해주세요</div>';
        return;
    }
    
    // 모든 할일에서 검색어 포함된 항목 찾기
    const searchResultsData = [];
    
    Object.keys(todos).forEach(dateString => {
        const dateTodos = todos[dateString];
        const matchedTodos = dateTodos.filter(todo => 
            todo.text.toLowerCase().includes(searchTerm)
        );
        
        if (matchedTodos.length > 0) {
            searchResultsData.push({
                date: dateString,
                todos: matchedTodos
            });
        }
    });
    
    // 날짜 내림차순 정렬
    searchResultsData.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // 결과 렌더링
    if (searchResultsData.length === 0) {
        searchResults.innerHTML = '<div class="no-search-message">검색 결과가 없습니다</div>';
        return;
    }
    
    let html = '';
    
    searchResultsData.forEach(result => {
        const [year, month, day] = result.date.split('-');
        const dateLabel = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        
        html += `<div class="search-result-date-group">`;
        html += `<div class="search-result-date">${dateLabel}</div>`;
        
        result.todos.forEach((todo, index) => {
            const highlightedText = highlightSearchTerm(todo.text, searchTerm);
            const statusClass = todo.completed ? 'completed' : 'pending';
            const statusText = todo.completed ? '✓ 완료' : '○ 진행중';
            
            html += `
                <div class="search-result-item" onclick="openDateFromSearch('${result.date}')">
                    <div class="search-result-text">${highlightedText}</div>
                    <div class="search-result-status ${statusClass}">${statusText}</div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    searchResults.innerHTML = html;
}

// 검색어 하이라이트
function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 정규식 특수문자 이스케이프
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 검색 결과에서 날짜 클릭 시 해당 날짜로 이동
function openDateFromSearch(dateString) {
    closeSearchPopup();
    
    // 날짜 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    
    // 현재 날짜를 해당 날짜로 설정
    currentDate = new Date(year, month - 1, day);
    
    // 달력 뷰로 전환
    showCalendar();
    
    // 약간의 딜레이 후 팝업 열기 (애니메이션 효과)
    setTimeout(() => {
        openPopup(dateString);
    }, 300);
}

// 앱 초기화
init();

