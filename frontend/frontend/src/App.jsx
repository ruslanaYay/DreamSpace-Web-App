import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Імпорт зображень з правильними назвами
import present1 from './assets/present_1.png';
import present2 from './assets/present_2.png';
import blam from './assets/blam.png';

const App = () => {
  const [activeItem, setActiveItem] = useState('ideas');

  const menuItems = [
    { id: 'reg', label: 'Реєстрація', icon: 'bi-person-plus' },
    { id: 'login', label: 'Вхід', icon: 'bi-key' },
    { id: 'ideas', label: 'Ідеї', icon: 'bi-star' },
  ];

  return (
    <div className="app-wrapper min-vh-100 d-flex flex-column">
      
      {/* Логотип окремо зверху (Header) */}
      <header className="py-3 px-4 bg-white border-bottom shadow-sm">
        <h2 className="logo-text m-0">Dream<br/>Space</h2>
      </header>

      <div className="d-flex flex-grow-1 position-relative">
        
        {/* Бічна панель */}
        <aside className="sidebar px-4 py-5 bg-white">
          <nav className="nav flex-column gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`nav-link border-0 ${activeItem === item.id ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Контентна частина */}
        <main className="content-area flex-grow-1 p-5 position-relative">
          
          {/* Група зображень зліва: Пляма + Подарунок 1 */}
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

          {/* Подарунок 2 знизу справа */}
          <img src={present2} alt="" className="img-present-2" />
          
        </main>
      </div>
    </div>
  );
};

export default App;