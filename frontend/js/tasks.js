const rowsEl = document.getElementById('task-rows');
const emptyEl = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('#filters button');

let currentStatus = '';

function formatDate(iso) {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleString();
}

async function loadTasks(status) {
  const url = status ? `/api/tasks?status=${status}` : '/api/tasks';
  const res = await fetch(url, { credentials: 'include' });
  if (res.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  rowsEl.innerHTML = '';
  emptyEl.style.display = tasks.length === 0 ? 'block' : 'none';

  for (const task of tasks) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${task.id}</td>
      <td>${escapeHtml(task.title)}</td>
      <td><span class="status-pill status-${task.status}">${task.status}</span></td>
      <td>${task.detail ? escapeHtml(task.detail) : '—'}</td>
      <td>${formatDate(task.updated_at)}</td>
    `;
    rowsEl.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatus = btn.dataset.status;
    loadTasks(currentStatus);
  });
});

document.addEventListener('DOMContentLoaded', () => loadTasks(''));
