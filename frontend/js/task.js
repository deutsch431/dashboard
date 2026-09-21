const rowsEl = document.getElementById('task-rows');
const emptyEl = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('#filters button');
function loadTasks(status) {
  const url = status ? '/api/tasks?status=' + status : '/api/tasks';
  fetch(url, { credentials: 'include' })
    .then(res => res.json())
    .then(renderTasks);
}