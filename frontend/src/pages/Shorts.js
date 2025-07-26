// src/pages/Shorts.js
export default function Shorts(root) {
  // clear root
  root.innerHTML = '';

  // container
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.height   = '100vh';
  container.style.backgroundColor = 'black';
  root.appendChild(container);

  // video element
  const videoEl = document.createElement('video');
  videoEl.id = 'short-video';
  Object.assign(videoEl, {
    autoplay: true,
    muted:    false,
    controls: false,
    loop:     false,
  });
  Object.assign(videoEl.style, {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  });
  container.appendChild(videoEl);

  // info overlay (title & views)
  const infoDiv = document.createElement('div');
  Object.assign(infoDiv.style, {
    position: 'absolute',
    bottom:   '20px',
    left:     '20px',
    color:    'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding:  '10px',
    borderRadius: '5px',
    zIndex:   '10',
    maxWidth: '80%'
  });
  container.appendChild(infoDiv);

  // prev button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.className = 'btn btn-light';
  Object.assign(prevBtn.style, {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    zIndex: '10',
    opacity: '0.7'
  });
  container.appendChild(prevBtn);

  // next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.className = 'btn btn-light';
  Object.assign(nextBtn.style, {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    zIndex: '10',
    opacity: '0.7'
  });
  container.appendChild(nextBtn);

  // fetch shorts and set up controls
  (async () => {
    let idx = 0;
    let videos = [];

    try {
      const res = await fetch('/api/videos?kind=short');
      if (!res.ok) throw new Error('Failed to load shorts');
      videos = await res.json();
    } catch (err) {
      container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
          <p class="text-white">Error loading shorts: ${err.message}</p>
        </div>
      `;
      return;
    }

    if (videos.length === 0) {
      container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
          <p class="text-white">No shorts available.</p>
        </div>
      `;
      return;
    }

    function showVideo(i) {
      idx = (i + videos.length) % videos.length;
      const v = videos[idx];
      videoEl.src = v.url;
      infoDiv.innerHTML = `<h5 class="mb-1">${v.title}</h5>
                           <small>👁️ ${v.viewCount} views</small>`;
      videoEl.play().catch(() => {});
    }

    prevBtn.addEventListener('click', () => showVideo(idx - 1));
    nextBtn.addEventListener('click', () => showVideo(idx + 1));
    videoEl.addEventListener('ended', () => showVideo(idx + 1));

    // initial
    showVideo(0);
  })();
}
