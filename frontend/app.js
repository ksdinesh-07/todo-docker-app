const API_BASE_URL = 'http://localhost:8080/api';  // Changed from 8000 to 8080

let currentFilter = 'all';
let todos = [];

// DOM elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
});

// Load todos from backend
async function loadTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (response.ok) {
            todos = await response.json();
            renderTodos();
        } else {
            throw new Error('Failed to load todos');
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load todos. Make sure backend is running on port 8000.');
    }
}

// Add new todo
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a task');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            renderTodos();
            todoInput.value = '';
            todoInput.focus();
        } else {
            throw new Error('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add todo. Please try again.');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todo.completed })
        });

        if (response.ok) {
            todo.completed = !todo.completed;
            renderTodos();
        } else {
            throw new Error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } else {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTodos();
}

// Clear completed todos
async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
        alert('No completed tasks to clear');
        return;
    }

    if (!confirm(`Are you sure you want to clear ${completedTodos.length} completed task(s)?`)) {
        return;
    }

    try {
        for (const todo of completedTodos) {
            await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
                method: 'DELETE'
            });
        }
        
        todos = todos.filter(t => !t.completed);
        renderTodos();
    } catch (error) {
        console.error('Error clearing completed todos:', error);
        showError('Failed to clear completed todos. Please try again.');
    }
}

// Render todos based on current filter
function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        switch (currentFilter) {
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    });

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = currentFilter === 'all' 
            ? 'No tasks yet. Add a new task above!' 
            : `No ${currentFilter} tasks.`;
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#666';
        emptyMessage.style.padding = '20px';
        todoList.appendChild(emptyMessage);
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            `;
            
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// Update task counter
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    
    todoCount.textContent = `${active} active, ${completed} completed, ${total} total`;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    alert(`Error: ${message}`);
}

// Add todo on Enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});