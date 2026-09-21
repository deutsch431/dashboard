const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

// If already logged in, skip straight to the dashboard.
fetch('/api/session', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) window.location.href = 'dashboard.html';
  });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      errorMsg.textContent = data.error || 'Login failed';
      return;
    }

    window.location.href = 'dashboard.html';
  } catch (err) {
    errorMsg.textContent = 'Could not reach the server';
  }
});
