import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Імпорт сторінок
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Ideas } from './pages/Ideas';

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
  // Визначаємо, чи є поточна сторінка частиною процесу авторизації
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login' || location.pathname === '/resetpassword';

  return (
    <div className="app-container min-vh-100 d-flex flex-column">
      
      {/* Хедер та Сайдбар відображаємо тільки для Home та внутрішніх сторінок (напр. Ideas) */}
      {!isAuthPage && (
        <header className="header-zone py-3 px-4 bg-white border-bottom shadow-sm">
          <NavLink to="/" className="text-decoration-none">
            <h2 className="logo-text m-0">Dream<br/>Space</h2>
          </NavLink>
        </header>
      )}

      <div className="main-layout d-flex flex-grow-1">
        
        {/* Бічна панель: відображається ТІЛЬКИ на не-авторизаційних сторінках */}
        {!isAuthPage && (
          <aside className="sidebar-zone px-4 py-5 bg-white border-right">
            <nav className="nav flex-column gap-3">
              <NavLink to="/register" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                <i className="bi bi-person-plus"></i>
                <span>Реєстрація</span>
              </NavLink>
              <NavLink to="/login" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                <i className="bi bi-key"></i>
                <span>Вхід</span>
              </NavLink>
              <NavLink to="/ideas" className={({isActive}) => `nav-link border-0 ${isActive ? 'active' : ''}`}>
                <i className="bi bi-star"></i>
                <span>Ідеї</span>
              </NavLink>
            </nav>
          </aside>
        )}

        {/* Область контенту: займає 100% ширини на сторінках Login/Register */}
        <div className={`content-wrapper flex-grow-1 d-flex flex-column ${isAuthPage ? 'auth-bg' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/resetpassword" element={<div className="p-5">Сторінка відновлення пароля (заглушка)</div>} />
            {/* Перенаправлення на 404 або Home для неіснуючих шляхів */}
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