// src/pages/History.js
export default function History(root) {
  root.innerHTML = '';
  const token = localStorage.getItem('token');
  if (!token) {
    root.innerHTML = `
      <div class="container">
        <div class="alert alert-warning mt-4">
          Please <a href="#/login">log in</a> to view your watch history.
        </div>
      </div>
    `;
    return;
  }

  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2 class="mt-4">Watch History</h2>
    <div id="history-list" class="row g-3">
      <p class="text-muted">Loading history…</p>
    </div>
  `;
  root.appendChild(container);

  const listEl = container.querySelector('#history-list');

  (async () => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load history');
      const entries = await res.json();

      if (entries.length === 0) {
        listEl.innerHTML = `<p class="text-muted">No history yet.</p>`;
        return;
      }

      listEl.innerHTML = '';
      entries.forEach(e => {
        const v = e.video;
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
          <div class="card h-100">
            <video
              class="card-img-top"
              src="${v.url}"
              controls
              style="height:200px; object-fit:cover;"
            ></video>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${v.title}</h5>
              <p class="card-text text-muted mb-2">
                Viewed on ${new Date(e.viewedAt).toLocaleString()}
              </p>
              <a href="#/video/${v._id}" class="btn btn-primary btn-sm mt-auto">
                Rewatch
              </a>
            </div>
          </div>
        `;
        listEl.appendChild(col);
      });
    } catch (err) {
      listEl.innerHTML = `
        <div class="alert alert-danger">
          ${err.message}
        </div>
      `;
    }
  })();
}
