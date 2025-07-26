// src/pages/VideoView.js
export default function VideoView(root, id) {
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container';
  root.appendChild(container);

  const token   = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  container.innerHTML = `<p class="text-info mt-4">Loading video…</p>`;

  (async () => {
    try {
      // 1) Load video
      const resVid = await fetch(`/api/videos/${id}`, { headers });
      if (!resVid.ok) {
        const err = await resVid.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load video');
      }
      const vid = await resVid.json();

      // 2) Render page
      container.innerHTML = `
        <h2 class="mt-4">${vid.title}</h2>
        <div class="position-relative ratio ratio-16x9 mb-3">
          <video id="player" controls src="${vid.url}" style="width:100%"></video>
          <div
            id="caption-overlay"
            style="
              position:absolute;
              bottom:40px;
              width:100%;
              text-align:center;
              color:white;
              text-shadow:0 0 5px black;
              font-size:1.2rem;
              pointer-events:none;
            "
          ></div>
        </div>
        <p>${vid.description || ''}</p>
        <p class="text-muted mb-1">
          Uploaded by ${vid.uploadedBy.name} on
          ${new Date(vid.uploadedAt).toLocaleString()}
        </p>
        <p class="text-muted">👁️ Views: ${vid.viewCount}</p>

        ${vid.kind === 'regular' ? `
        <div id="summary-section" class="mb-4">
          <button id="summary-btn" class="btn btn-secondary btn-sm mb-2">
            Record & Summarize
          </button>
          <div
            id="summary-text"
            class="alert alert-secondary"
            style="display:none;"
          ></div>
        </div>

        <div id="caption-section" class="mb-4">
          <button id="caption-btn" class="btn btn-secondary btn-sm">
            Toggle Captions
          </button>
        </div>
        ` : ''}

        <div id="action-buttons" class="mb-4"></div>

        <!-- Reactions -->
        <div id="reaction-section" class="mb-3">
          <button id="like-btn" class="btn btn-outline-primary btn-sm me-2">
            👍 <span id="likes-count">0</span>
          </button>
          <button id="dislike-btn" class="btn btn-outline-danger btn-sm">
            👎 <span id="dislikes-count">0</span>
          </button>
        </div>

        <!-- Rating -->
        <div id="rating-section" class="mb-3">
          <label for="rating-input">Rate this video:</label>
          <select
            id="rating-input"
            class="form-select w-auto d-inline-block ms-2"
          >
            <option value="">–</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button id="submit-rating" class="btn btn-sm btn-primary ms-2">
            Submit
          </button>
          <span class="ms-3">
            Avg: <strong id="avg-rating">0</strong>
            (<span id="rating-count">0</span> ratings)
          </span>
        </div>

        <!-- Comments -->
        <div id="comments-section" class="mt-4">
          <h5>Comments</h5>
          <div id="comments-list" class="mb-3"></div>
          <form id="comment-form">
            <div class="mb-3">
              <textarea
                id="comment-text"
                class="form-control"
                rows="2"
                placeholder="Add a comment…"
                required
              ></textarea>
            </div>
            <button class="btn btn-sm btn-primary">Comment</button>
          </form>
        </div>
      `;

      const videoEl = document.getElementById('player');

      // 3) Summary logic
      if (vid.kind === 'regular') {
        const summaryBtn  = document.getElementById('summary-btn');
        const summaryText = document.getElementById('summary-text');

        summaryBtn.addEventListener('click', () => {
          let transcript = '';
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SR) {
            summaryText.textContent = 'SpeechRecognition not supported';
            summaryText.style.display = 'block';
            return;
          }
          const recog = new SR();
          recog.continuous     = true;
          recog.interimResults = false;
          recog.lang           = 'en-US';

          recog.onresult = e => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
              transcript += e.results[i][0].transcript + ' ';
            }
          };
          recog.onerror = () => {/* aborted is normal when we stop() */};

          // reset & play
          videoEl.currentTime = 0;
          videoEl.play();
          recog.start();
          summaryBtn.disabled    = true;
          summaryBtn.textContent = 'Recording…';

          videoEl.onended = async () => {
            recog.stop();
            summaryBtn.textContent = 'Summarizing…';

            try {
              const res = await fetch(`/api/videos/${id}/summary`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...headers
                },
                body: JSON.stringify({ transcript })
              });
              if (!res.ok) throw new Error('Summary failed');
              const { summary } = await res.json();
              summaryText.textContent = summary;
            } catch (err) {
              summaryText.textContent = 'Error: ' + err.message;
            } finally {
              summaryText.style.display = 'block';
              summaryBtn.disabled       = false;
              summaryBtn.textContent    = 'Record & Summarize';
            }
          };
        });
      }

      // 4) Caption logic
      if (vid.kind === 'regular') {
        const captionBtn     = document.getElementById('caption-btn');
        const captionOverlay = document.getElementById('caption-overlay');
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SR) {
          captionBtn.disabled    = true;
          captionBtn.textContent = 'Captions not supported';
        } else {
          const recog = new SR();
          recog.continuous     = true;
          recog.interimResults = true;
          recog.lang           = 'en-US';

          recog.onresult = e => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
              interim += e.results[i][0].transcript + ' ';
            }
            captionOverlay.textContent = interim;
          };
          recog.onerror = () => {/* ignore aborted */}

          let captionsOn = false;
          captionBtn.addEventListener('click', () => {
            if (captionsOn) {
              recog.stop();
              captionsOn = false;
              captionBtn.textContent = 'Toggle Captions';
              captionOverlay.textContent = '';
            } else {
              recog.start();
              captionsOn = true;
              captionBtn.textContent = 'Stop Captions';
            }
          });
          videoEl.onpause = videoEl.onended = () => {
            if (captionsOn) {
              recog.stop();
              captionsOn = false;
              captionBtn.textContent = 'Toggle Captions';
              captionOverlay.textContent = '';
            }
          };
        }
      }

      // 5) Wire up reactions, rating, comments, delete…
     // Helper to fetch & render reactions
      async function loadReactions() {
        const res = await fetch(`/api/videos/${id}/reactions`, { headers });
        const { likes, dislikes, userReaction } = await res.json();
        document.getElementById('likes-count').textContent = likes;
        document.getElementById('dislikes-count').textContent = dislikes;
        // highlight user’s current reaction
        document
          .getElementById('like-btn')
          .classList.toggle('active', userReaction === 'like');
        document
          .getElementById('dislike-btn')
          .classList.toggle('active', userReaction === 'dislike');
      }

      // Helper to fetch & render rating
      async function loadRating() {
        const res = await fetch(`/api/videos/${id}/rating`, { headers });
        const { average, count, userRating } = await res.json();
        document.getElementById('avg-rating').textContent   = average;
        document.getElementById('rating-count').textContent = count;
        if (userRating) {
          document.getElementById('rating-input').value = userRating;
        }
      }

      // Helper to fetch & render comments
      async function loadComments() {
        const res = await fetch(`/api/videos/${id}/comments`);
        const comments = await res.json();
        const list = document.getElementById('comments-list');
        list.innerHTML = comments.length
          ? comments
              .map(
                c => `
              <div class="mb-2">
                <strong>${c.name}</strong>
                <small class="text-muted"> • ${new Date(
                  c.createdAt
                ).toLocaleString()}</small>
                <p class="mb-1">${c.text}</p>
              </div>
            `
              )
              .join('')
          : `<p class="text-muted">No comments yet.</p>`;
      }

      // Wire up reaction buttons
      document.getElementById('like-btn').onclick = async () => {
        await fetch(`/api/videos/${id}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ type: 'like' })
        });
        loadReactions();
      };
      document.getElementById('dislike-btn').onclick = async () => {
        await fetch(`/api/videos/${id}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ type: 'dislike' })
        });
        loadReactions();
      };

      // Wire up rating
      document.getElementById('submit-rating').onclick = async () => {
        const val = document.getElementById('rating-input').value;
        if (!val) return;
        await fetch(`/api/videos/${id}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ value: val })
        });
        loadRating();
      };

      // Wire up comments
      document.getElementById('comment-form').onsubmit = async e => {
        e.preventDefault();
        const text = document.getElementById('comment-text').value.trim();
        if (!text) return;
        await fetch(`/api/videos/${id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ text })
        });
        document.getElementById('comment-text').value = '';
        loadComments();
      };

      // Initial loads
      await Promise.all([
        loadReactions(),
        loadRating(),
        loadComments()
      ]);
      // If you had a delete button:
      if (token && JSON.parse(localStorage.getItem('user') || '{}').id === vid.uploadedBy._id) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-danger';
        btn.textContent = 'Delete Video';
        document.getElementById('action-buttons').appendChild(btn);
        btn.onclick = async () => {
          if (!confirm('Really delete?')) return;
          const delRes = await fetch(`/api/videos/${id}`, {
            method: 'DELETE',
            headers
          });
          if (!delRes.ok) throw new Error('Delete failed');
          alert('Video deleted');
          window.location.hash = '#/home';
        };
      }

    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger mt-4">
          ${err.message}
        </div>
      `;
    }
  })();
}
