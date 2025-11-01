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
function loadUserData() {
    const userDataKey = `userData_${currentUser.id}`;
    const userData = localStorage.getItem(userDataKey);
    
    if (userData) {
        const parsed = JSON.parse(userData);
        todos = parsed.todos || {};
        timeRecords = parsed.timeRecords || {};
        noteContent = parsed.noteContent || '';
    } else {
        todos = {};
        timeRecords = {};
        noteContent = '';
    }
    
    noteTextarea.value = noteContent;
    userNicknameDisplay.textContent = currentUser.nickname;
}

// 사용자 데이터 저장
function saveUserData() {
    if (!currentUser) return;
    
    const userDataKey = `userData_${currentUser.id}`;
    const userData = {
        todos: todos,
        timeRecords: timeRecords,
        noteContent: noteContent
    };
    
    localStorage.setItem(userDataKey, JSON.stringify(userData));
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
function checkIdDuplicate() {
    const id = signupId.value.trim();
    
    if (!id) {
        alert('아이디를 입력해주세요.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    if (users[id]) {
        idCheckMessage.textContent = '이미 사용 중인 아이디입니다.';
        idCheckMessage.className = 'id-check-message error';
        idChecked = false;
    } else {
        idCheckMessage.textContent = '사용 가능한 아이디입니다.';
        idCheckMessage.className = 'id-check-message success';
        idChecked = true;
    }
}

// 로그인 처리
function handleLogin() {
    const id = loginId.value.trim();
    const password = loginPassword.value;
    
    if (!id || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[id];
    
    if (!user) {
        alert('존재하지 않는 아이디입니다.');
        return;
    }
    
    if (user.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 로그인 성공
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadUserData();
    showApp();
}

// 회원가입 처리
function handleSignup() {
    const id = signupId.value.trim();
    const password = signupPassword.value;
    const passwordConfirm = signupPasswordConfirm.value;
    const email = signupEmail.value.trim();
    const nickname = signupNickname.value.trim();
    
    if (!id || !password || !passwordConfirm || !email || !nickname) {
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
    
    // 회원가입 처리
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    users[id] = {
        id: id,
        password: password,
        email: email,
        nickname: nickname,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('회원가입이 완료되었습니다!');
    
    // 로그인 화면으로 전환
    signupBox.style.display = 'none';
    forgotPasswordBox.style.display = 'none';
    loginBox.style.display = 'block';
    loginId.value = id;
    loginPassword.value = '';
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
function handleVerifyUser() {
    const id = forgotId.value.trim();
    const email = forgotEmail.value.trim();
    
    if (!id || !email) {
        alert('아이디와 이메일을 입력해주세요.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[id];
    
    if (!user) {
        alert('존재하지 않는 아이디입니다.');
        return;
    }
    
    if (user.email !== email) {
        alert('가입 시 입력한 이메일과 일치하지 않습니다.');
        return;
    }
    
    // 본인 확인 성공
    verifiedUserId = id;
    verifyStep.style.display = 'none';
    changePasswordStep.style.display = 'block';
    forgotSubtitle.textContent = '새로운 비밀번호를 입력하세요';
}

// 비밀번호 변경 처리
function handleChangePassword() {
    if (!verifiedUserId) {
        alert('본인 확인을 먼저 진행해주세요.');
        return;
    }
    
    const password = newPassword.value;
    const passwordConfirm = newPasswordConfirm.value;
    
    if (!password || !passwordConfirm) {
        alert('새 비밀번호를 입력해주세요.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 비밀번호 변경
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[verifiedUserId].password = password;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('비밀번호가 성공적으로 변경되었습니다!');
    
    // 로그인 화면으로 전환
    forgotPasswordBox.style.display = 'none';
    loginBox.style.display = 'block';
    loginId.value = verifiedUserId;
    loginPassword.value = '';
    resetPasswordChangeForm();
}

// 시간별 기록 렌더링
function renderTimeRecordList() {
    if (!selectedDate) return;
    
    const timeSlots = [];
    // 오전 9시부터 오후 10시까지 (9:00 ~ 22:00)
    for (let hour = 9; hour <= 22; hour++) {
        const startHour = String(hour).padStart(2, '0');
        const endHour = String(hour + 1).padStart(2, '0');
        const timeKey = `${hour}:00`;
        const label = `${startHour}:00~${endHour}:00`;
        timeSlots.push({ timeKey, label });
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
                delete timeRecords[recordKey];
                timeItem.classList.remove('has-content');
            }
            saveUserData();
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

    noteTextarea.addEventListener('input', () => {
        noteContent = noteTextarea.value;
        saveUserData();
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
function addTodo() {
    const text = todoInput.value.trim();
    if (!text || !selectedDate) return;
    
    if (!todos[selectedDate]) {
        todos[selectedDate] = [];
    }
    
    todos[selectedDate].push({
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    saveTodos();
    todoInput.value = '';
    renderTodoList();
    renderCalendar();
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
function submitListAdd() {
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
    
    if (!todos[selectedDate]) {
        todos[selectedDate] = [];
    }
    
    // 각 라인을 할일로 추가
    lines.forEach(line => {
        todos[selectedDate].push({
            text: line,
            completed: false,
            createdAt: new Date().toISOString()
        });
    });
    
    saveTodos();
    renderTodoList();
    renderCalendar();
    closeListAddDialog();
    
    alert(`${lines.length}개의 할일이 추가되었습니다!`);
}

// 할일 토글
function toggleTodo(index) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    todos[selectedDate][index].completed = !todos[selectedDate][index].completed;
    saveTodos();
    renderTodoList();
    renderCalendar();
}

// 할일 텍스트 업데이트
function updateTodoText(index, newText) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    const text = newText.trim();
    if (!text) {
        deleteTodo(index);
        return;
    }
    
    todos[selectedDate][index].text = text;
    saveTodos();
    renderCalendar();
}

// 할일 삭제
function deleteTodo(index) {
    if (!selectedDate || !todos[selectedDate]) return;
    
    todos[selectedDate].splice(index, 1);
    
    if (todos[selectedDate].length === 0) {
        delete todos[selectedDate];
    }
    
    saveTodos();
    renderTodoList();
    renderCalendar();
}

// 할일 저장
function saveTodos() {
    saveUserData();
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

