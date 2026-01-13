const API_URL = 'http://localhost:5000/api/todos';

// DOM 요소
const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const cancelEditBtn = document.getElementById('cancelEdit');
const closeModal = document.querySelector('.close');

// 페이지 로드 시 할일 목록 가져오기
document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
});

// 할일 목록 가져오기
async function fetchTodos() {
    try {
        loading.style.display = 'block';
        errorDiv.classList.remove('show');
        
        const response = await fetch(API_URL, {
            referrerPolicy: 'strict-origin-when-cross-origin'
        });
        
        if (!response.ok) {
            throw new Error('할일 목록을 가져오는데 실패했습니다.');
        }
        
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        showError('할일 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 할일 목록 표시
function displayTodos(todos) {
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">할일이 없습니다. 새 할일을 추가해보세요!</li>';
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id}">
            <div class="todo-header">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                <div class="todo-actions">
                    <button class="btn btn-success" onclick="editTodo('${todo._id}')">수정</button>
                    <button class="btn btn-danger" onclick="deleteTodo('${todo._id}')">삭제</button>
                </div>
            </div>
            ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
            <div class="todo-meta">
                <span class="todo-status ${todo.completed ? 'completed' : 'pending'}">
                    ${todo.completed ? '✓ 완료됨' : '○ 진행중'}
                </span>
                <span>생성일: ${formatDate(todo.createdAt)}</span>
            </div>
        </li>
    `).join('');
}

// 할일 추가
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!title) {
        showError('제목을 입력해주세요.');
        return;
    }
    
    try {
        errorDiv.classList.remove('show');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description }),
            referrerPolicy: 'strict-origin-when-cross-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '할일 추가에 실패했습니다.');
        }
        
        todoForm.reset();
        fetchTodos();
    } catch (error) {
        showError('할일 추가 중 오류가 발생했습니다: ' + error.message);
    }
});

// 할일 수정 모달 열기
async function editTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            referrerPolicy: 'strict-origin-when-cross-origin'
        });
        
        if (!response.ok) {
            throw new Error('할일을 불러오는데 실패했습니다.');
        }
        
        const todo = await response.json();
        
        document.getElementById('editId').value = todo._id;
        document.getElementById('editTitle').value = todo.title;
        document.getElementById('editDescription').value = todo.description || '';
        document.getElementById('editCompleted').checked = todo.completed;
        
        editModal.classList.add('show');
    } catch (error) {
        showError('할일 수정 중 오류가 발생했습니다: ' + error.message);
    }
}

// 할일 수정
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const completed = document.getElementById('editCompleted').checked;
    
    if (!title) {
        showError('제목을 입력해주세요.');
        return;
    }
    
    try {
        errorDiv.classList.remove('show');
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, completed }),
            referrerPolicy: 'strict-origin-when-cross-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '할일 수정에 실패했습니다.');
        }
        
        editModal.classList.remove('show');
        fetchTodos();
    } catch (error) {
        showError('할일 수정 중 오류가 발생했습니다: ' + error.message);
    }
});

// 할일 삭제
async function deleteTodo(id) {
    if (!confirm('정말로 이 할일을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        errorDiv.classList.remove('show');
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            referrerPolicy: 'strict-origin-when-cross-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '할일 삭제에 실패했습니다.');
        }
        
        fetchTodos();
    } catch (error) {
        showError('할일 삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 모달 닫기
closeModal.addEventListener('click', () => {
    editModal.classList.remove('show');
});

cancelEditBtn.addEventListener('click', () => {
    editModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.classList.remove('show');
    }
});

// 유틸리티 함수
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
