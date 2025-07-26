// src/components/NavBar.js
export default function NavBar() {
  // only create one nav element
  let nav = document.getElementById('navbar');
  if (!nav) {
    nav = document.createElement('nav');
    nav.id = 'navbar';
    nav.className = 'navbar navbar-expand-lg navbar-light bg-light mb-4';
    Object.assign(nav.style, {
      position: 'fixed',
      top: '-100px',       // hidden by default
      left: '0',
      width: '100%',
      zIndex: '1000',
      transition: 'top 0.3s ease-in-out'
    });
    document.body.appendChild(nav);
  }

  // check login status
  const token = localStorage.getItem('token');
  const loggedIn = Boolean(token);

  // build the inner HTML with conditional links
  nav.innerHTML = `
    <div class="container-fluid">
      <a class="navbar-brand" href="#/home">YouTube MVP</a>
      <button
        class="navbar-toggler" type="button"
        data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="#/home">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#/shorts">Shorts</a></li>
          <li class="nav-item"><a class="nav-link" href="#/upload">Upload</a></li>
          ${loggedIn
            ? `<li class="nav-item">
                 <a class="nav-link" href="#/profile">Profile</a>
               </li>
                           <li class="nav-item">
              <a class="nav-link" href="#/history">History</a>
            </li>
               <li class="nav-item">
                 <a id="logout-link" class="nav-link" href="#">Logout</a>
               </li>`
            : `<li class="nav-item">
                 <a class="nav-link" href="#/login">Login</a>
               </li>
               <li class="nav-item">
                 <a class="nav-link" href="#/register">Register</a>
               </li>`
          }
        </ul>
      </div>
    </div>
  `;

  // attach logout handler
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/home';
    });
  }

  // add a single mousemove listener to show/hide the nav
  if (!window.navListenerAdded) {
    window.navListenerAdded = true;
    document.addEventListener('mousemove', e => {
      const navEl = document.getElementById('navbar');
      if (!navEl) return;
      // if mouse within 50px of top → slide nav into view
      if (e.clientY <= 50) {
        navEl.style.top = '0';
      }
      // if mouse away below nav height + 50px → hide again
      else if (e.clientY > navEl.offsetHeight + 50) {
        navEl.style.top = '-100px';
      }
    });
  }
}
