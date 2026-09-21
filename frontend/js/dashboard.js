async function loadSummary() {
  const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
  if (res.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();

  document.getElementById('count-total').textContent = data.total;
  document.getElementById('count-success').textContent = data.success;
  document.getElementById('count-failed').textContent = data.failed;
  document.getElementById('count-pending').textContent = data.pending;
}

document.addEventListener('DOMContentLoaded', loadSummary);
