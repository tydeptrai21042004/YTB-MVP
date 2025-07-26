// src/pages/Profile.js
export default function Profile(root) {
  // container wrapper
  const container = document.createElement('div');
  container.className = 'container';
  root.appendChild(container);

  // check for JWT
  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = `
      <div class="alert alert-warning mt-4">
        You must <a href="#/login" class="alert-link">log in</a> to view your profile.
      </div>
    `;
    return;
  }

  // show loading state
  container.innerHTML = `
    <h2 class="mt-4">Your Profile</h2>
    <p class="text-info">Loading profile…</p>
  `;

  ;(async () => {
    try {
      // 1) Fetch user profile
      const profileRes = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}));
        throw new Error(err.error || profileRes.statusText);
      }
      const user = await profileRes.json();

      // render profile header and placeholder for videos
      container.innerHTML = `
        <h2 class="mt-4">${user.name}</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <h3 class="mt-5">Your Videos</h3>
        <div id="video-list" class="row g-3">
          <p class="text-muted">Loading videos…</p>
        </div>
      `;

      // 2) Fetch all videos, then filter by uploadedBy._id
      const vidsRes = await fetch('/api/videos');
      if (!vidsRes.ok) {
        const err = await vidsRes.json().catch(() => ({}));
        throw new Error(err.error || vidsRes.statusText);
      }
      const videos = await vidsRes.json();
      const userVideos = videos.filter(v => 
        v.uploadedBy && v.uploadedBy._id === user._id
      );

      // 3) Populate the grid
      const listEl = container.querySelector('#video-list');
      listEl.innerHTML = '';
      if (userVideos.length === 0) {
        listEl.innerHTML = `
          <p class="text-muted">
            You haven’t uploaded any videos yet. 
            <a href="#/upload" class="link-primary">Upload one now</a>.
          </p>
        `;
      } else {
        userVideos.forEach(v => {
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
                <a 
                  href="#/video/${v._id}" 
                  class="btn btn-primary btn-sm mt-auto"
                >
                  View
                </a>
              </div>
            </div>
          `;
          listEl.appendChild(col);
        });
      }

    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger mt-4">
          Error loading profile: ${err.message}
        </div>
      `;
    }
  })();
}
