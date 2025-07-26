// src/pages/Login.js
export default function Login(root) {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2 class="mt-4">Login</h2>
    <form id="login-form">
      <div class="mb-3">
        <input
          class="form-control"
          type="email"
          id="login-email"
          placeholder="Email"
          required
        >
      </div>
      <div class="mb-3">
        <input
          class="form-control"
          type="password"
          id="login-pass"
          placeholder="Password"
          required
        >
      </div>
      <button class="btn btn-primary">Log In</button>
    </form>
    <div id="login-result" class="mt-3"></div>
  `;
  root.appendChild(container);

  document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    const resultEl = document.getElementById('login-result');
    resultEl.innerHTML = '';

    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;

    if (!email || !pass) {
      resultEl.innerHTML = `<div class="alert alert-warning">Please enter both email and password.</div>`;
      return;
    }

    resultEl.innerHTML = `<div class="text-info">Logging in…</div>`;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const { token, user } = await res.json();
      // store token & user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      resultEl.innerHTML = `
        <div class="alert alert-success">
          Login successful! Redirecting to your profile…
        </div>
      `;
      setTimeout(() => {
        window.location.hash = '#/profile';
      }, 1000);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-danger">Login failed: ${err.message}</div>`;
    }
  };
}
