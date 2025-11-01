// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let todos = JSON.parse(localStorage.getItem('todos')) || {};
let noteContent = localStorage.getItem('noteContent') || '';
let viewMode = 'calendar'; // 'calendar', 'month', 'year'
let yearRangeStart = Math.floor(currentDate.getFullYear() / 12) * 12;

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

// 초기화
function init() {
    noteTextarea.value = noteContent;
    renderCalendar();
    setupEventListeners();
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

    closeNoteBtn.addEventListener('click', closeNote);
    openNoteBtn.addEventListener('click', openNote);

    noteTextarea.addEventListener('input', () => {
        noteContent = noteTextarea.value;
        localStorage.setItem('noteContent', noteContent);
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
    localStorage.setItem('todos', JSON.stringify(todos));
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

// 앱 초기화
init();

