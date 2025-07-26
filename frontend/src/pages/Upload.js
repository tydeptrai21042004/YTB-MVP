// src/pages/Upload.js
export default function Upload(root) {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2>Upload Video</h2>
    <form id="upload-form">
      <div class="mb-3">
        <label for="video-kind" class="form-label">Type</label>
        <select id="video-kind" class="form-select">
          <option value="regular">Regular</option>
          <option value="short">Short</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="video-file" class="form-label">Select file</label>
        <input class="form-control" type="file" id="video-file" accept="video/*" required>
      </div>
      <div class="mb-3">
        <input class="form-control" type="text" id="video-title" placeholder="Title" required>
      </div>
      <div class="mb-3">
        <textarea class="form-control" id="video-desc" rows="3" placeholder="Description"></textarea>
      </div>
      <button class="btn btn-primary">Upload</button>
    </form>
    <div id="upload-result" class="mt-3"></div>
  `;
  root.appendChild(container);

  document.getElementById('upload-form').onsubmit = async e => {
    e.preventDefault();
    const resultEl = document.getElementById('upload-result');
    resultEl.innerHTML = '';

    // check login first
    const token = localStorage.getItem('token');
    if (!token) {
      resultEl.innerHTML = `
        <div class="alert alert-warning">
          You must <a href="#/login" class="alert-link">log in</a> to upload a video.
        </div>
      `;
      return;
    }

    const fileInput = document.getElementById('video-file');
    const title     = document.getElementById('video-title').value.trim();
    const desc      = document.getElementById('video-desc').value.trim();
    const kind      = document.getElementById('video-kind').value;

    if (!fileInput.files.length) {
      resultEl.innerHTML = `<div class="alert alert-warning">Please select a video file.</div>`;
      return;
    }
    if (!title) {
      resultEl.innerHTML = `<div class="alert alert-warning">Please enter a title.</div>`;
      return;
    }

    // build form data
    const formData = new FormData();
    formData.append('video', fileInput.files[0]);
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('kind', kind);

    // show a loading message
    resultEl.innerHTML = `<div class="text-info">Uploading…</div>`;

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errMsg = response.statusText;
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const video = await response.json();
      resultEl.innerHTML = `
        <div class="alert alert-success">
          Upload successful as <strong>${video.kind}</strong> video! 
          <a href="#/video/${video._id}" class="alert-link">View your video</a>
        </div>
      `;
      document.getElementById('upload-form').reset();
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-danger">Upload failed: ${err.message}</div>`;
    }
  };
}
