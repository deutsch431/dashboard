// Shared across dashboard.html and tasks.html.
// Confirms a session exists before letting the page render, and wires the logout button.

async function requireSession() {
  const res = await fetch('/api/session', { credentials: 'include' });
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = 'login.html';
    return null;
  }
  const el = document.getElementById('current-username');
  if (el) el.textContent = data.username;
  return data;
}

function wireLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  requireSession();
  wireLogout();
});
