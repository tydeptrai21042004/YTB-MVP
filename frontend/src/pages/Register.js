// src/pages/Register.js
export default function Register(root) {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2>Register</h2>
    <form id="register-form">
      <div class="mb-3">
        <input class="form-control" type="text" id="reg-name" placeholder="Name" required>
      </div>
      <div class="mb-3">
        <input class="form-control" type="email" id="reg-email" placeholder="Email" required>
      </div>
      <div class="mb-3">
        <input class="form-control" type="password" id="reg-pass" placeholder="Password" required>
      </div>
      <button class="btn btn-primary">Sign Up</button>
    </form>
    <div id="register-result" class="mt-3"></div>
  `;
  root.appendChild(container);

  document.getElementById('register-form').onsubmit = async e => {
    e.preventDefault();
    const resultEl = document.getElementById('register-result');
    resultEl.innerHTML = '';

    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-pass').value;

    if (!name || !email || !pass) {
      resultEl.innerHTML = `<div class="alert alert-warning">All fields are required.</div>`;
      return;
    }

    resultEl.innerHTML = `<div class="text-info">Registering…</div>`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });

      if (!res.ok) {
        let errMsg = res.statusText;
        try {
          const { error } = await res.json();
          errMsg = error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const { token, user } = await res.json();
      // store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      resultEl.innerHTML = `
        <div class="alert alert-success">
          Registration successful! Redirecting to your profile…
        </div>
      `;
      // short delay, then navigate
      setTimeout(() => {
        window.location.hash = '#/profile';
      }, 1000);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-danger">Registration failed: ${err.message}</div>`;
    }
  };
}
