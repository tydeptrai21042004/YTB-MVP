// src/pages/Home.js
export default function Home(root) {
  // clear & container
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';
  root.appendChild(container);

  // initial UI with Trending, Shorts, and All Videos
  container.innerHTML = `
    <h2 class="mt-4">Top Trending</h2>
    <div id="trending-list" class="row g-3 mb-5">
      <p class="text-muted">Loading trending videos…</p>
    </div>

    <h2>Shorts</h2>
    <div id="shorts-list" class="row g-3 mb-5">
      <p class="text-muted">Loading shorts…</p>
    </div>

    <h2>All Videos</h2>
    <div class="input-group mb-3">
      <input
        id="search-input"
        type="text"
        class="form-control"
        placeholder="Search videos…"
      >
      <button id="search-btn" class="btn btn-outline-secondary">
        Search
      </button>
    </div>
    <div id="video-list" class="row g-3">
      <p class="text-muted">Loading videos…</p>
    </div>
  `;

  const searchInput    = container.querySelector('#search-input');
  const searchBtn      = container.querySelector('#search-btn');
  const trendingListEl = container.querySelector('#trending-list');
  const shortsListEl   = container.querySelector('#shorts-list');
  const listEl         = container.querySelector('#video-list');

  let allVideos = [];

  // render a set of videos into a given container element
  function renderCards(el, videos) {
    if (!videos.length) {
      el.innerHTML = `<p class="text-muted">No videos to show.</p>`;
      return;
    }
    el.innerHTML = '';
    videos.forEach(v => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100">
          <video
            class="card-img-top"
            src="${v.url}"
            controls
            style="height:150px; object-fit:cover;"
          ></video>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${v.title}</h5>
            <p class="card-text text-muted mb-1">
              by ${v.uploadedBy.name}
            </p>
            <p class="card-text mb-2">
              <small class="text-muted">👁️ ${v.viewCount} views</small>
            </p>
            <a
              href="#/video/${v._id}"
              class="btn btn-primary btn-sm mt-auto"
            >
              View
            </a>
          </div>
        </div>
      `;
      el.appendChild(col);
    });
  }

  // fetch all videos once
  async function fetchAll() {
    trendingListEl.innerHTML = `<p class="text-info">Loading trending videos…</p>`;
    shortsListEl.innerHTML   = `<p class="text-info">Loading shorts…</p>`;
    listEl.innerHTML         = `<p class="text-info">Loading videos…</p>`;

    try {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      allVideos = await res.json();

      // Trending: top 5 by viewCount
      const top5 = [...allVideos]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);
      renderCards(trendingListEl, top5);

      // Shorts: all videos where kind === 'short'
      const shorts = allVideos.filter(v => v.kind === 'short');
      renderCards(shortsListEl, shorts);

      // All Videos: unfiltered
      renderCards(listEl, allVideos);

    } catch (err) {
      const errHtml = `
        <div class="alert alert-danger">
          ${err.message}
        </div>
      `;
      trendingListEl.innerHTML = errHtml;
      shortsListEl.innerHTML   = errHtml;
      listEl.innerHTML         = errHtml;
    }
  }

  // filter & render videos based on search
  function searchAndRender() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = q
      ? allVideos.filter(v => v.title.toLowerCase().includes(q))
      : allVideos;
    renderCards(listEl, filtered);
  }

  // wire up search
  searchBtn.addEventListener('click', searchAndRender);
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAndRender();
    }
  });

  // kick things off
  fetchAll();
}
