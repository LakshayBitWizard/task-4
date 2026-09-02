// ===== Task Manager Dashboard — main.js =====
// Full CRUD with LocalStorage, Search & Filter, Toast Notifications

(function () {
  'use strict';

  // ===== DOM Elements =====
  const taskInput = document.getElementById('taskInput');
  const addTaskForm = document.getElementById('addTaskForm');
  const taskList = document.getElementById('taskList');
  const searchBox = document.getElementById('searchBox');
  const filterSelect = document.getElementById('filterSelect');
  const statTotal = document.getElementById('statTotal');
  const statCompleted = document.getElementById('statCompleted');
  const statPending = document.getElementById('statPending');
  const taskCountBadge = document.getElementById('taskCountBadge');
  const toastContainer = document.getElementById('toastContainer');

  // ===== State =====
  const STORAGE_KEY = 'taskManagerDashboard_tasks';
  let tasks = loadTasks();
  let editingId = null;

  // ===== SVG Icons =====
  const icons = {
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    cancel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    empty: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  // ===== LocalStorage =====
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load tasks:', e);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
      showToast('Failed to save tasks', 'error');
    }
  }

  // ===== CRUD Operations =====

  // CREATE
  function addTask(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Task cannot be empty!', 'error');
      taskInput.focus();
      return;
    }

    const newTask = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    tasks.unshift(newTask);
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
    showToast('Task added successfully!', 'success');
  }

  // READ — renderTasks handles display

  // UPDATE — Toggle complete
  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      showToast(
        task.completed ? 'Task marked as completed!' : 'Task marked as pending',
        task.completed ? 'success' : 'info'
      );
    }
  }

  // UPDATE — Edit task name
  function startEdit(id) {
    editingId = id;
    renderTasks();
    const editInput = document.querySelector('.task-edit-input');
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }

  function saveEdit(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Task name cannot be empty!', 'error');
      return;
    }
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.name = trimmed;
      saveTasks();
      editingId = null;
      renderTasks();
      showToast('Task updated!', 'success');
    }
  }

  function cancelEdit() {
    editingId = null;
    renderTasks();
  }

  // DELETE
  function deleteTask(id) {
    const taskEl = document.querySelector(`[data-task-id="${id}"]`);
    if (taskEl) {
      taskEl.classList.add('removing');
      taskEl.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showToast('Task deleted', 'info');
      }, { once: true });
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
      showToast('Task deleted', 'info');
    }
  }

  // ===== Filtering & Searching =====
  function getFilteredTasks() {
    const query = searchBox.value.trim().toLowerCase();
    const filter = filterSelect.value;

    return tasks.filter(task => {
      // Filter by status
      if (filter === 'completed' && !task.completed) return false;
      if (filter === 'pending' && task.completed) return false;

      // Filter by search query
      if (query && !task.name.toLowerCase().includes(query)) return false;

      return true;
    });
  }

  // ===== Render =====
  function renderTasks() {
    const filtered = getFilteredTasks();

    updateStats();

    // Update badge
    const badgeCount = filtered.length;
    taskCountBadge.textContent = `${badgeCount} task${badgeCount !== 1 ? 's' : ''}`;

    // Empty state
    if (filtered.length === 0) {
      const isSearching = searchBox.value.trim() || filterSelect.value !== 'all';
      taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icons.empty}</div>
          <h3>${isSearching ? 'No matching tasks' : 'No tasks yet'}</h3>
          <p>${isSearching ? 'Try a different search or filter' : 'Add your first task above to get started!'}</p>
        </div>
      `;
      return;
    }

    // Build task items
    taskList.innerHTML = filtered.map((task, index) => {
      const isEditing = editingId === task.id;

      return `
        <div class="task-item ${task.completed ? 'completed' : ''}" 
             data-task-id="${task.id}" 
             role="listitem"
             style="animation-delay: ${index * 0.04}s">
          
          <label class="task-checkbox">
            <input type="checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   data-action="toggle" 
                   data-id="${task.id}"
                   aria-label="Mark task as ${task.completed ? 'pending' : 'completed'}">
            <span class="checkmark">${icons.check}</span>
          </label>

          ${isEditing
          ? `<input type="text" 
                    class="task-edit-input" 
                    value="${escapeHtml(task.name)}" 
                    data-action="edit-input" 
                    data-id="${task.id}"
                    maxlength="200"
                    aria-label="Edit task name">`
          : `<span class="task-name">${escapeHtml(task.name)}</span>`
        }

          <div class="task-actions">
            ${isEditing
          ? `<button class="btn-icon btn-save" data-action="save" data-id="${task.id}" title="Save" aria-label="Save edit">${icons.save}</button>
               <button class="btn-icon btn-cancel" data-action="cancel" title="Cancel" aria-label="Cancel edit">${icons.cancel}</button>`
          : `<button class="btn-icon btn-edit" data-action="edit" data-id="${task.id}" title="Edit" aria-label="Edit task">${icons.edit}</button>
               <button class="btn-icon btn-delete" data-action="delete" data-id="${task.id}" title="Delete" aria-label="Delete task">${icons.delete}</button>`
        }
          </div>
        </div>
      `;
    }).join('');
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    animateNumber(statTotal, total);
    animateNumber(statCompleted, completed);
    animateNumber(statPending, pending);
  }

  // ===== Animated Number Transition =====
  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    el.style.transform = 'scale(1.2)';
    el.textContent = target;

    setTimeout(() => {
      el.style.transform = 'scale(1)';
    }, 200);
  }

  // ===== Toast Notifications =====
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);

    // Auto-dismiss after 2.5s
    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 2500);
  }

  // ===== Utility =====
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== Event Listeners =====

  // Add task
  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
  });

  // Delegate clicks on task list
  taskList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'toggle':
        toggleComplete(id);
        break;
      case 'edit':
        startEdit(id);
        break;
      case 'save': {
        const input = document.querySelector(`.task-edit-input[data-id="${id}"]`);
        if (input) saveEdit(id, input.value);
        break;
      }
      case 'cancel':
        cancelEdit();
        break;
      case 'delete':
        deleteTask(id);
        break;
    }
  });

  // Handle Enter/Escape in edit input
  taskList.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('task-edit-input')) {
      const id = e.target.dataset.id;
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit(id, e.target.value);
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    }
  });

  // Search — real-time filtering
  searchBox.addEventListener('input', () => {
    renderTasks();
  });

  // Filter dropdown
  filterSelect.addEventListener('change', () => {
    renderTasks();
  });

  // ===== Initialize =====
  renderTasks();

})();
