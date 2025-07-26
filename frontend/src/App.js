// src/App.js
import NavBar from './components/NavBar.js';
import Home from './pages/Home.js';
import VideoView from './pages/VideoView.js';
import Profile from './pages/Profile.js';
import Upload from './pages/Upload.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import History   from './pages/History.js';
import Shorts    from './pages/Shorts.js';
export default function App() {
  const root = document.getElementById('app');
  function router() {
    root.innerHTML = '';
    NavBar(root);

    const [_, route, id] = location.hash.split('/');
    switch (route) {
            case 'shorts':
        Shorts(root);
        break;
           case 'history':
       History(root);
       break;
      case 'video':
        VideoView(root, id);
        break;
      case 'upload':
        Upload(root);
        break;
      case 'profile':
        Profile(root);
        break;
      case 'login':
        Login(root);
        break;
      case 'register':
        Register(root);
        break;
      case 'home':
      default:
        Home(root);
    }
  }

  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);
}
