import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Імпорт сторінок
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Ideas } from './pages/Ideas';
import { Admin } from './pages/Admin';
import { Wishlists } from './pages/Wishlists';
import { Sidebar } from './components/Sidebar';
import { UserAvatar } from './components/UserAvatar';
import { WishlistCreate } from './pages/WishlistCreate';

// Компонент-обгортка для захисту маршруту
const ProtectedAdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  
  // Якщо роль не ADMIN, перенаправляємо на головну
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Імпорт зображень (Home)
import present1 from './assets/present_1.png';
import present2 from './assets/present_2.png';
import blam from './assets/blam.png';

const Home = () => (
  <main className="content-area flex-grow-1 p-5 position-relative">
    <div className="left-decor">
      <img src={blam} alt="" className="img-blam" />
      <img src={present1} alt="" className="img-present-1" />
    </div>
    <div className="text-content">
      <h1 className="main-title mb-5">
        Дозволь своїм мріям бути почутими!<br />
        Твій DreamSpace чекає на перше бажання
      </h1>
      <ul className="feature-list">
        <li>Зберігай те, що справді хочеш, і більше не губи свої мрії серед щоденних справ.</li>
        <li>Створюй власні списки бажань, ділися ними з близькими та надихайся ідеями інших.</li>
        <li>Уникай невдалих покупок, але зберігай ефект сюрпризу завдяки бронюванню.</li>
        <li>Твої бажання — в одному місці, зрозумілі для тебе і почуті іншими.</li>
      </ul>
    </div>
    <img src={present2} alt="" className="img-present-2" />
  </main>
);

const AppContent = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const user = {
    name: localStorage.getItem('userName') || 'Гість',
    photoUrl: localStorage.getItem('userPhoto')
  };

  const isAuthPage = ['/register', '/login', '/resetpassword'].includes(location.pathname);

  return (
    <div className="app-container min-vh-100 d-flex flex-column">
      
      {!isAuthPage && (
        <header className="header-zone py-3 px-4 bg-white border-bottom shadow-sm d-flex justify-content-between align-items-center">
          <NavLink to="/" className="text-decoration-none">
            <h2 className="logo-text m-0">Dream<br/>Space</h2>
          </NavLink>
          
          {/* Аватар з'являється, якщо користувач залогінений */}
          {token && (
            <div className="ms-auto">
              <UserAvatar user={user} />
            </div>
          )}
        </header>
      )}

      <div className="main-layout d-flex flex-grow-1">
        
        {!isAuthPage && (
          <aside className="sidebar-zone px-4 py-5 bg-white border-right" style={{ width: '250px' }}>
            <nav className="nav flex-column gap-3">
              
              {!token ? (
                <>
                  <NavLink to="/register" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-person-plus"></i> <span>Реєстрація</span>
                  </NavLink>
                  <NavLink to="/login" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-key"></i> <span>Вхід</span>
                  </NavLink>
                  <NavLink to="/ideas" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-star"></i> <span>Ідеї</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/wishlists" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-book"></i> <span>Вішлісти</span>
                  </NavLink>
                  <NavLink to="/ideas" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-star"></i> <span>Ідеї</span>
                  </NavLink>
                  <NavLink to="/booked" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-gift"></i> <span>Заброньовані</span>
                  </NavLink>
                  <NavLink to="/profile" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-person"></i> <span>Профіль</span>
                  </NavLink>

                  {role === 'ADMIN' && (
                    <NavLink to="/admin" className={({isActive}) => `nav-link border-0 mt-4 text-danger ${isActive ? 'active' : ''}`}>
                      <i className="bi bi-shield-lock"></i> <span>Адмін панель</span>
                    </NavLink>
                  )}
                  
                  <button 
                    className="nav-link border-0 bg-transparent mt-auto text-muted text-start p-0"
                    onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                  >
                    <i className="bi bi-box-arrow-right"></i> <span>Вийти</span>
                  </button>
                </>
              )}
            </nav>
          </aside>
        )}

        <div className={`content-wrapper flex-grow-1 d-flex flex-column ${isAuthPage ? 'auth-bg' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={token ? <Navigate to="/wishlists" replace /> : <Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/wishlists" element={<Wishlists/>}/>
            <Route path="/wishlists/create" element={<WishlistCreate />} />
            <Route path="/booked" element={<div className="p-5">Сторінка Заброньованих</div>} />
            <Route path="/profile" element={<div className="p-5">Сторінка Профілю</div>} />
            <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;